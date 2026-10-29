import React, { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, Sparkles, Loader2, RefreshCw, CheckCircle2, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { generateLessonContent } from "../../services/geminiService";
import { CATEGORIES } from "../../data/categories";
import { SKILL_DEFINITIONS, SUBFIELD_SKILL_MAP } from "../../data/skillMappings";
import { toast } from "sonner";

interface AICourse { id: string; title: string; category: string; subfield: string; totalLevels: number; currentLevel: number; status: "ready"|"generating"|"error"; topics: string[]; skillId: string; targetLevel: number; content?: any; completedLevels?: number[]; }

export const AICourseEngine: React.FC = () => {
  const { profile, updateProfile } = useUserProfile();
  const [courses, setCourses] = useState<AICourse[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activeCourse, setActiveCourse] = useState<AICourse|null>(null);
  const [courseContent, setCourseContent] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.uid || profile?.name) {
      const savedCourses = profile.aiCourses || [];
      setCourses(savedCourses);
      if (savedCourses.length > 0) {
        const firstReady = savedCourses.find(course => course.status === "ready" && course.content);
        if (firstReady) {
          setActiveCourse(firstReady);
          setCourseContent(firstReady.content);
        }
      }
    }
  }, [profile?.uid, profile?.name]);

  const persistCourses = useCallback((nextCourses: AICourse[]) => {
    setCourses(nextCourses);
    updateProfile({ aiCourses: nextCourses });
  }, [updateProfile]);

  useEffect(() => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, [activeCourse?.id, courseContent?.title]);

  const submitQuiz = useCallback(() => {
    const quiz = Array.isArray(courseContent?.quiz) ? courseContent.quiz : [];
    if (!quiz.length || quizSubmitted) return;
    const correct = quiz.filter((question: any, index: number) => selectedAnswers[index] === question.correctAnswer).length;
    const score = Math.round((correct / quiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score >= 80) {
      const alreadyRewarded = activeCourse?.completedLevels?.includes(activeCourse.currentLevel) || false;
      if (!alreadyRewarded && activeCourse) {
        updateProfile({
          xp: (profile?.xp || 0) + 50,
          points: (profile?.points || 0) + 50,
        });
        const updatedCourse = {
          ...activeCourse,
          completedLevels: [...(activeCourse.completedLevels || []), activeCourse.currentLevel],
        };
        persistCourses(courses.map(course => course.id === activeCourse.id ? updatedCourse : course));
        setActiveCourse(updatedCourse);
      }
      toast.success(alreadyRewarded ? `Թեստը հանձնված է՝ ${score}%։` : `Թեստը հանձնված է՝ ${score}%. +50 XP`);
    } else {
      toast.error(`Արդյունքը՝ ${score}%. Կրկնիր նյութը և փորձիր նորից։`);
    }
  }, [courseContent, quizSubmitted, selectedAnswers, profile?.xp, profile?.points, activeCourse, courses, persistCourses, updateProfile]);

  const handleNextLesson = useCallback(async () => {
    if (!activeCourse || quizScore === null || quizScore < 80) return;
    if (activeCourse.currentLevel >= activeCourse.totalLevels) {
      toast.success("Շնորհավորում ենք․ ավարտեցիր այս անհատականացված դասընթացը։");
      return;
    }
    const nextLevel = activeCourse.currentLevel + 1;
    const nextTopic = activeCourse.topics[activeCourse.currentLevel] || `${activeCourse.title} — գործնական կիրառում ${nextLevel}`;
    const subfield = CATEGORIES.find(category => category.id === activeCourse.category)?.subfields.find(item => item.id === activeCourse.subfield);
    setGenerating(true);
    try {
      const content = await generateLessonContent(
        activeCourse.category,
        activeCourse.subfield,
        nextLevel,
        subfield?.recommendedLiterature,
        activeCourse.topics.slice(0, activeCourse.currentLevel),
        nextTopic,
        nextLevel - 1,
        activeCourse.topics
      );
      const updated = { ...activeCourse, currentLevel: nextLevel, content };
      persistCourses(courses.map(course => course.id === activeCourse.id ? updated : course));
      setActiveCourse(updated);
      setCourseContent(content);
      toast.success(`Հաջորդ դասը պատրաստ է՝ ${content.title || nextTopic}`);
    } catch {
      toast.error("Հաջորդ դասը ստեղծել չհաջողվեց։ Փորձիր կրկին։");
    } finally {
      setGenerating(false);
    }
  }, [activeCourse, quizScore, courses, persistCourses]);

  const generateNewCourse = useCallback(async () => {
    const activeGoal = profile?.intelligenceState?.goals?.find(g => g.status === "active");
    if (!activeGoal) {
      toast.error("Սկզբում ակտիվացրու նպատակ, որպեսզի դասընթացը կառուցվի հենց դրա համար։");
      return;
    }

    const required = activeGoal.requiredSkills || [];
    const baseline = profile?.intelligenceState?.skillBaseline || [];
    const nextRequired = [...required]
      .sort((a, b) => {
        const am = baseline.find(s => s.skillId === a.skillId)?.masteryScore ?? 0;
        const bm = baseline.find(s => s.skillId === b.skillId)?.masteryScore ?? 0;
        return am - bm;
      })[0];

    if (!nextRequired) {
      toast.error("Այս նպատակի համար դեռ անհրաժեշտ skills չեն հայտնաբերվել։");
      return;
    }

    const skill = SKILL_DEFINITIONS.find(s => s.id === nextRequired.skillId);
    const mapping = SUBFIELD_SKILL_MAP.find(m => m.skills.some(s => s.skillId === nextRequired.skillId));
    const cat = CATEGORIES.find(c => c.id === mapping?.categoryId);
    const sub = cat?.subfields.find(s => s.id === mapping?.subfieldId);

    if (!skill || !cat || !sub) {
      toast.error("Չհաջողվեց գտնել այս skill-ի ուսուցման բովանդակությունը։");
      return;
    }

    setGenerating(true);
    const nc: AICourse = {
      id: `ai-${Date.now()}`,
      title: `${skill.name} — ${activeGoal.title}`,
      category: cat.id,
      subfield: sub.id,
      totalLevels: Math.min(5, sub.courseTopics?.length || 5),
      currentLevel: 0,
      status: "generating",
      topics: sub.courseTopics?.slice(0, 5) || [skill.name],
      skillId: skill.id,
      targetLevel: nextRequired.targetLevel
    };
    persistCourses([nc, ...courses.filter(course => course.id !== nc.id)]);

    try {
      const content = await generateLessonContent(
        cat.id,
        sub.id,
        1,
        sub.recommendedLiterature,
        [],
        nc.topics[0],
        nextRequired.targetLevel
      );
      const ready = { ...nc, status: "ready" as const, currentLevel: 1, content };
      persistCourses([ready, ...courses.filter(course => course.id !== nc.id)]);
      setActiveCourse(ready);
      setCourseContent(content);
      toast.success(`"${nc.title}" դասընթացը պատրաստ է։`);
    } catch {
      persistCourses(courses.map(course => course.id === nc.id ? { ...course, status: "error" as const } : course));
      toast.error("Դասընթացի ստեղծումը չհաջողվեց։");
    } finally {
      setGenerating(false);
    }
  }, [profile, courses, persistCourses]);

  return (<div className="space-y-8">
    <div className="flex items-center justify-between"><div><h2 className="text-4xl font-black flex items-center gap-3"><Sparkles className="text-primary" size={32}/>AI Course Generator</h2><p className="text-slate-500 mt-2">ԱԲ-ն անընդհատ ստեղծում և թարմացնում է դասընթացներ</p></div>
    <button onClick={generateNewCourse} disabled={generating} className={cn("px-8 py-4 rounded-2xl font-black text-white flex items-center gap-2 shadow-xl",generating?"bg-slate-400":"bg-primary hover:bg-primary/90 active:scale-95")}>{generating?<RefreshCw size={20} className="animate-spin"/>:<Sparkles size={20}/>}{generating?"Generating...":"Generate AI Course"}</button></div>
    {courses.length===0&&!generating&&<div className="bg-white rounded-[2.5rem] border p-16 text-center"><div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"><BookOpen className="text-primary" size={40}/></div><h3 className="text-2xl font-black">No AI Courses Yet</h3><p className="text-slate-500 max-w-md mx-auto">Click Generate to create a personalized course.</p></div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{courses.map(c=>(<motion.div key={c.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} onClick={()=>{setActiveCourse(c);setCourseContent(c.content || null)}} className={cn("bg-white rounded-[2rem] border p-6 shadow-sm cursor-pointer transition-all hover:shadow-md",activeCourse?.id===c.id?"border-primary ring-2 ring-primary/20":"border-slate-100")}><div className="flex items-center gap-3 mb-3">{c.status==="generating"?<Loader2 size={24} className="text-primary animate-spin"/>:c.status==="ready"?<CheckCircle2 size={24} className="text-emerald-500"/>:<RefreshCw size={24} className="text-red-400"/>}<div><h4 className="font-black">{c.title}</h4><p className="text-xs text-slate-500">{c.category} · {c.subfield} · Skill target {c.targetLevel}%</p></div></div>{c.status==="ready"&&<div className="space-y-2 mt-4"><div className="flex justify-between text-sm"><span className="text-slate-500">Progress</span><span className="font-bold text-primary">{c.currentLevel}/{c.totalLevels}</span></div><div className="w-full h-2 bg-slate-100 rounded-full"><div className="h-full bg-primary rounded-full" style={{width:`${(c.currentLevel/c.totalLevels)*100}%`}}/></div><div className="flex flex-wrap gap-1 mt-3">{c.topics.map((t,i)=>(<span key={i} className={cn("px-2 py-1 rounded-lg text-[10px] font-bold",i<c.currentLevel?"bg-emerald-50 text-emerald-700":"bg-slate-50 text-slate-400")}>{t.slice(0,20)}</span>))}</div></div>}</motion.div>))}</div>
    {activeCourse&&courseContent&&<div className="bg-white rounded-[2.5rem] border p-8 shadow-sm space-y-6">
      <div><p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Դաս {activeCourse.currentLevel} · {activeCourse.subfield}</p><h3 className="text-2xl font-black mb-3">📖 {courseContent.title||activeCourse.title}</h3><p className="text-slate-600 leading-relaxed">{courseContent.introduction}</p></div>
      {courseContent.keyConcepts?.length>0&&<section><h4 className="font-black mb-3">Հիմնական հասկացություններ</h4><div className="space-y-2">{courseContent.keyConcepts.map((concept:string,i:number)=>(<div key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0"/>{concept}</div>))}</div></section>}
      {courseContent.detailedExplanation&&<section><h4 className="font-black mb-3">Բացատրություն</h4><p className="text-slate-700 leading-7 whitespace-pre-line">{courseContent.detailedExplanation}</p></section>}
      {courseContent.examples?.length>0&&<section><h4 className="font-black mb-3">Գործնական օրինակներ</h4><ol className="list-decimal pl-5 space-y-2 text-slate-700">{courseContent.examples.map((example:string,i:number)=><li key={i}>{example}</li>)}</ol></section>}
      {courseContent.exercises?.length>0&&<section><h4 className="font-black mb-3">Ինքնուրույն վարժություններ</h4><ol className="list-decimal pl-5 space-y-2 text-slate-700">{courseContent.exercises.map((exercise:string,i:number)=><li key={i}>{exercise}</li>)}</ol></section>}
      {courseContent.quiz?.length>0&&<section><h4 className="font-black mb-3">Գիտելիքի ստուգում</h4><div className="space-y-4">{courseContent.quiz.map((question:any,i:number)=><div key={i} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold mb-3">{i+1}. {question.question}</p><div className="space-y-2">{(question.options||[]).map((option:string,j:number)=><button key={j} type="button" disabled={quizSubmitted} onClick={()=>setSelectedAnswers(previous=>({...previous,[i]:j}))} className={cn("w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors",selectedAnswers[i]===j?"border-primary bg-primary/10 text-slate-900":"border-slate-200 bg-white hover:border-primary/40",quizSubmitted&&j===question.correctAnswer&&"border-emerald-500 bg-emerald-50 text-emerald-800",quizSubmitted&&selectedAnswers[i]===j&&j!==question.correctAnswer&&"border-red-400 bg-red-50 text-red-800")}>{option}</button>)}</div>{quizSubmitted&&<div className="mt-3 text-sm"><p className="font-semibold text-emerald-700">Ճիշտ պատասխան՝ {question.options?.[question.correctAnswer] || "նշված չէ"}</p>{question.explanation&&<p className="mt-1 text-slate-500">{question.explanation}</p>}</div>}</div>)}</div>{!quizSubmitted?<button type="button" onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length<courseContent.quiz.length} className="mt-4 rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Ստուգել պատասխանները</button>:<div className="mt-4 rounded-2xl border p-4"><p className="font-black">Արդյունք՝ {quizScore}%</p>{quizScore!==null&&quizScore>=80&&activeCourse.currentLevel<activeCourse.totalLevels&&<button type="button" onClick={handleNextLesson} disabled={generating} className="mt-3 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-50">{generating?"Հաջորդ դասը պատրաստվում է…":"Անցնել հաջորդ դասին"}</button>}{quizScore!==null&&quizScore>=80&&activeCourse.currentLevel>=activeCourse.totalLevels&&<p className="mt-2 text-sm text-emerald-700">Դասընթացն ավարտված է։</p>}{quizScore!==null&&quizScore<80&&<button type="button" onClick={()=>{setSelectedAnswers({});setQuizSubmitted(false);setQuizScore(null)}} className="mt-3 rounded-xl border px-5 py-3 font-bold">Կրկին փորձել</button>}</div>}</section>}
      {courseContent.practiceTask&&<section className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><h4 className="font-black mb-2">Գործնական առաջադրանք · {courseContent.practiceTask.title}</h4><p className="text-sm text-slate-700 mb-2">{courseContent.practiceTask.scenario}</p><p className="text-sm text-slate-600 mb-2">{courseContent.practiceTask.mission}</p><p className="text-sm whitespace-pre-line">{courseContent.practiceTask.instructions}</p><p className="mt-3 text-xs text-slate-500">Արդյունք՝ {courseContent.practiceTask.deliverable}</p></section>}
      {courseContent.miniSummary&&<section className="border-t pt-4"><h4 className="font-black mb-2">Ամփոփում</h4><p className="text-slate-600 leading-relaxed">{courseContent.miniSummary}</p></section>}
    </div>}
  </div>);
};
