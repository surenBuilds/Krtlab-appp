import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  BrainCircuit, Zap, Trophy, AlertCircle, Sparkles,
  Target, BookOpen, Clock, ArrowRight, TrendingUp,
  BarChart3, Star, ShieldCheck, Compass, Rocket, CheckCircle2
} from "lucide-react";
import { cn } from "../lib/utils";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  diagnoseSkills, computeMastery, computeNextAction,
  generateDailyMission, buildMentorContext, computeAnalytics,
} from "../services/krtlabEngine";
import type { LearnerProfile, SkillMastery, NextAction, DailyMission, MentorContextSnapshot } from "../types/learner";

// ── Helpers ──

function buildProfile(gp: any): LearnerProfile {
  return {
    uid: gp?.uid, name: gp?.name || "Learner", email: gp?.email,
    preferredLanguage: "hy", role: gp?.role || "student", isDemoMode: gp?.isDemoMode || false,
    xp: gp?.xp || 0, level: gp?.level || 1, streak: gp?.streak || 0, points: gp?.points || 0,
    lastStreakUpdate: gp?.lastStreakUpdate || null, growthScore: gp?.growthScore || 0, strengths: gp?.strengths || [], weaknesses: gp?.weaknesses || [],
    goals: gp?.intelligenceState?.goals?.map((g: any) => ({
      ...g, subGoals: g.subGoals || [], requiredKnowledge: g.requiredKnowledge || [],
      parentGoalId: g.parentGoalId, actualHours: g.actualHours || 0,
      learningPlan: g.learningPlan || [], aiRecommendation: g.aiRecommendation,
      aiGeneratedAt: g.aiGeneratedAt,
      milestones: g.milestones?.map((m: any) => ({ ...m, knowledge: m.knowledge || [] })) || [],
      requiredSkills: g.requiredSkills || [],
    })) || [],
    skills: gp?.intelligenceState?.skillBaseline?.map((b: any) => ({
      id: b.skillId, name: b.name, category: b.category, description: "", icon: "Brain",
      currentLevel: b.masteryScore || 0, targetLevel: 70,
      levelLabel: (b.masteryScore || 0) > 70 ? "advanced" as const : (b.masteryScore || 0) > 40 ? "intermediate" as const : "beginner" as const,
      prerequisites: [], dependencies: [], relatedKnowledge: [], evidence: [],
      hoursInvested: 0, lastPracticed: b.lastAssessed || new Date().toISOString(),
      growthRate: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    })) || [],
    mastery: [], knowledgeGraph: [],
    learningState: {
      dailyMission: { date: "", goalTitle: "", tasks: [], quote: "", completed: false },
      missionHistory: [], currentFocus: null,
      nextAction: { type: "teach", skillId: "", skillName: "", reason: "", suggestedTask: "", priority: "high", urgency: "now", format: "text" },
      nextActionHistory: [], recentLessons: [], recentMistakes: [], recentAchievements: [],
      preferredTimes: [], todayCompleted: false, updatedAt: new Date().toISOString(),
    },
    projects: [], portfolio: [],
    mentorContext: {
      profile: { name: gp?.name || "", xp: gp?.xp || 0, level: gp?.level || 1, streak: gp?.streak || 0, growthScore: 0 },
      activeGoals: [], skillSummary: [], strengths: [], weaknesses: [],
      todayMission: null, nextAction: null, recentActivity: "", updatedAt: new Date().toISOString(),
    },
    analytics: {
      weeklyXp: 0, dailyAverage: 0, totalHoursLearned: 0,
      skillsAssessed: 0, skillsAboveThreshold: 0, activeGoals: 0, completedGoals: 0,
      projectsCompleted: 0, learningVelocity: 0, streakHistory: [],
      focusAreas: [], recentImprovements: [], updatedAt: new Date().toISOString(),
    },
    createdAt: gp?.createdAt || new Date().toISOString(),
    lastActive: gp?.lastActive || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Component ──

export const CommandCenter: React.FC = () => {
  const { profile } = useUserProfile();
  const gp = profile as any;

  const state = useMemo(() => {
    const lp = buildProfile(gp);
    const skills = diagnoseSkills(lp);
    const mastery = computeMastery(skills, lp.mastery);
    const na = computeNextAction(skills, mastery, lp.goals, lp.learningState?.recentMistakes || []);
    const dailyMission = generateDailyMission(lp.goals, na, lp);
    const analytics = computeAnalytics({ ...lp, skills, mastery });
    const mentorCtx = buildMentorContext({ ...lp, skills, mastery, learningState: { ...lp.learningState, nextAction: na, dailyMission } });
    return { skills, mastery, na, dailyMission, analytics, mentorCtx };
  }, [profile]);

  const { mastery, na, dailyMission, analytics, mentorCtx } = state;

  const totalMastered = mastery.filter(m => m.overallMastery > 70).length;
  const activeGoals = gp?.intelligenceState?.goals?.filter((g: any) => g.status === "active")?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER: Where am I? ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-400/20">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">
              KrtLab Command Center
            </p>
            <h1 className="text-5xl font-black tracking-tight">
              Ողջույն, {gp?.name || "Learner"}
            </h1>
            <div className="flex gap-4 mt-4 text-slate-300 text-sm">
              <span className="flex items-center gap-1.5">
                <Compass size={14} className="text-accent"/>
                {activeGoals > 0
                  ? `${activeGoals} active goal${activeGoals > 1 ? "s" : ""}`
                  : "Set your first goal →"}
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-400"/>
                {analytics.learningVelocity} XP/day
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-white/10 backdrop-blur rounded-2xl p-5 min-w-[80px]">
              <div className="text-3xl font-black">{gp?.xp || 0}</div>
              <div className="text-xs text-slate-400 mt-1">XP</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur rounded-2xl p-5 min-w-[80px]">
              <div className="text-3xl font-black">{gp?.streak || 0}d</div>
              <div className="text-xs text-slate-400 mt-1">Streak</div>
            </div>
            <div className="text-center bg-gradient-to-br from-accent/30 to-primary/30 backdrop-blur rounded-2xl p-5 min-w-[80px]">
              <div className="text-3xl font-black">{analytics.growthScore || 0}</div>
              <div className="text-xs text-slate-400 mt-1">Score</div>
            </div>
          </div>
        </div>

        {/* ── Progress Ring ── */}
        <div className="mt-6 flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold">Growth Progress</span>
              <span className="text-xs text-slate-400">{analytics.skillsAboveThreshold}/{mastery.length} skills above threshold</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalMastered / Math.max(1, mastery.length)) * 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
              />
            </div>
          </div>
          <span className="text-2xl font-black">{totalMastered}<span className="text-sm text-slate-400">/{mastery.length}</span></span>
        </div>
      </div>

      {/* ── 5 Questions Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Q1: Where am I? */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><Compass size={16} className="text-blue-600"/></div>
            <h3 className="font-black text-sm">Where am I?</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">XP</span>
              <span className="font-bold">{gp?.xp || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Level</span>
              <span className="font-bold">Lv.{gp?.level || 1}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Streak</span>
              <span className="font-bold">{gp?.streak || 0} days</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Score</span>
              <span className="font-bold">{analytics.growthScore || 0}/1000</span>
            </div>
          </div>
        </div>

        {/* Q2: Where am I going? */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center"><Rocket size={16} className="text-emerald-600"/></div>
            <h3 className="font-black text-sm">Where am I going?</h3>
          </div>
          {mentorCtx.activeGoals.length > 0 ? (
            <div className="space-y-2">
              {mentorCtx.activeGoals.slice(0, 3).map((g, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 truncate max-w-[180px]">{g.title}</span>
                  <span className={cn("text-xs font-bold", g.priority === "high" ? "text-red-500" : "text-slate-400")}>{g.progress}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Set a goal to begin your journey</p>
          )}
        </div>

        {/* Q3: What should I do now? */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center"><Zap size={16} className="text-accent"/></div>
            <h3 className="font-black text-sm">What should I do now?</h3>
          </div>
          {na ? (
            <div>
              <p className="font-bold text-sm">{na.suggestedTask}</p>
              <p className="text-xs text-slate-400 mt-1">{na.reason}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                  na.urgency === "now" ? "bg-red-100 text-red-600" : na.urgency === "today" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                )}>{na.urgency}</span>
                <span className="text-[10px] text-slate-400">{na.format}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Complete a lesson to get recommendations</p>
          )}
        </div>
      </div>

      {/* ── Today's Mission ── */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Zap size={20} className="text-accent"/>
            Today's Mission
          </h3>
          <span className="text-sm text-slate-400">
            {new Date().toLocaleDateString("hy-AM", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyMission.tasks.map((task, i) => (
            <motion.div
              key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={cn("p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg",
                task.type === "learn" ? "bg-blue-50 border-blue-100 hover:border-blue-300" :
                task.type === "practice" ? "bg-amber-50 border-amber-100 hover:border-amber-300" :
                task.type === "build" ? "bg-emerald-50 border-emerald-100 hover:border-emerald-300" :
                "bg-purple-50 border-purple-100 hover:border-purple-300"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                  task.type === "learn" ? "bg-blue-200 text-blue-700" :
                  task.type === "practice" ? "bg-amber-200 text-amber-700" :
                  task.type === "build" ? "bg-emerald-200 text-emerald-700" :
                  "bg-purple-200 text-purple-700"
                )}>{task.type}</span>
                <span className="text-xs text-slate-400">+{task.xpReward} XP</span>
              </div>
              <h4 className="font-bold text-sm mb-1">{task.title}</h4>
              <p className="text-xs text-slate-400">{task.skillId}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center mt-6 text-sm text-slate-400 italic">«{dailyMission.quote}»</p>
      </div>

      {/* ── Skill Overview + Strengths ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black flex items-center gap-2 mb-6">
            <BrainCircuit size={20}/>Skills & Mastery
          </h3>
          <div className="space-y-3">
            {mastery.filter(m => m.overallMastery > 0).slice(0, 8).map(s => (
              <div key={s.skillId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700">{s.skillName}</span>
                  <span className="text-xs text-slate-400">{s.overallMastery}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${s.overallMastery}%` }} transition={{ duration: 1 }}
                    className={cn("h-full rounded-full",
                      s.overallMastery > 70 ? "bg-emerald-500" : s.overallMastery > 40 ? "bg-primary" : "bg-amber-500"
                    )}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {s.confidence === "high" ? "Strong confidence" : s.confidence === "medium" ? "Building" : "Needs work"}
                  {s.interval > 1 && ` • Review in ${s.interval}d`}
                </p>
              </div>
            ))}
            {mastery.filter(m => m.overallMastery > 0).length === 0 && (
              <p className="text-slate-400 text-center py-8">Complete lessons to see your skills grow</p>
            )}
          </div>
        </div>

        {/* Strengths / Weaknesses */}
        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100">
            <h4 className="text-sm font-black flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-emerald-600"/>Strengths
            </h4>
            {mentorCtx.strengths.length > 0
              ? mentorCtx.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5"><CheckCircle2 size={14} className="text-emerald-500"/><span className="text-sm font-medium">{s}</span></div>
                ))
              : <p className="text-sm text-slate-400">Complete lessons to discover strengths</p>
            }
          </div>
          <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100">
            <h4 className="text-sm font-black flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-amber-600"/>Focus Areas
            </h4>
            {mentorCtx.weaknesses.length > 0
              ? mentorCtx.weaknesses.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5"><AlertCircle size={14} className="text-amber-500"/><span className="text-sm font-medium">{s}</span></div>
                ))
              : <p className="text-sm text-slate-400">Keep learning to identify growth areas</p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
