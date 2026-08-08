import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Compass, CheckCircle, Lock, Play, Award } from "lucide-react";
import { useUserProfile } from "../../hooks/useUserProfile";
import { SKILL_DEFINITIONS, type SkillDefinition } from "../../data/skillMappings";

interface EnrichedSkillNode extends SkillDefinition { status: "completed"|"in-progress"|"locked"; unlockedLevel: number; recommendation: string }

export const GrowthSkillGraph: React.FC = () => {
  const { profile } = useUserProfile();
  const skills = useMemo((): EnrichedSkillNode[] => {
    const strengths = new Set((profile as any)?.strengths||[]);
    const weaknesses = new Set((profile as any)?.weaknesses||[]);
    return SKILL_DEFINITIONS.slice(0,12).map((def,i)=>({...def,status:strengths.has(def.id)?"completed":(weaknesses.has(def.id)||(!strengths.has(def.id)&&i<4))?"in-progress":"locked",unlockedLevel:strengths.has(def.id)?3:weaknesses.has(def.id)?1:0,recommendation:strengths.has(def.id)?`Տիրապետում եք ${def.name}-ին`:(weaknesses.has(def.id)||i<4)?`${def.name} — զարգացման փուլում`:`${def.name} — դեռ չեք սկսել`}));
  }, [profile]);
  const [selected, setSelected] = useState<EnrichedSkillNode|null>(null);

  return (<div className="space-y-8">
    <div><h2 className="text-4xl font-black flex items-center gap-3"><Compass className="text-primary" size={32}/>Skill Graph</h2><p className="text-slate-500 mt-2">{profile?.strengths?.length?`${profile.strengths.length} ակտիվ հմտություն`:"Սկսեք սովորել:"}</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{skills.map(s=><motion.button key={s.id} whileHover={{y:-2}} onClick={()=>setSelected(s)} className={`p-6 rounded-[2rem] border-2 text-left transition-all ${s.status==="completed"?"bg-emerald-50 border-emerald-200":s.status==="in-progress"?"bg-amber-50 border-amber-200":"bg-slate-50 border-slate-100 opacity-60"}`}><div className="flex items-center gap-3 mb-2">{s.status==="completed"?<CheckCircle className="text-emerald-500" size={20}/>:s.status==="in-progress"?<Play className="text-amber-500" size={20}/>:<Lock className="text-slate-300" size={20}/>}<h4 className="font-black text-slate-900">{s.name}</h4></div><p className="text-xs text-slate-500">{s.category}</p></motion.button>)}</div>
    {selected && <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"><div className="flex items-center gap-4 mb-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selected.status==="completed"?"bg-emerald-100":selected.status==="in-progress"?"bg-amber-100":"bg-slate-100"}`}><Award className={selected.status==="completed"?"text-emerald-600":selected.status==="in-progress"?"text-amber-600":"text-slate-400"} size={24}/></div><div><h3 className="text-xl font-black">{selected.name}</h3><p className="text-sm text-slate-500">{selected.category} · Lv{selected.unlockedLevel}</p></div></div><p className="text-slate-600 font-medium">{selected.recommendation}</p><p className="text-sm text-slate-400 mt-2">{selected.description}</p></div>}
  </div>);
};
