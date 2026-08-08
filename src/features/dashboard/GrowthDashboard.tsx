import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, TrendingUp, Brain, BookOpen, Flame, Rocket, Star, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { calculateGrowthScore } from "../../services/growthEngine";
import { StreakCalendar } from "../../components/StreakCalendar";
import { AchievementsList } from "../../components/AchievementsList";
import type { GrowthProfile, AIAction } from "../../types/domain";

export const GrowthDashboard: React.FC = () => {
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const gp = profile as unknown as GrowthProfile;

  const totalProgress = useMemo(() => {
    if (!profile?.progress?.categories) return { completed: 0, total: 1 };
    let completed = 0, total = 0;
    Object.values(profile.progress.categories).forEach((cat: any) => { Object.values(cat.subfields || {}).forEach((sub: any) => { if (sub.stageStatus) Object.values(sub.stageStatus).forEach((s: any) => { total++; if (s.isFullyCompleted) completed++; }); }); });
    return { completed, total };
  }, [profile]);

  const strengths = useMemo(() => (gp?.strengths || []).slice(0, 5), [gp]);
  const weaknesses = useMemo(() => {
    const w: string[] = [];
    const ap = (profile as any)?.adaptiveProgress || {};
    Object.entries(ap).forEach(([_, a]: [string, any]) => { if (a?.weakPoints?.length) a.weakPoints.forEach((wp: string) => { if (!w.includes(wp)) w.push(wp); }); });
    return w.slice(0, 5);
  }, [profile]);

  const xpChartData = useMemo(() => {
    return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => ({ day, xp: profile?.xp ? Math.round((profile.xp/7)*(i+1)*(0.7+Math.random()*0.6)) : i*50 }));
  }, [profile?.xp]);

  const growthScore = useMemo(() => profile ? calculateGrowthScore({ profile: gp, skills: [], goals: [], projects: [], habits: [{ currentStreak: gp?.streak || 0 }] }) : 0, [profile, gp]);

  const recommendations: AIAction[] = useMemo(() => {
    const a: AIAction[] = [];
    const last = profile?.lastActive ? new Date(profile.lastActive) : new Date(0);
    if ((Date.now() - last.getTime())/3600000 > 4) a.push({ type:"learning", title:"Շարունակել ուսումը", priority:"high" });
    if (profile?.streak) { const ls = profile.lastStreakUpdate ? new Date(profile.lastStreakUpdate) : new Date(0); if (new Date().getDate() !== ls.getDate()) a.push({ type:"learning", title:`Պահպանեք ${profile.streak}-օրյա շղթան`, priority:"critical" }); }
    if (weaknesses.length > 0) a.push({ type:"learning", title:`Թույլ կողմ: ${weaknesses[0]}`, priority:"medium" });
    if (!profile?.discovery?.goal) a.push({ type:"goal", title:"Սահմանեք ձեր աճի նպատակը", priority:"high" });
    a.push({ type:"project", title:"Սկսեք գործնական նախագիծ", priority:"low" });
    return a.slice(0, 4);
  }, [profile, weaknesses]);

  if (!profile) return null;

  return (<div className="space-y-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon={<Zap className="text-amber-500"/>} value={`Level ${profile.level||1}`} label="Մակարդակ" color="bg-amber-50 border-amber-100" />
      <StatCard icon={<Flame className="text-orange-500"/>} value={`${profile.streak||0} days`} label="Շղթա" color="bg-orange-50 border-orange-100" />
      <StatCard icon={<BookOpen className="text-blue-500"/>} value={`${totalProgress.completed}`} label="Դասեր" color="bg-blue-50 border-blue-100" />
      <StatCard icon={<TrendingUp className="text-emerald-500"/>} value={growthScore.toString()} label="Growth" color="bg-emerald-50 border-emerald-100" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"><h3 className="text-lg font-black text-slate-900 mb-4"><TrendingUp size={20} className="text-primary inline mr-2"/>XP Activity</h3><ResponsiveContainer width="100%" height={200}><LineChart data={xpChartData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="day"/><YAxis/><Tooltip/><Line type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer></div>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-4"><Brain size={20} className="text-primary inline mr-2"/>Skills</h3>
          {strengths.length > 0 ? <div className="flex flex-wrap gap-2">{strengths.map((s,i)=><span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">{s}</span>)}</div> : <p className="text-slate-400 text-sm">Սկսեք սովորել:</p>}
          {weaknesses.length > 0 && <><h4 className="text-md font-black text-slate-700 mt-6 mb-2">Բարելավել</h4><div className="flex flex-wrap gap-2">{weaknesses.map((w,i)=><span key={i} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-100">{w}</span>)}</div></>}
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"><h3 className="text-lg font-black text-slate-900 mb-4"><Rocket size={20} className="text-primary inline mr-2"/>Հաջորդը</h3>
          <div className="space-y-3">{recommendations.map((ac,i)=><motion.button key={i} whileHover={{x:4}} onClick={()=>{if(ac.type==="learning")navigate("/learn");else if(ac.type==="goal")navigate("/goals");else navigate("/lab");}} className={cn("w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3",ac.priority==="critical"?"bg-red-50 border-red-200":ac.priority==="high"?"bg-amber-50 border-amber-200":"bg-slate-50 border-slate-100 hover:bg-blue-50 hover:border-blue-200")}>{ac.priority==="critical"?<Flame size={18} className="text-red-500 mt-0.5"/>:ac.priority==="high"?<Zap size={18} className="text-amber-500 mt-0.5"/>:<ArrowRight size={18} className="text-slate-400 mt-0.5"/>}<div><p className="text-sm font-bold text-slate-900">{ac.title}</p></div></motion.button>)}</div></div>
        <StreakCalendar streak={profile?.streak || 0} activityHistory={profile?.lastActive ? [profile.lastActive] : []} /><AchievementsList unlockedIds={profile?.achievements || []} />
      </div>
    </div>
  </div>);
};

const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) => <div className={cn("rounded-[2rem] border p-6 shadow-sm",color)}><div className="flex items-center gap-3 mb-2">{icon}<span className="text-2xl font-black text-slate-900">{value}</span></div><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p></div>;
