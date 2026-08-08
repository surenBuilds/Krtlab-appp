import React, { useState, useCallback } from "react";
import { motion } from "motion/react";
import { BookOpen, Sparkles, Loader2, RefreshCw, CheckCircle2, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { generateLessonContent } from "../../services/geminiService";
import { CATEGORIES } from "../../data/categories";
import { toast } from "sonner";

interface AICourse { id: string; title: string; category: string; totalLevels: number; currentLevel: number; status: "ready"|"generating"|"error"; topics: string[]; }

export const AICourseEngine: React.FC = () => {
  const { profile } = useUserProfile();
  const [courses, setCourses] = useState<AICourse[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activeCourse, setActiveCourse] = useState<AICourse|null>(null);
  const [courseContent, setCourseContent] = useState<any>(null);

  const generateNewCourse = useCallback(async () => {
    setGenerating(true);
    const cat = CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)];
    const sub = cat.subfields[Math.floor(Math.random()*cat.subfields.length)];
    const nc: AICourse = { id:`ai-${Date.now()}`,title:`${sub.title} — AI Course`,category:cat.id,totalLevels:5,currentLevel:0,status:"generating",topics:sub.courseTopics?.slice(0,5)||[] };
    setCourses(p=>[nc,...p]);
    try {
      const content = await generateLessonContent(cat.title, sub.title, 1, sub.recommendedLiterature, [], nc.topics[0], 1);
      setCourses(p=>p.map(c=>c.id===nc.id?{...c,status:"ready",currentLevel:1}:c));
      setActiveCourse(nc); setCourseContent(content);
      toast.success(`AI Course "${nc.title}" is ready!`);
    } catch { setCourses(p=>p.map(c=>c.id===nc.id?{...c,status:"error"}:c)); toast.error("Failed"); }
    finally { setGenerating(false); }
  }, []);

  return (<div className="space-y-8">
    <div className="flex items-center justify-between"><div><h2 className="text-4xl font-black flex items-center gap-3"><Sparkles className="text-primary" size={32}/>AI Course Generator</h2><p className="text-slate-500 mt-2">ԱԲ-ն անընդհատ ստեղծում և թարմացնում է դասընթացներ</p></div>
    <button onClick={generateNewCourse} disabled={generating} className={cn("px-8 py-4 rounded-2xl font-black text-white flex items-center gap-2 shadow-xl",generating?"bg-slate-400":"bg-primary hover:bg-primary/90 active:scale-95")}>{generating?<RefreshCw size={20} className="animate-spin"/>:<Sparkles size={20}/>}{generating?"Generating...":"Generate AI Course"}</button></div>
    {courses.length===0&&!generating&&<div className="bg-white rounded-[2.5rem] border p-16 text-center"><div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"><BookOpen className="text-primary" size={40}/></div><h3 className="text-2xl font-black">No AI Courses Yet</h3><p className="text-slate-500 max-w-md mx-auto">Click Generate to create a personalized course.</p></div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{courses.map(c=>(<motion.div key={c.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} onClick={()=>setActiveCourse(c)} className={cn("bg-white rounded-[2rem] border p-6 shadow-sm cursor-pointer transition-all hover:shadow-md",activeCourse?.id===c.id?"border-primary ring-2 ring-primary/20":"border-slate-100")}><div className="flex items-center gap-3 mb-3">{c.status==="generating"?<Loader2 size={24} className="text-primary animate-spin"/>:c.status==="ready"?<CheckCircle2 size={24} className="text-emerald-500"/>:<RefreshCw size={24} className="text-red-400"/>}<div><h4 className="font-black">{c.title}</h4><p className="text-xs text-slate-500">{c.category}</p></div></div>{c.status==="ready"&&<div className="space-y-2 mt-4"><div className="flex justify-between text-sm"><span className="text-slate-500">Progress</span><span className="font-bold text-primary">{c.currentLevel}/{c.totalLevels}</span></div><div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-primary rounded-full" style={{width:`${(c.currentLevel/c.totalLevels)*100}%`}}/></div><div className="flex flex-wrap gap-1 mt-3">{c.topics.map((t,i)=>(<span key={i} className={cn("px-2 py-1 rounded-lg text-[10px] font-bold",i<c.currentLevel?"bg-emerald-50 text-emerald-700":"bg-slate-50 text-slate-400")}>{t.slice(0,20)}</span>))}</div></div>}</motion.div>))}</div>
    {activeCourse&&courseContent&&<div className="bg-white rounded-[2.5rem] border p-8 shadow-sm"><h3 className="text-xl font-black mb-4">📖 {courseContent.title||activeCourse.title}</h3><p className="text-slate-600 mb-4">{courseContent.introduction}</p>{courseContent.keyConcepts&&<div className="space-y-2 mb-4">{courseContent.keyConcepts.map((c:string,i:number)=>(<div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 size={16} className="text-emerald-500"/>{c}</div>))}</div>}<p className="text-slate-500 text-sm">{courseContent.miniSummary}</p></div>}
  </div>);
};
