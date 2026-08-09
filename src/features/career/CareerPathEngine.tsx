import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Briefcase, TrendingUp, Target, ArrowRight, AlertCircle } from "lucide-react";
import { useUserProfile } from "../../hooks/useUserProfile";
import { SKILL_DEFINITIONS } from "../../data/skillMappings";
import type { GrowthProfile, CareerSkillGap } from "../../types/learner";

interface CareerRole { title: string; description: string; requiredSkills: string[]; salaryRange: string; demand: string; }
const CAREER_ROLES: CareerRole[] = [
  { title: "AI / ML Engineer", description: "Build intelligent systems with machine learning", requiredSkills: ["python-programming","ai-ml","data-analysis","mathematics"], salaryRange: "$80K-$150K", demand: "high" },
  { title: "Full-Stack Developer", description: "Build complete web applications", requiredSkills: ["javascript","web-development","cloud-computing"], salaryRange: "$70K-$130K", demand: "high" },
  { title: "Cybersecurity Analyst", description: "Protect organizations from threats", requiredSkills: ["cybersecurity","cloud-computing","critical-thinking"], salaryRange: "$75K-$140K", demand: "high" },
  { title: "Product Manager", description: "Lead product strategy and growth", requiredSkills: ["strategic-management","marketing","entrepreneurship","communication"], salaryRange: "$70K-$120K", demand: "growing" },
  { title: "Data Scientist", description: "Extract insights from data with ML", requiredSkills: ["data-analysis","python-programming","ai-ml","mathematics"], salaryRange: "$85K-$160K", demand: "high" },
  { title: "DevOps Engineer", description: "Automate deployments and manage infra", requiredSkills: ["cloud-computing","devops","python-programming","cybersecurity"], salaryRange: "$80K-$140K", demand: "high" },
];

export const CareerPathEngine: React.FC = () => {
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const gp = profile as unknown as GrowthProfile;
  const userStrengths = gp?.strengths || [];

  const roles = useMemo(() => CAREER_ROLES.map((role) => {
    let matched = 0;
    const gaps: { skillId: string; current: number; required: number; priority: string }[] = role.requiredSkills.map((sid, i) => {
      const isStrong = userStrengths.includes(sid);
      if (isStrong) matched++;
      return { skillId: sid, current: isStrong ? 65 : 0, required: 70, priority: isStrong ? "low" as const : i === 0 ? "high" as const : "medium" as const };
    });
    return { role, gaps, match: Math.round((matched / role.requiredSkills.length) * 100), open: gaps.filter((g) => g.priority !== "low") };
  }).sort((a, b) => b.match - a.match), [userStrengths]);

  const top = roles[0];

  return (<div className="space-y-8">
    <div><h2 className="text-4xl font-black text-slate-900 flex items-center gap-3"><Briefcase className="text-primary" size={32}/>Career Path Engine</h2><p className="text-slate-500 mt-2">{userStrengths.length ? `Based on ${userStrengths.length} skills` : "Start learning for recommendations"}</p></div>
    {top && (<div className="bg-white rounded-[2.5rem] border p-8 shadow-sm"><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center"><Target className="text-emerald-600" size={24}/></div><div><h3 className="text-xl font-black">{top.role.title} — {top.match}% match</h3><p className="text-sm text-slate-500">{top.role.description}</p></div></div>
    <div className="grid grid-cols-3 gap-4 mt-6"><div className="bg-slate-50 rounded-2xl p-5"><p className="text-xs font-bold text-slate-400 uppercase">Salary</p><p className="text-lg font-black">{top.role.salaryRange}</p></div><div className="bg-slate-50 rounded-2xl p-5"><p className="text-xs font-bold text-slate-400 uppercase">Demand</p><p className="text-lg font-black capitalize">{top.role.demand}</p></div><div className="bg-slate-50 rounded-2xl p-5"><p className="text-xs font-bold text-slate-400 uppercase">Match</p><p className="text-lg font-black">{top.match}%</p></div></div>
    {top.open.length > 0 && (<div className="mt-6 space-y-3"><h4 className="text-md font-black text-slate-700">Skills to Develop</h4>{top.open.map((g) => (<motion.div key={g.skillId} whileHover={{x:4}} onClick={() => navigate("/skills")} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100 cursor-pointer"><div className="flex items-center gap-3"><AlertCircle size={18} className="text-amber-500"/><div><p className="text-sm font-bold text-slate-900">{SKILL_DEFINITIONS.find(s=>s.id===g.skillId)?.name || g.skillId}</p><p className="text-xs text-slate-500">Current: {g.current} → {g.required}</p></div></div><ArrowRight size={16} className="text-slate-400"/></motion.div>))}</div>)}</div>)}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{roles.map(({role,match}) => (<div key={role.title} className="bg-white rounded-[2rem] border p-6 shadow-sm"><div className="flex items-center gap-2 mb-3"><div className={`w-3 h-3 rounded-full ${match>=50?"bg-emerald-400":match>=25?"bg-amber-400":"bg-slate-300"}`}/><h4 className="font-black">{role.title}</h4></div><p className="text-xs text-slate-500 mb-3">{role.description}</p><div className="flex justify-between"><span className="text-sm font-bold text-slate-500">{role.salaryRange}</span><span className="text-sm font-black text-primary">{match}%</span></div></div>))}</div>
  </div>);
};
