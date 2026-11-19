import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { chatWithMentor } from "../../services/geminiService";
import { useUserProfile } from "../../hooks/useUserProfile";
import { toast } from "sonner";
import { Sparkles, Target, Map, BookOpen, Award, Briefcase, Store, Loader2, CheckCircle2, Circle, Plus, ShieldCheck, Clock3 } from "lucide-react";

type Milestone = { id: string; title: string; objective: string; skills: string[]; tasks: string[]; resources: { title: string; url?: string; type: string }[]; assessment: string; estimatedHours: number; completed: boolean; evidence?: string; };
type Roadmap = { id: string; goal: string; startingLevel: string; targetDate?: string; summary: string; milestones: Milestone[]; createdAt: string; status: "active" | "completed"; };
type PublicItem = { id: string; title: string; description: string; category?: string; skills?: string[]; type?: string; eligibility?: string; organization?: string; url?: string; };

const tabs = [
  { id: "roadmap", label: "Իմ ճանապարհային քարտեզը", icon: Map },
  { id: "courses", label: "Դասընթացների շուկա", icon: Store },
  { id: "opportunities", label: "Աշխատանք և հնարավորություններ", icon: Briefcase },
  { id: "credentials", label: "Որակավորում", icon: Award },
  { id: "review", label: "Մոդերացիա", icon: ShieldCheck },
] as const;

function extractJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("ԱԲ-ն չվերադարձրեց վավեր կառուցվածքային պատասխան։");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

export const GrowthOSHub: React.FC<{ initialTab?: (typeof tabs)[number]["id"] }> = ({ initialTab = "roadmap" }) => {
  const { profile, isAdmin } = useUserProfile();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(initialTab);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [courses, setCourses] = useState<PublicItem[]>([]);
  const [opportunities, setOpportunities] = useState<PublicItem[]>([]);
  const [pendingCourses, setPendingCourses] = useState<PublicItem[]>([]);
  const [pendingOpportunities, setPendingOpportunities] = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Սկսնակ");
  const [hours, setHours] = useState("5");
  const [targetDate, setTargetDate] = useState("");
  const [courseDraft, setCourseDraft] = useState({ title: "", description: "", category: "", skills: "" });
  const [opportunityDraft, setOpportunityDraft] = useState({ title: "", description: "", organization: "", type: "Կամավորություն", eligibility: "", skills: "" });
  const [assessmentBusy, setAssessmentBusy] = useState<string | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, { score: number; feedback: string; passed: boolean }>>({});

  const uid = auth.currentUser?.uid;
  const userName = profile?.name || "Սովորող";

  useEffect(() => {
    let active = true;
    async function load() {
      if (!uid) { setLoading(false); return; }
      try {
        const ownRef = doc(db, "users", uid, "growthOS", "main");
        const [own, courseSnap, opportunitySnap, courseQueue, opportunityQueue] = await Promise.all([
          getDoc(ownRef),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "opportunities")),
          isAdmin ? getDocs(collection(db, "courseSubmissions")) : Promise.resolve(null),
          isAdmin ? getDocs(collection(db, "opportunitySubmissions")) : Promise.resolve(null),
        ]);
        if (!active) return;
        if (own.exists()) {
          const data = own.data();
          setRoadmap(data.roadmap || null);
          setAssessmentResults(data.assessmentResults || {});
        }
        setCourses(courseSnap.docs.map(d => ({ id: d.id, ...d.data() } as PublicItem)));
        setOpportunities(opportunitySnap.docs.map(d => ({ id: d.id, ...d.data() } as PublicItem)));
        setPendingCourses(courseQueue ? courseQueue.docs.filter(d => d.data().status === "pending_review").map(d => ({ id: d.id, ...d.data() } as PublicItem)) : []);
        setPendingOpportunities(opportunityQueue ? opportunityQueue.docs.filter(d => d.data().status === "pending_verification").map(d => ({ id: d.id, ...d.data() } as PublicItem)) : []);
      } catch (error) {
        console.error("Growth OS load failed", error);
        toast.error("Տվյալները բեռնել չհաջողվեց։ Ստուգեք մուտքն ու Firestore-ի կանոնները։");
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [uid, isAdmin]);

  const completedCount = useMemo(() => roadmap?.milestones.filter(m => m.completed).length || 0, [roadmap]);
  const progress = roadmap?.milestones.length ? Math.round(completedCount / roadmap.milestones.length * 100) : 0;

  async function persist(next: Roadmap, nextResults = assessmentResults) {
    if (!uid) throw new Error("Պետք է մուտք գործեք համակարգ։");
    await setDoc(doc(db, "users", uid, "growthOS", "main"), {
      roadmap: next,
      assessmentResults: nextResults,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    setRoadmap(next);
  }

  async function generateRoadmap(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim() || generating) return;
    setGenerating(true);
    try {
      const prompt = `Ստեղծիր KrtLab-ի անհատական մասնագիտական զարգացման ճանապարհային քարտեզ։ Լեզու՝ հայերեն։ Օգտատիրոջ նպատակը՝ ${goal}. Մակարդակ՝ ${level}. Հասանելի ժամանակ՝ շաբաթական ${hours} ժամ. Թիրախային ամսաթիվ՝ ${targetDate || "չսահմանված"}. Պատասխանիր ՄԻԱՅՆ վավեր JSON-ով այս կառուցվածքով՝ {"summary":"...","milestones":[{"title":"...","objective":"...","skills":["..."],"tasks":["..."],"resources":[{"title":"...","url":"","type":"free course|article|practice"}],"assessment":"...","estimatedHours":4}]}. Ստեղծիր 4-8 հաջորդական փուլ, իրատեսական տևողությամբ։ Առաջարկիր միայն հայտնի, ստուգելի ռեսուրսներ. եթե URL-ը վստահ չգիտես, թող url-ը դատարկ։ Տարբերակիր KrtLab-ի ներսում առկա դասընթացները արտաքին ռեսուրսներից. մի հորինիր KrtLab-ի դասընթացների անուններ։ Ներառիր գործնական նախագծեր և չափելի գնահատման չափանիշներ։`;
      const raw = await chatWithMentor([{ role: "user", text: prompt }], userName);
      const parsed = extractJson<{ summary: string; milestones: Omit<Milestone, "id" | "completed">[] }>(raw);
      if (!Array.isArray(parsed.milestones) || parsed.milestones.length < 2) throw new Error("Ճանապարհային քարտեզի կառուցվածքը թերի է։");
      const next: Roadmap = {
        id: crypto.randomUUID(), goal: goal.trim(), startingLevel: level, targetDate: targetDate || undefined,
        summary: parsed.summary || "Անհատականացված զարգացման ուղի։",
        milestones: parsed.milestones.map((m, i) => ({ ...m, id: `milestone-${i + 1}`, skills: m.skills || [], tasks: m.tasks || [], resources: m.resources || [], estimatedHours: Number(m.estimatedHours) || 4, completed: false })),
        createdAt: new Date().toISOString(), status: "active",
      };
      await persist(next);
      toast.success("Ճանապարհային քարտեզը ստեղծվեց և պահպանվեց։");
      setGoal("");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Ճանապարհային քարտեզը ստեղծել չհաջողվեց։");
    } finally { setGenerating(false); }
  }

  async function toggleMilestone(milestoneId: string) {
    if (!roadmap) return;
    const target = roadmap.milestones.find(m => m.id === milestoneId);
    if (target && !target.completed && !assessmentResults[milestoneId]?.passed) { toast.info("Փուլն ավարտելուց առաջ ներկայացրեք աշխատանքը և անցեք գնահատումը։"); return; }
    const next = { ...roadmap, milestones: roadmap.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m) };
    next.status = next.milestones.every(m => m.completed) ? "completed" : "active";
    try { await persist(next); toast.success("Առաջընթացը պահպանվեց։"); }
    catch { toast.error("Առաջընթացը պահպանել չհաջողվեց։"); }
  }

  async function submitEvidence(m: Milestone, evidence: string) {
    if (!roadmap || !evidence.trim() || assessmentBusy) return;
    setAssessmentBusy(m.id);
    try {
      const prompt = `Դու KrtLab-ի ուսումնական գնահատողն ես։ Գնահատիր սովորողի ներկայացրած աշխատանքը ըստ չափանիշի։ Փուլ՝ ${m.title}. Չափանիշ՝ ${m.assessment}. Ապացույց՝ ${evidence}. Վերադարձիր միայն JSON՝ {"score":0-100,"feedback":"կոնկրետ հայերեն հետադարձ կապ","passed":true|false}. passed=true միայն եթե ապացույցը բավարարում է չափանիշների մեծ մասին, score >= 75։ Մի պնդիր, որ ստուգել ես չտրամադրված ֆայլեր կամ արտաքին հղումներ։`;
      const raw = await chatWithMentor([{ role: "user", text: prompt }], userName);
      const result = extractJson<{ score: number; feedback: string; passed: boolean }>(raw);
      const normalized = { score: Math.max(0, Math.min(100, Number(result.score) || 0)), feedback: String(result.feedback || ""), passed: Boolean(result.passed) };
      const nextResults = { ...assessmentResults, [m.id]: normalized };
      const nextRoadmap = { ...roadmap, milestones: roadmap.milestones.map(item => item.id === m.id ? { ...item, evidence } : item) };
      setAssessmentResults(nextResults);
      await setDoc(doc(db, "users", uid!, "growthOS", "main"), { roadmap: nextRoadmap, assessmentResults: nextResults, updatedAt: serverTimestamp() }, { merge: true });
      setRoadmap(nextRoadmap);
      if (normalized.passed) toast.success("Գնահատումն անցած է։ Փուլը կարող եք նշել ավարտված։");
      else toast.info("Ստացվել է հետադարձ կապ․ բարելավեք աշխատանքը և կրկին ներկայացրեք։");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Գնահատումը ձախողվեց։"); }
    finally { setAssessmentBusy(null); }
  }

  async function submitCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !courseDraft.title.trim() || !courseDraft.description.trim()) return;
    try {
      await addDoc(collection(db, "courseSubmissions"), { ...courseDraft, skills: courseDraft.skills.split(",").map(s => s.trim()).filter(Boolean), ownerId: uid, creatorName: userName, status: "pending_review", createdAt: serverTimestamp() });
      setCourseDraft({ title: "", description: "", category: "", skills: "" });
      toast.success("Դասընթացի առաջարկն ուղարկվեց մոդերացիայի։ Այն դեռ հրապարակված չէ։");
    } catch { toast.error("Առաջարկը ուղարկել չհաջողվեց։"); }
  }

  async function submitOpportunity(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !opportunityDraft.title.trim() || !opportunityDraft.description.trim() || !opportunityDraft.organization.trim()) return;
    try {
      await addDoc(collection(db, "opportunitySubmissions"), { ...opportunityDraft, skills: opportunityDraft.skills.split(",").map(s => s.trim()).filter(Boolean), ownerId: uid, status: "pending_verification", createdAt: serverTimestamp() });
      setOpportunityDraft({ title: "", description: "", organization: "", type: "Կամավորություն", eligibility: "", skills: "" });
      toast.success("Հնարավորության առաջարկն ուղարկվեց ստուգման։ Այն դեռ հրապարակված չէ։");
    } catch { toast.error("Առաջարկը ուղարկել չհաջողվեց։"); }
  }

  async function reviewSubmission(kind: "course" | "opportunity", item: PublicItem, approve: boolean) {
    if (!isAdmin) return;
    const source = kind === "course" ? "courseSubmissions" : "opportunitySubmissions";
    const destination = kind === "course" ? "courses" : "opportunities";
    try {
      if (approve) await setDoc(doc(db, destination, item.id), { ...item, status: "published", publishedAt: serverTimestamp() });
      await updateDoc(doc(db, source, item.id), { status: approve ? "approved" : "rejected", reviewedAt: serverTimestamp() });
      if (kind === "course") setPendingCourses(items => items.filter(x => x.id !== item.id));
      else setPendingOpportunities(items => items.filter(x => x.id !== item.id));
      if (approve) {
        if (kind === "course") setCourses(items => [...items, { ...item, status: "published" }]);
        else setOpportunities(items => [...items, { ...item, status: "published" }]);
      }
      toast.success(approve ? "Հայտարարությունը հաստատվեց և հրապարակվեց։" : "Առաջարկը մերժվեց։");
    } catch { toast.error("Մոդերացիայի գործողությունը չհաջողվեց։"); }
  }

  async function applyToOpportunity(item: PublicItem) {
    if (!uid) return;
    try {
      await addDoc(collection(db, "users", uid, "applications"), { opportunityId: item.id, title: item.title, status: "submitted", createdAt: serverTimestamp() });
      toast.success("Հետաքրքրության հայտը պահպանվեց։ Գործատուին ուղարկում դեռ չի նշանակում։");
    } catch { toast.error("Հայտը պահպանել չհաջողվեց։"); }
  }

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!uid) return <div className="p-8 bg-white rounded-3xl border text-center"><ShieldCheck className="mx-auto mb-3" /><h2 className="text-xl font-black">Մուտք գործեք Growth OS օգտագործելու համար</h2><p className="text-slate-500 mt-2">Ճանապարհային քարտեզներն ու առաջընթացը պահպանվում են ձեր անձնական հաշվին։</p></div>;

  return <div className="space-y-7">
    <header className="rounded-[2rem] bg-slate-950 text-white p-7 md:p-9">
      <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-widest"><Sparkles size={16}/> KrtLab Growth OS</div>
      <h1 className="text-3xl md:text-4xl font-black mt-3">Նպատակից՝ մասնագիտական հնարավորության</h1>
      <p className="text-slate-300 mt-3 max-w-3xl">Անհատական ուղի, գործնական ուսուցում, ապացույցների գնահատում և հաստատված հնարավորություններ՝ մեկ համակարգում։</p>
      {roadmap && <div className="mt-6 max-w-xl"><div className="flex justify-between text-xs mb-2"><span>Ընթացիկ ուղու առաջընթաց</span><b>{progress}%</b></div><div className="h-2 bg-white/15 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${progress}%` }}/></div></div>}
    </header>
    <nav className="flex gap-2 overflow-x-auto pb-1">{tabs.filter(item => item.id !== "review" || isAdmin).map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-3 rounded-xl whitespace-nowrap text-sm font-bold flex items-center gap-2 ${tab === item.id ? "bg-slate-900 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}><Icon size={16}/>{item.label}</button>; })}</nav>

    {tab === "roadmap" && <section className="space-y-6">
      {!roadmap && <form onSubmit={generateRoadmap} className="bg-white rounded-3xl border p-6 md:p-8 space-y-4">
        <div><h2 className="text-xl font-black flex items-center gap-2"><Target/> Սահմանեք ձեր նպատակը</h2><p className="text-sm text-slate-500 mt-1">Մենթորը կկազմի փուլային ուղի՝ հմտություններով, դասընթացներով, նախագծերով և գնահատմամբ։</p></div>
        <textarea required value={goal} onChange={e=>setGoal(e.target.value)} rows={3} maxLength={1200} placeholder="Օրինակ՝ 12 ամսում դառնալ միջազգային հարաբերությունների ոլորտի հետազոտող..." className="w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-cyan-500"/>
        <div className="grid md:grid-cols-3 gap-3"><label className="text-sm font-bold">Մակարդակ<select value={level} onChange={e=>setLevel(e.target.value)} className="mt-1 w-full border rounded-xl p-3"><option>Սկսնակ</option><option>Միջին</option><option>Առաջադեմ</option></select></label><label className="text-sm font-bold">Ժամ/շաբաթ<input type="number" min="1" max="60" value={hours} onChange={e=>setHours(e.target.value)} className="mt-1 w-full border rounded-xl p-3"/></label><label className="text-sm font-bold">Թիրախային ամսաթիվ<input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="mt-1 w-full border rounded-xl p-3"/></label></div>
        <button disabled={generating || !goal.trim()} className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold disabled:opacity-50 flex items-center gap-2">{generating ? <Loader2 className="animate-spin"/> : <Sparkles/>} Ստեղծել անհատական ճանապարհային քարտեզ</button>
      </form>}
      {roadmap && <div className="space-y-5">
        <div className="bg-white border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><p className="text-xs uppercase font-black text-cyan-700">Անհատական նպատակ</p><h2 className="text-2xl font-black mt-1">{roadmap.goal}</h2><p className="text-slate-500 mt-2">{roadmap.summary}</p></div><button onClick={()=>{if(confirm("Ստեղծե՞լ նոր ճանապարհային քարտեզ։ Նախորդը կփոխարինվի։")){setRoadmap(null);}}} className="text-sm font-bold border rounded-xl px-4 py-2">Նոր նպատակ</button></div>
        {roadmap.milestones.map((m,i)=><article key={m.id} className="bg-white border rounded-3xl p-6 space-y-4">
          <div className="flex items-start gap-3"><button onClick={()=>toggleMilestone(m.id)} className="mt-1 text-cyan-700">{m.completed ? <CheckCircle2/> : <Circle/>}</button><div className="flex-1"><p className="text-xs text-slate-400 font-bold">ՓՈՒԼ {i+1} · մոտ {m.estimatedHours} ժամ</p><h3 className="text-lg font-black">{m.title}</h3><p className="text-sm text-slate-600 mt-1">{m.objective}</p></div>{m.completed&&<span className="text-xs font-bold text-emerald-700">Ավարտված</span>}</div>
          <div className="grid md:grid-cols-2 gap-4"><div><h4 className="text-xs font-black uppercase text-slate-500 mb-2">Հմտություններ</h4><div className="flex flex-wrap gap-2">{m.skills.map(s=><span key={s} className="px-3 py-1 bg-cyan-50 text-cyan-800 rounded-full text-xs">{s}</span>)}</div></div><div><h4 className="text-xs font-black uppercase text-slate-500 mb-2">Գործնական առաջադրանքներ</h4><ul className="list-disc pl-5 text-sm space-y-1">{m.tasks.map((t,j)=><li key={j}>{t}</li>)}</ul></div></div>
          {m.resources.length>0&&<div><h4 className="text-xs font-black uppercase text-slate-500 mb-2">Ուսումնական ռեսուրսներ</h4><div className="flex flex-wrap gap-2">{m.resources.map((r,j)=><span key={j} className="text-sm bg-slate-50 border rounded-lg px-3 py-2">{r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="underline">{r.title}</a> : r.title} <small className="text-slate-400">· {r.type}</small></span>)}</div></div>}
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase text-slate-500">Գնահատման չափանիշ</p><p className="text-sm mt-1">{m.assessment}</p><EvidenceForm milestone={m} busy={assessmentBusy===m.id} result={assessmentResults[m.id]} onSubmit={submitEvidence}/></div>
        </article>)}
      </div>}
    </section>}

    {tab === "courses" && <section className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4"><h2 className="text-xl font-black">Հաստատված դասընթացներ</h2>{courses.length ? courses.map(c=><article key={c.id} className="bg-white border rounded-2xl p-5"><h3 className="font-black">{c.title}</h3><p className="text-sm text-slate-600 mt-2">{c.description}</p><p className="text-xs text-slate-500 mt-3">{c.category}</p></article>) : <EmptyState text="Դեռևս հրապարակված դասընթացներ չկան։ Առաջարկները հայտնվում են այստեղ միայն ստուգումից հետո։"/>}</div>
      <form onSubmit={submitCourse} className="bg-white border rounded-3xl p-6 space-y-3"><h2 className="font-black text-lg flex gap-2"><Plus/> Առաջարկել սեփական դասընթաց</h2><input required placeholder="Դասընթացի անվանում" value={courseDraft.title} onChange={e=>setCourseDraft({...courseDraft,title:e.target.value})} className="w-full border rounded-xl p-3"/><textarea required placeholder="Նկարագրություն և ուսումնական արդյունքներ" value={courseDraft.description} onChange={e=>setCourseDraft({...courseDraft,description:e.target.value})} className="w-full border rounded-xl p-3" rows={4}/><input placeholder="Կատեգորիա" value={courseDraft.category} onChange={e=>setCourseDraft({...courseDraft,category:e.target.value})} className="w-full border rounded-xl p-3"/><input placeholder="Հմտություններ՝ ստորակետերով" value={courseDraft.skills} onChange={e=>setCourseDraft({...courseDraft,skills:e.target.value})} className="w-full border rounded-xl p-3"/><p className="text-xs text-slate-500">Ուղարկվում է մոդերացիայի։ Այս տարբերակում վճարումներ և ավտոմատ վաճառք միացված չեն։</p><button className="bg-slate-950 text-white rounded-xl px-5 py-3 font-bold">Ուղարկել ստուգման</button></form>
    </section>}

    {tab === "opportunities" && <section className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4"><h2 className="text-xl font-black">Հաստատված հնարավորություններ</h2>{opportunities.length ? opportunities.map(o=><article key={o.id} className="bg-white border rounded-2xl p-5"><div className="flex justify-between gap-3"><h3 className="font-black">{o.title}</h3><span className="text-xs bg-cyan-50 text-cyan-800 rounded-full px-2 py-1 h-fit">{o.type}</span></div><p className="text-xs text-slate-500 mt-1">{o.organization}</p><p className="text-sm mt-3">{o.description}</p>{o.eligibility&&<p className="text-xs text-amber-700 mt-2">Պահանջներ՝ {o.eligibility}</p>}<p className="text-xs text-slate-500 mt-2">Հմտություններ՝ {(o.skills||[]).join(", ")}</p><button onClick={()=>applyToOpportunity(o)} className="mt-4 px-4 py-2 rounded-lg bg-slate-950 text-white text-sm font-bold">Պահպանել հետաքրքրությունը</button></article>) : <EmptyState text="Հաստատված հնարավորություններ դեռ չկան։ Կեղծ հայտարարություններ չեն ցուցադրվում։"/>}</div>
      <form onSubmit={submitOpportunity} className="bg-white border rounded-3xl p-6 space-y-3"><h2 className="font-black text-lg flex gap-2"><Plus/> Առաջարկել հնարավորություն</h2><input required placeholder="Հնարավորության անվանում" value={opportunityDraft.title} onChange={e=>setOpportunityDraft({...opportunityDraft,title:e.target.value})} className="w-full border rounded-xl p-3"/><input required placeholder="Կազմակերպություն" value={opportunityDraft.organization} onChange={e=>setOpportunityDraft({...opportunityDraft,organization:e.target.value})} className="w-full border rounded-xl p-3"/><select value={opportunityDraft.type} onChange={e=>setOpportunityDraft({...opportunityDraft,type:e.target.value})} className="w-full border rounded-xl p-3"><option>Կամավորություն</option><option>Պրակտիկա</option><option>Երիտասարդական ծրագիր</option><option>Աշխատանք</option><option>Նախագծային համագործակցություն</option></select><textarea required placeholder="Նկարագրություն" value={opportunityDraft.description} onChange={e=>setOpportunityDraft({...opportunityDraft,description:e.target.value})} className="w-full border rounded-xl p-3" rows={3}/><input placeholder="Տարիքային/մասնակցության պայմաններ" value={opportunityDraft.eligibility} onChange={e=>setOpportunityDraft({...opportunityDraft,eligibility:e.target.value})} className="w-full border rounded-xl p-3"/><input placeholder="Պահանջվող հմտություններ" value={opportunityDraft.skills} onChange={e=>setOpportunityDraft({...opportunityDraft,skills:e.target.value})} className="w-full border rounded-xl p-3"/><p className="text-xs text-slate-500">Յուրաքանչյուր հայտարարություն անցնում է կազմակերպության և անվտանգության ստուգում։</p><button className="bg-slate-950 text-white rounded-xl px-5 py-3 font-bold">Ուղարկել ստուգման</button></form>
    </section>}

    {tab === "review" && isAdmin && <section className="space-y-6">
      <div><h2 className="text-2xl font-black">Հրապարակումների մոդերացիա</h2><p className="text-sm text-slate-500 mt-1">Միայն ադմինիստրատորը կարող է հաստատել հանրային կատալոգում ցուցադրվող առաջարկները։</p></div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3"><h3 className="font-black">Դասընթացներ ({pendingCourses.length})</h3>{pendingCourses.map(item=><article key={item.id} className="bg-white border rounded-2xl p-5"><h4 className="font-black">{item.title}</h4><p className="text-sm text-slate-600 mt-2">{item.description}</p><p className="text-xs text-slate-400 mt-2">Հեղինակ՝ {(item as any).creatorName || "չնշված"}</p><div className="flex gap-2 mt-4"><button onClick={()=>reviewSubmission("course",item,true)} className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold">Հաստատել</button><button onClick={()=>reviewSubmission("course",item,false)} className="px-4 py-2 border rounded-lg text-xs font-bold">Մերժել</button></div></article>)}{!pendingCourses.length&&<EmptyState text="Սպասող դասընթացներ չկան։"/>}</div>
        <div className="space-y-3"><h3 className="font-black">Հնարավորություններ ({pendingOpportunities.length})</h3>{pendingOpportunities.map(item=><article key={item.id} className="bg-white border rounded-2xl p-5"><h4 className="font-black">{item.title}</h4><p className="text-xs text-slate-500 mt-1">{item.organization}</p><p className="text-sm text-slate-600 mt-2">{item.description}</p><p className="text-xs text-amber-700 mt-2">Պայմաններ՝ {item.eligibility || "նշված չեն"}</p><div className="flex gap-2 mt-4"><button onClick={()=>reviewSubmission("opportunity",item,true)} className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold">Հաստատել</button><button onClick={()=>reviewSubmission("opportunity",item,false)} className="px-4 py-2 border rounded-lg text-xs font-bold">Մերժել</button></div></article>)}{!pendingOpportunities.length&&<EmptyState text="Սպասող հնարավորություններ չկան։"/>}</div>
      </div>
    </section>}

    {tab === "credentials" && <section className="bg-white border rounded-3xl p-6 md:p-8 space-y-4"><div className="flex gap-3 items-center"><Award className="text-cyan-700" size={28}/><div><h2 className="text-xl font-black">KrtLab որակավորման կենտրոն</h2><p className="text-sm text-slate-500">Ապացույցների վրա հիմնված գնահատում</p></div></div><p className="text-sm text-slate-600">Որակավորման ընթացակարգը պետք է ներառի գործնական նախագիծ, չափանիշներով գնահատում և մարդկային վերանայում։ Ճանապարհային քարտեզի ավարտը ինքնին մասնագիտական որակավորում չի տալիս։</p><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">KrtLab-ի ներքին գնահատման արդյունքները չեն համարվում պետական կամ արտաքին հավատարմագրված որակավորում։ Այս պահին պաշտոնական հավաստագրի տրամադրումը միացված չէ։</div><div className="space-y-2"><p className="font-bold text-sm">Ճանապարհի վիճակ</p><p className="text-sm text-slate-600">{roadmap ? `${completedCount}/${roadmap.milestones.length} փուլ ավարտված · ${progress}%` : "Դեռ ճանապարհային քարտեզ չկա։"}</p>{roadmap?.milestones.map(m=><div key={m.id} className="flex justify-between text-sm border-b py-2"><span>{m.title}</span><span>{assessmentResults[m.id]?.passed ? "Գնահատումն անցած է" : "Գնահատումը հաստատված չէ"}</span></div>)}</div></section>}
  </div>;
};

function EvidenceForm({ milestone, busy, result, onSubmit }: { milestone: Milestone; busy: boolean; result?: { score: number; feedback: string; passed: boolean }; onSubmit: (m: Milestone, evidence: string) => void }) {
  const [evidence, setEvidence] = useState(milestone.evidence || "");
  return <div className="mt-3 space-y-2"><textarea rows={3} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Նկարագրեք ձեր կատարած աշխատանքը, ավելացրեք արդյունքները կամ հղումը..." className="w-full border rounded-xl p-3 text-sm"/><button disabled={busy || !evidence.trim()} onClick={()=>onSubmit(milestone,evidence)} className="px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">{busy&&<Loader2 className="animate-spin" size={14}/>} Ներկայացնել գնահատման</button>{result&&<div className="text-sm border rounded-xl p-3 bg-white"><b>Արդյունք՝ {result.score}/100 · {result.passed ? "Նախնական անցողիկ" : "Կատարելագործման կարիք կա"}</b><p className="mt-1 text-slate-600">{result.feedback}</p><p className="text-xs text-slate-400 mt-2">ԱԲ գնահատում է․ վերջնական որակավորման որոշում չէ։</p></div>}</div>;
}
function EmptyState({ text }: { text: string }) { return <div className="bg-white border border-dashed rounded-2xl p-7 text-center text-sm text-slate-500"><Clock3 className="mx-auto mb-2"/>{text}</div>; }
