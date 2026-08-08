import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { useUserProfile } from '../hooks/useUserProfile';
import { Award, Briefcase, Code, Plus, Star, Link2, Eye, EyeOff, CheckCircle2, GraduationCap, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SkillsPassportProfile, PortfolioItem } from '../types';
import { recomputeSkillsPassport, setPassportVisibility } from '../services/skillsService';
import { addPortfolioItem, getPortfolioItems, deletePortfolioItem } from '../services/portfolioService';

export const PersonalLearningProfile: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useUserProfile();

  const [passport, setPassport] = useState<SkillsPassportProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  const [isExpOpen, setIsExpOpen] = useState(false);
  const [isProjOpen, setIsProjOpen] = useState(false);

  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [projTitle, setProjTitle] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');

  const experiences = portfolioItems.filter(i => i.type === 'experience');
  const projects = portfolioItems.filter(i => i.type === 'project');

  const loadData = useCallback(async () => {
    if (!profile?.uid) return;
    setIsLoading(true);
    try {
      const [computedPassport, items] = await Promise.all([
        recomputeSkillsPassport(profile.uid, profile),
        getPortfolioItems(profile.uid),
      ]);
      setPassport(computedPassport);
      setPortfolioItems(items);
    } catch (err) {
      console.error('Failed to load Skills Passport:', err);
      toast.error(t('common.error'), { description: 'Չհաջողվեց բեռնել Skills Passport-ը:' });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleVisibility = async () => {
    if (!profile?.uid || !passport) return;
    setIsTogglingVisibility(true);
    try {
      const nextPublic = !passport.isPublic;
      const slug = passport.publicSlug ?? `${profile.uid.slice(0, 8)}-${(profile.name || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      await setPassportVisibility(profile.uid, nextPublic, slug);
      setPassport({ ...passport, isPublic: nextPublic, publicSlug: slug });
      toast.success(nextPublic ? 'Passport-ը հրապարակային է հիմա' : 'Passport-ը հիմա private է');
    } catch {
      toast.error(t('common.error'), { description: 'Չհաջողվեց փոխել տեսանելիությունը:' });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !expRole || !expCompany || !expDuration) {
      toast.error(t('common.error'), { description: 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը:' });
      return;
    }
    try {
      const newItem = await addPortfolioItem(profile.uid, {
        type: 'experience',
        title: expRole,
        description: expDesc,
        organization: expCompany,
        startDate: expDuration,
        skillIds: [],
        isPublic: true,
        source: 'manual',
      });
      setPortfolioItems(prev => [newItem, ...prev]);
      setIsExpOpen(false);
      setExpRole(''); setExpCompany(''); setExpDuration(''); setExpDesc('');
      toast.success(t('common.success'), { description: 'Փորձը հաջողությամբ ավելացվեց:' });
    } catch {
      toast.error(t('common.error'), { description: 'Չհաջողվեց պահպանել։ Փորձեք կրկին:' });
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !projTitle || !projTech || !projDesc) {
      toast.error(t('common.error'), { description: 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը:' });
      return;
    }
    try {
      const newItem = await addPortfolioItem(profile.uid, {
        type: 'project',
        title: projTitle,
        description: `${projDesc}\n\nTech: ${projTech}`,
        url: projLink || undefined,
        skillIds: [],
        isPublic: true,
        source: 'manual',
      });
      setPortfolioItems(prev => [newItem, ...prev]);
      setIsProjOpen(false);
      setProjTitle(''); setProjTech(''); setProjDesc(''); setProjLink('');
      toast.success(t('common.success'), { description: 'Նախագիծը հաջողությամբ ավելացվեց:' });
    } catch {
      toast.error(t('common.error'), { description: 'Չհաջողվեց պահպանել։ Փորձեք կրկին:' });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deletePortfolioItem(id);
      setPortfolioItems(prev => prev.filter(i => i.id !== id));
    } catch {
      toast.error(t('common.error'), { description: 'Չհաջողվեց ջնջել:' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8" id="profile-portfolio-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="text-primary" size={32} />
            {t('portfolio.title')}
          </h2>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            {t('portfolio.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleToggleVisibility}
            disabled={isTogglingVisibility}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
          >
            {passport?.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{passport?.isPublic ? 'Հրապարակային է' : 'Անձնական է — սեղմեք հրապարակելու համար'}</span>
          </button>
        </div>
      </div>

      {passport?.isPublic && passport.publicSlug && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-xs font-bold text-emerald-700">
          Հանրային էջդ` /p/{passport.publicSlug} — ցանկացած ոք կարող է տեսնել այս էջում նշված public տվյալները։
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-slate-850">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <span className="text-[9px] font-black tracking-widest text-secondary uppercase">
                {t('portfolio.lifelongPassport')}
              </span>
              <Award className="text-secondary" size={24} />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md">
                {profile?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-black text-lg">{profile?.name || 'Օգտատեր'}</h3>
                <p className="text-xs text-slate-400 font-medium">{profile?.email || ''}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-secondary/20 text-secondary border border-secondary/20 rounded-md text-[9px] font-black uppercase">
                  {passport?.skills.some(s => s.verified) ? 'Verified Scholar' : 'Learner'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[8px] text-slate-500 font-black uppercase">LEVEL</span>
                  <span className="text-xs font-mono font-bold text-white">{profile?.level || 1} ({profile?.role || 'Student'})</span>
                </div>
                <div>
                  <span className="block text-[8px] text-slate-500 font-black uppercase">SKILLS TRACKED</span>
                  <span className="text-xs font-mono font-bold text-slate-300">{passport?.skills.length ?? 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[8px] text-slate-500 font-black uppercase">TOTAL XP</span>
                  <span className="text-xs font-mono font-bold text-slate-300">{profile?.xp || 0} XP</span>
                </div>
                <div>
                  <span className="block text-[8px] text-slate-500 font-black uppercase">DAILY STREAK</span>
                  <span className="text-xs font-mono font-bold text-slate-300">🔥 {profile?.streak || 0} days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-md">
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={16} />
              {t('portfolio.skillsEndorsement')}
            </h4>
            {!passport || passport.skills.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">
                Դեռ ակտիվություն չկա։ Անցիր դասեր և quiz-եր, որպեսզի քո skill-երը երևան այստեղ։
              </p>
            ) : (
              <div className="space-y-3">
                {passport.skills.slice(0, 8).map((skill) => (
                  <div key={skill.skillId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        {skill.skillTitle}
                        {skill.verified && <Star size={11} className="text-amber-500 fill-amber-500" />}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{skill.masteryLevel} · {skill.masteryPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                        style={{ width: `${skill.masteryPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="text-primary" size={20} />
                {t('portfolio.experience')}
              </h3>
              <button
                onClick={() => setIsExpOpen(true)}
                className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            {experiences.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">Դեռ փորձ չի ավելացվել։</p>
            ) : (
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-slate-100 pb-2 group">
                    <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 bg-primary rounded-full" />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-950 text-sm">{exp.title}</h4>
                        <p className="text-xs text-primary font-bold">{exp.organization}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-lg">{exp.startDate}</span>
                        <button onClick={() => handleDeleteItem(exp.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Code className="text-primary" size={20} />
                {t('portfolio.githubProjects')}
              </h3>
              <button
                onClick={() => setIsProjOpen(true)}
                className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">Դեռ նախագիծ չի ավելացվել։</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between group relative">
                    <button onClick={() => handleDeleteItem(proj.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-sm mb-1 pr-4">{proj.title}</h4>
                      {proj.source !== 'manual' && (
                        <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider">Auto · {proj.source.replace('auto_', '')}</span>
                      )}
                      <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed whitespace-pre-line">{proj.description}</p>
                    </div>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-primary transition-colors mt-4"
                      >
                        <Link2 size={12} />
                        <span>Link</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-900 mb-4">{t('portfolio.addExperience')}</h3>
              <form onSubmit={handleAddExperience} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Role (Պաշտոն)</label>
                  <input type="text" required value={expRole} onChange={(e) => setExpRole(e.target.value)}
                    placeholder="Օրինակ՝ Junior ML Engineer"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Company (Ընկերություն)</label>
                  <input type="text" required value={expCompany} onChange={(e) => setExpCompany(e.target.value)}
                    placeholder="Օրինակ՝ KrtLab Tech"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Duration (Տևողություն)</label>
                  <input type="text" required value={expDuration} onChange={(e) => setExpDuration(e.target.value)}
                    placeholder="Օրինակ՝ 2024 - 2025"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Description (Նկարագրություն)</label>
                  <textarea value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Նկարագրեք ձեր հիմնական պարտականությունները..." rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsExpOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs">
                    {t('common.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProjOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-900 mb-4">{t('portfolio.addProject')}</h3>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Title (Նախագծի Անվանումը)</label>
                  <input type="text" required value={projTitle} onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="Օրինակ՝ AI Study Companion"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Tech Stack (Տեխնոլոգիաներ)</label>
                  <input type="text" required value={projTech} onChange={(e) => setProjTech(e.target.value)}
                    placeholder="Օրինակ՝ Next.js, FastAPI, PostgreSQL"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Description (Նկարագրություն)</label>
                  <textarea required value={projDesc} onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Կարճ նկարագրեք նախագիծը և դրա հիմնական նպատակները..." rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Repository / Web Link (Հղում)</label>
                  <input type="url" value={projLink} onChange={(e) => setProjLink(e.target.value)}
                    placeholder="https://github.com/yourprofile/repo"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsProjOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs">
                    {t('common.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
