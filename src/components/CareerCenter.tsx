import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { Briefcase, MapPin, DollarSign, Search, Sparkles, Building2, CheckCircle, Send, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship';
  salaryRange: string;
  matchScore: number;
  skillsRequired: string[];
  logo: string;
}

const INITIAL_JOBS: JobOpportunity[] = [
  {
    id: 'j1',
    title: 'Junior AI/React Engineer',
    company: 'SADA Systems',
    location: 'Yerevan, Armenia (Hybrid)',
    type: 'Full-time',
    salaryRange: '$800 - $1200 / mo',
    matchScore: 94,
    skillsRequired: ['Python', 'Algorithm Design', 'UI/UX Design'],
    logo: '🌐'
  },
  {
    id: 'j2',
    title: 'Computer Vision Intern',
    company: 'Webbic Tech',
    location: 'Yerevan, Armenia (On-site)',
    type: 'Internship',
    salaryRange: 'Unpaid (Certificate + Hire Offer)',
    matchScore: 82,
    skillsRequired: ['Python', 'Machine Learning', 'ROS (Robot OS)'],
    logo: '🤖'
  },
  {
    id: 'j3',
    title: 'Full Stack Node.js Developer',
    company: 'Picsart',
    location: 'Yerevan, Armenia (Remote)',
    type: 'Full-time',
    salaryRange: '$1500 - $2200 / mo',
    matchScore: 65,
    skillsRequired: ['Node.js', 'Drizzle ORM', 'SQL Database'],
    logo: '🎨'
  }
];

export const CareerCenter: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobOpportunity[]>(INITIAL_JOBS);
  const [search, setSearch] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.skillsRequired.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = (id: string, title: string) => {
    if (appliedJobs.includes(id)) return;
    setAppliedJobs(prev => [...prev, id]);
    toast.success('Դիմումը հաջողությամբ ուղարկվեց:', {
      description: `Ձեր ցմահ կրթական անձնագիրն ու սերտիֆիկատները կցվեցին ${title} հաստիքի համար:`
    });
  };

  return (
    <div className="space-y-8" id="career-center-container">
      {/* Header section */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Briefcase className="text-primary" size={32} />
          {t('career.title')}
        </h2>
        <p className="text-slate-500 font-medium mt-2 max-w-xl">
          {t('career.subtitle')}
        </p>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-primary/80 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-1.5 text-secondary font-black text-xs uppercase tracking-widest">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>AI Match Advisor</span>
          </div>
          <h3 className="text-lg font-black">Մեր ԱԲ-ն գտել է 2 հարմար պաշտոն ձեզ համար</h3>
          <p className="text-slate-300 text-xs font-medium max-w-lg">
            Հիմնվելով ձեր ապակողպված <span className="text-white font-extrabold">Python Foundation</span> և <span className="text-white font-extrabold">UI/UX Design</span> հմտությունների վրա՝ դուք ունեք ավելի քան 80% համապատասխանություն հետևյալ հաստիքներին:
          </p>
        </div>
        <div className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-white font-bold text-xs cursor-pointer z-10 transition-all">
          Դիտել Առաջարկվողները
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t('career.jobSearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl outline-none font-medium text-xs transition-all"
        />
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const isApplied = appliedJobs.includes(job.id);
          return (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {job.logo}
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-black text-slate-900 text-lg leading-none">{job.title}</h4>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-full text-[10px] font-black uppercase">
                      {job.type}
                    </span>
                  </div>

                  <p className="text-slate-500 font-extrabold text-xs flex items-center gap-1.5">
                    <Building2 size={12} />
                    {job.company}
                    <span className="text-slate-300">•</span>
                    <MapPin size={12} />
                    {job.location}
                  </p>

                  {/* Skills required badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skillsRequired.map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-50 border border-slate-150 text-slate-600 rounded-lg text-[10px] font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Score & Action Row */}
              <div className="flex md:flex-col items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 gap-4">
                <div className="flex flex-col items-start md:items-end">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('career.matchScore')}</span>
                  <span className={`text-lg font-black ${job.matchScore >= 80 ? 'text-emerald-500' : 'text-primary'}`}>
                    {job.matchScore}% Match
                  </span>
                </div>

                <button
                  onClick={() => handleApply(job.id, job.title)}
                  disabled={isApplied}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isApplied
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle size={14} />
                      <span>{t('career.applied')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{t('career.applyNow')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
