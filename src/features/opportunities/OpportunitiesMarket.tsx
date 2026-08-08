import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Briefcase, Heart, Globe, MapPin, Send, Sparkles, Search, Filter, DollarSign, Clock, Star, BookOpen, Users, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { SKILL_DEFINITIONS } from "../../data/skillMappings";
import { toast } from "sonner";
import type { GrowthProfile } from "../../types/domain";

interface Opportunity {
  id: string; type: "job" | "volunteer" | "internship" | "freelance" | "scholarship" | "mentorship";
  title: string; organization: string; location: string; description: string;
  skillsRequired: string[]; matchScore: number; compensation?: string; deadline?: string;
  link?: string; isRemote: boolean;
}

const OPPORTUNITIES: Opportunity[] = [
  { id:"o1",type:"job",title:"Junior React Developer",organization:"Picsart",location:"Yerevan, Armenia",description:"Build next-gen creative tools with React and TypeScript",skillsRequired:["javascript","web-development"],matchScore:85,compensation:"$1,200-$2,000/mo",isRemote:false },
  { id:"o2",type:"job",title:"AI Research Intern",organization:"Krisp AI",location:"Yerevan + Remote",description:"Work on voice AI models with deep learning",skillsRequired:["ai-ml","python-programming"],matchScore:72,compensation:"$800-$1,500/mo",isRemote:true },
  { id:"o3",type:"volunteer",title:"Tech Mentor for Youth",organization:"Teach For Armenia",location:"Remote",description:"Mentor students in programming and digital skills",skillsRequired:["javascript","communication"],matchScore:90,isRemote:true },
  { id:"o4",type:"internship",title:"Data Science Intern",description:"Analyze user behavior and build ML models",organization:"ServiceTitan",location:"Yerevan",skillsRequired:["data-analysis","python-programming","ai-ml"],matchScore:65,compensation:"$1,000/mo",isRemote:false },
  { id:"o5",type:"freelance",title:"WordPress Developer Needed",description:"Build and customize WordPress sites for clients",organization:"Upwork Client",location:"Remote",skillsRequired:["web-development"],matchScore:78,compensation:"$30-50/hr",isRemote:true },
  { id:"o6",type:"scholarship",title:"AI Excellence Scholarship",description:"Full scholarship for AI/ML specialization program",organization:"Tumo Center",location:"Yerevan",skillsRequired:["ai-ml","python-programming","mathematics"],matchScore:55,deadline:"2026-09-15",isRemote:false },
  { id:"o7",type:"job",title:"Cybersecurity Analyst",description:"Monitor and protect infrastructure from threats",organization:"Digitain",location:"Yerevan",skillsRequired:["cybersecurity","cloud-computing"],matchScore:40,compensation:"$1,500-$2,500/mo",isRemote:false },
  { id:"o8",type:"volunteer",title:"Open Source Contributor",description:"Contribute to Armenian language NLP models",organization:"Armenian AI Community",location:"Remote",skillsRequired:["python-programming","ai-ml"],matchScore:82,isRemote:true },
  { id:"o9",type:"job",title:"Product Manager",description:"Lead product development for EdTech platform",organization:"SoloLearn",location:"Yerevan + Remote",skillsRequired:["strategic-management","marketing"],matchScore:35,compensation:"$1,800-$2,500/mo",isRemote:true },
  { id:"o10",type:"freelance",title:"UI/UX Designer",description:"Design intuitive interfaces for mobile apps",organization:"Toptal",location:"Remote",skillsRequired:["graphic-design","web-development"],matchScore:50,compensation:"$40-60/hr",isRemote:true },
];

export const OpportunitiesMarket: React.FC = () => {
  const { profile } = useUserProfile();
  const gp = profile as unknown as GrowthProfile;
  const userStrengths = gp?.strengths || [];
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const opportunities = useMemo(() => {
    return OPPORTUNITIES.map((o) => {
      const matched = o.skillsRequired.filter((s) => userStrengths.includes(s)).length;
      const score = o.skillsRequired.length > 0 ? Math.round((matched / o.skillsRequired.length) * 100) : 0;
      return { ...o, matchScore: score };
    }).filter((o) => filter === "all" || o.type === filter).filter((o) => !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.organization.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.matchScore - a.matchScore);
  }, [userStrengths, filter, search]);

  const typeIcons: Record<string, any> = { job: Briefcase, volunteer: Heart, internship: BookOpen, freelance: DollarSign, scholarship: Star, mentorship: Users };
  const typeLabels: Record<string, string> = { job: "Job", volunteer: "Volunteer", internship: "Internship", freelance: "Freelance", scholarship: "Scholarship", mentorship: "Mentorship" };
  const types = ["all", "job", "internship", "volunteer", "freelance", "scholarship", "mentorship"];

  return (<div className="space-y-8">
    <div><h2 className="text-4xl font-black text-slate-900 flex items-center gap-3"><Globe className="text-primary" size={32}/>Opportunities</h2><p className="text-slate-500 mt-2">{userStrengths.length ? `Matched to your ${userStrengths.length} skills` : "Jobs, volunteer work, scholarships — matched to your skills"}</p></div>

    <div className="flex gap-3 flex-wrap"><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search opportunities..." className="flex-1 px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary font-medium" />
      {types.map((t) => (<button key={t} onClick={() => setFilter(t)} className={cn("px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all", filter === t ? "bg-slate-900 text-white" : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50")}>{typeLabels[t] || "All"}</button>))}</div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {opportunities.map((o) => { const Icon = typeIcons[o.type] || Briefcase;
        return (<motion.div key={o.id} whileHover={{ y: -2 }} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="text-primary" size={20}/></div><div><h4 className="font-black text-slate-900">{o.title}</h4><p className="text-xs text-slate-500">{o.organization}</p></div></div>
            <span className={cn("px-3 py-1 rounded-xl text-[10px] font-bold uppercase", o.matchScore >= 70 ? "bg-emerald-50 text-emerald-700" : o.matchScore >= 40 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500")}>{o.matchScore}% match</span>
          </div>
          <p className="text-sm text-slate-600 mb-3">{o.description}</p>
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1"><MapPin size={12}/>{o.location}</span>
            {o.compensation && <span className="flex items-center gap-1"><DollarSign size={12}/>{o.compensation}</span>}
            {o.isRemote && <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-bold">Remote</span>}
            {o.deadline && <span className="flex items-center gap-1"><Clock size={12}/>{o.deadline}</span>}
          </div>
          <div className="flex flex-wrap gap-1 mb-3">{o.skillsRequired.map((s) => (<span key={s} className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold", userStrengths.includes(s) ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400")}>{SKILL_DEFINITIONS.find((d) => d.id === s)?.name || s}</span>))}</div>
          <button onClick={() => { toast.success(`Application started for ${o.title}!`); if (o.link) window.open(o.link, "_blank"); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><Send size={14}/>Apply Now</button>
        </motion.div>);
      })}
    </div>
  </div>);
};
