/**
 * KrtLab Intelligence Engine — Phase 1 Core
 * Goals → Skill Graph → Learning Path → Daily Missions → Progress
 */

import { SKILL_DEFINITIONS, SUBFIELD_SKILL_MAP } from "../data/skillMappings";
import type { GrowthProfile, Goal, SkillEvidence, SkillLevel, Priority } from "../types/domain";

export interface DecomposedGoal {
  goal: Goal;
  requiredSkills: { skillId: string; targetLevel: number; priority: Priority }[];
  milestones: { title: string; skills: string[]; estimatedWeeks: number; order: number }[];
  learningPlan: { week: number; focus: string; skills: string[]; tasks: string[] }[];
  totalWeeks: number;
}

const CAREER_SKILLS: Record<string, { skills: string[]; weeks: number }> = {
  programmer: { skills: ["python-programming","javascript","web-development","ai-ml","data-analysis"], weeks: 12 },
  ai_engineer: { skills: ["python-programming","ai-ml","data-analysis","cloud-computing","critical-thinking"], weeks: 12 },
  data_scientist: { skills: ["python-programming","data-analysis","ai-ml","mathematics","critical-thinking"], weeks: 10 },
  web_developer: { skills: ["javascript","web-development","python-programming","communication","time-management"], weeks: 8 },
  designer: { skills: ["graphic-design","video-production","communication","time-management"], weeks: 8 },
  lawyer: { skills: ["law","critical-thinking","communication","psychology","leadership"], weeks: 16 },
  entrepreneur: { skills: ["entrepreneurship","marketing","sales","leadership","strategic-management"], weeks: 12 },
};

function getSkillName(skillId: string): string { return SKILL_DEFINITIONS!.find(s => s.id === skillId)?.name || skillId; }

export function decomposeGoal(goalText: string, category: string, deadlineWeeks: number | null, _cs: string[]): DecomposedGoal {
  const weeks = deadlineWeeks || 12;
  const match = Object.entries(CAREER_SKILLS).find(([k]) => goalText.toLowerCase().includes(k.replace("_"," ")) || category === k);
  const skillIds = match ? match[1].skills : ["critical-thinking","communication","time-management","leadership"];
  const totalWeeks = match ? match[1].weeks : weeks;
  const requiredSkills = skillIds.map((sid,i)=>({skillId:sid,targetLevel:70+(i*3),priority:(i<3?"high":"medium") as Priority}));
  const milestones = skillIds.map((sid,i)=>({title:`Master ${getSkillName(sid)}`,skills:[sid],estimatedWeeks:Math.ceil(totalWeeks/skillIds.length),order:i+1}));
  const learningPlan: {week:number;focus:string;skills:string[];tasks:string[]}[] = [];
  for(let w=0;w<totalWeeks;w++){const si=w%skillIds.length;learningPlan.push({week:w+1,focus:getSkillName(skillIds[si]),skills:[skillIds[si]],tasks:[`Learn ${getSkillName(skillIds[si])} fundamentals`,"Complete 3 practice exercises","Take assessment quiz","Review mistakes"]});}
  const goal: Goal = {id:crypto.randomUUID?.()||`goal-${Date.now()}`,title:goalText,description:`AI-decomposed: ${goalText}`,category:category as Goal["category"],status:"active",priority:"high",progress:0,linkedSkillIds:skillIds,linkedProjectIds:[],linkedHabitIds:[],difficulty:"intermediate",estimatedHours:totalWeeks*10,tasks:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  return {goal,requiredSkills,milestones,learningPlan,totalWeeks};
}

export interface SkillBaseline {skillId:string;name:string;category:string;masteryScore:number;confidence:"low"|"medium"|"high";evidenceCount:number;lastAssessed:string|null;}

export function diagnoseSkills(profile:GrowthProfile): SkillBaseline[] {
  const baselines:SkillBaseline[]=[];
  for(const def of SKILL_DEFINITIONS!){
    let masteryScore=0,evidenceCount=0;
    const mappings=SUBFIELD_SKILL_MAP!.filter(m=>m.skills.some(s=>s.skillId===def.id));
    for(const mapping of mappings){
      const catProgress=(profile as any)?.progress?.categories?.[mapping.categoryId];if(!catProgress)continue;
      const subfield=catProgress.subfields?.[mapping.subfieldId];if(!subfield)continue;
      const completedCount=subfield.completedLessons?.length||0;const quizAvg=subfield.accuracy||0;
      masteryScore+=Math.min(100,(completedCount*3)+(quizAvg*0.5));evidenceCount+=completedCount;
    }
    baselines.push({skillId:def.id,name:def.name,category:def.category,masteryScore:Math.min(100,Math.round(masteryScore)),confidence:masteryScore>50?"high":masteryScore>20?"medium":"low",evidenceCount,lastAssessed:profile.lastActive||null});
  }
  return baselines.sort((a,b)=>b.masteryScore-a.masteryScore);
}

export interface SkillNode {skillId:string;name:string;category:string;masteryScore:number;levelLabel:SkillLevel;prerequisites:string[];dependencies:string[];evidence:SkillEvidence[];}

export function buildSkillGraph(profile:GrowthProfile):SkillNode[]{const baseline=diagnoseSkills(profile);const nodes:SkillNode[]=[];for(const bl of baseline){const def=SKILL_DEFINITIONS!.find(d=>d.id===bl.skillId);if(!def)continue;const same=SKILL_DEFINITIONS!.filter(s=>s.category===def.category&&s.id!==def.id);nodes.push({skillId:def.id,name:def.name,category:def.category,masteryScore:bl.masteryScore,levelLabel:bl.masteryScore>70?"advanced":bl.masteryScore>40?"intermediate":"beginner",prerequisites:same.slice(0,2).map(s=>s.id),dependencies:same.slice(0,2).map(s=>s.id),evidence:[]});}return nodes;}

export type ActionType="teach"|"practice"|"project"|"assess"|"review"|"advance";
export interface NextAction {type:ActionType;skillId:string;skillName:string;reason:string;suggestedTask:string;priority:Priority;urgency:"now"|"today"|"this_week"|"next_week";}

export function computeNextAction(sg:SkillNode[],goals:Goal[],rm:string[]=[],_t:number=30):NextAction{
  const ag=goals.filter(g=>g.status==="active");const ask=new Set(ag.flatMap(g=>g.linkedSkillIds));
  let ts:SkillNode|undefined;
  if(ask.size>0){const gs=sg.filter(n=>ask.has(n.skillId));ts=gs.sort((a,b)=>a.masteryScore-b.masteryScore)[0];}
  if(!ts)ts=sg.sort((a,b)=>a.masteryScore-b.masteryScore)[0];
  if(!ts)return{type:"teach",skillId:"critical-thinking",skillName:"Critical Thinking",reason:"No skills assessed",suggestedTask:"Complete skill diagnostic",priority:"high",urgency:"now"};
  const m=ts.masteryScore;let type:ActionType,reason:string,suggestedTask:string;
  if(m<20){type="teach";reason=`${ts.name} at ${m}%`;suggestedTask=`Start learning ${ts.name}`;}
  else if(m<40){type="teach";reason=`${ts.name} at ${m}%`;suggestedTask=`Complete ${ts.name} lesson`;}
  else if(m<60){type="practice";reason=`${ts.name} at ${m}%`;suggestedTask=`Complete 3 ${ts.name} exercises`;}
  else if(m<80){type="project";reason=`${ts.name} at ${m}%`;suggestedTask=`Build project with ${ts.name}`;}
  else if(m<95){type="assess";reason=`${ts.name} near mastery`;suggestedTask=`Take ${ts.name} assessment`;}
  else{type="advance";reason=`${ts.name} mastered`;suggestedTask=`Advance to next skill`;}
  if(rm.length>0){type="review";reason=`Recent mistakes`;suggestedTask=`Review and retry`;}
  let urgency:NextAction["urgency"];if(m<30)urgency="now";else if(m<60)urgency="today";else if(m<80)urgency="this_week";else urgency="next_week";
  return{type,skillId:ts.skillId,skillName:ts.name,reason,suggestedTask,priority:m<50?"high":"medium",urgency};
}

export interface DailyMission {date:string;goalTitle:string;tasks:{id:string;title:string;type:"learn"|"practice"|"build"|"review"|"assess";skillId:string;completed:boolean;xpReward:number}[];quote:string;}

export function generateDailyMission(sg:SkillNode[],goals:Goal[],_p:GrowthProfile):DailyMission{
  const na=computeNextAction(sg,goals);const ag=goals.find(g=>g.status==="active");
  const tt:DailyMission["tasks"][0]["type"]=na.type==="teach"||na.type==="advance"?"learn":na.type==="practice"?"practice":na.type==="project"?"build":na.type==="review"?"review":"assess";
  const tasks:DailyMission["tasks"]=[
    {id:`t-${Date.now()}`,title:na.suggestedTask,type:tt,skillId:na.skillId,completed:false,xpReward:50},
    {id:`t-${Date.now()+1}`,title:`Practice ${na.skillName} — 3 exercises`,type:"practice",skillId:na.skillId,completed:false,xpReward:30},
    {id:`t-${Date.now()+2}`,title:`Review yesterday's ${na.skillName}`,type:"review",skillId:na.skillId,completed:false,xpReward:15},
  ];
  const quotes=["Փոքր քայլեր, մեծ արդյունք:","Ամեն օր մի փոքր ավելի լավը:","Սովորելը ճանապարհ է:","Քո ապագան սկսվում է այսօր:"];
  return{date:new Date().toISOString().split("T")[0],goalTitle:ag?.title||"Personal Growth",tasks,quote:quotes[Math.floor(Math.random()*quotes.length)]};
}

export interface ProgressSummary {growthScore:number;skillsAssessed:number;skillsAboveThreshold:number;activeGoals:number;completedGoals:number;weeklyXp:number;nextMilestone:string|null;topStrengths:string[];topWeaknesses:string[];}

export function summarizeProgress(profile:GrowthProfile,_sg:SkillNode[],goals:Goal[]):ProgressSummary{
  const bl=diagnoseSkills(profile);const ag=goals.filter(g=>g.status==="active");
  return{growthScore:profile.growthScore||0,skillsAssessed:bl.filter(b=>b.evidenceCount>0).length,skillsAboveThreshold:bl.filter(b=>b.masteryScore>40).length,activeGoals:ag.length,completedGoals:goals.filter(g=>g.status==="completed").length,weeklyXp:Math.round(profile.xp/Math.max(1,(Date.now()-new Date(profile.createdAt).getTime())/(7*86400000))),nextMilestone:ag[0]?.title||null,topStrengths:bl.filter(b=>b.masteryScore>60).map(b=>b.name).slice(0,5),topWeaknesses:bl.filter(b=>b.masteryScore<30).map(b=>b.name).slice(0,5)};
}// Phase 1 Intelligence Core deployed
