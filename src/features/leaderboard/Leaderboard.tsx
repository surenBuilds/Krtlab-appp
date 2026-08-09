import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Flame, Medal, Crown, Zap, Award } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";

interface LeaderboardEntry { rank: number; name: string; xp: number; streak: number; level: number; skills: number; isCurrentUser: boolean; }
const MOCK = [{name:"Արամ",xp:28400,streak:45,level:12,skills:8},{name:"Մարիամ",xp:22100,streak:32,level:10,skills:7},{name:"Դավիթ",xp:18900,streak:28,level:9,skills:6},{name:"Աննա",xp:15600,streak:21,level:8,skills:5},{name:"Գոռ",xp:12300,streak:18,level:7,skills:5},{name:"Նարե",xp:9800,streak:14,level:6,skills:4},{name:"Տիգրան",xp:7200,streak:10,level:5,skills:3},{name:"Լիլիթ",xp:5400,streak:8,level:5,skills:3},{name:"Հայկ",xp:3100,streak:5,level:4,skills:2},{name:"Սոնա",xp:1800,streak:3,level:3,skills:2}];

export const Leaderboard: React.FC = () => {
  const { profile } = useUserProfile();
  const [view, setView] = useState<"xp"|"streak"|"skills">("xp");
  const lb: LeaderboardEntry[] = useMemo(() => {
    const a: LeaderboardEntry[] = MOCK.map((u,i)=>({...u,rank:i+1,isCurrentUser:false}));
    if(profile?.name) a.push({rank:0,name:profile.name,xp:profile.xp||0,streak:profile.streak||0,level:profile.level||1,skills:((profile as any)?.strengths?.length||0),isCurrentUser:true});
    a.sort((a,b)=>view==="xp"?b.xp-a.xp:view==="streak"?b.streak-a.streak:b.skills-a.skills);
    return a.map((e,i)=>({...e,rank:i+1}));
  },[profile,view]);
  const ur = lb.find(e=>e.isCurrentUser);
  return<div className="space-y-8"><div><h2 className="text-4xl font-black flex items-center gap-3"><Trophy className="text-amber-500" size={32}/>Leaderboard</h2><p className="text-slate-500 mt-2">Մրցակցիր, բարձրացիր, դարձիր լավագույնը</p></div>
  {ur&&<div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.5rem] p-8 shadow-xl shadow-amber-200 text-white"><div className="flex items-center gap-6"><div className="text-6xl font-black">#{ur.rank}</div><div><h3 className="text-2xl font-black">{profile?.name}</h3><p className="text-white/80">Your rank</p></div><div className="ml-auto flex gap-6"><div className="text-center"><div className="text-3xl font-black">{profile?.xp||0}</div><div className="text-xs text-white/60">XP</div></div><div className="text-center"><div className="text-3xl font-black">{profile?.streak||0}d</div><div className="text-xs text-white/60">Streak</div></div></div></div></div>}
  <div className="flex gap-3">{[{k:"xp",l:"XP",icon:Zap},{k:"streak",l:"Streak",icon:Flame},{k:"skills",l:"Skills",icon:Award}].map(v=><button key={v.k} onClick={()=>setView(v.k as any)} className={cn("px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2",view===v.k?"bg-slate-900 text-white":"bg-white border text-slate-500 hover:bg-slate-50")}><v.icon size={16}/>{v.l}</button>)}</div>
  <div className="space-y-3">{lb.slice(0,15).map(e=><motion.div key={e.name} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className={cn("flex items-center gap-4 p-5 rounded-2xl bg-white border",e.isCurrentUser?"border-primary bg-primary/5 shadow-lg":"border-slate-100 shadow-sm")}><div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",e.rank===1?"bg-amber-100 text-amber-700":e.rank===2?"bg-slate-200 text-slate-700":e.rank===3?"bg-orange-100 text-orange-700":"bg-slate-50 text-slate-500")}>{e.rank<=3?<Medal size={18}/>:e.rank}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-black text-slate-900">{e.name}</span>{e.isCurrentUser&&<span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg">Դուք</span>}{e.rank<=3&&<Crown size={14} className={e.rank===1?"text-amber-500":e.rank===2?"text-slate-400":"text-orange-500"}/>}</div><div className="flex items-center gap-3 mt-1 text-xs text-slate-400"><span>Lv.{e.level}</span><span>🔥{e.streak}d</span><span>⭐{e.skills}</span></div></div><div className="text-right"><div className="text-xl font-black text-slate-900">{e.xp.toLocaleString()}</div><div className="text-xs text-slate-400">XP</div></div></motion.div>)}</div></div>;
};
export default Leaderboard;
