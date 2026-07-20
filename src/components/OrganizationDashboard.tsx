import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { Building2, Users, Trophy, GraduationCap, BarChart3, Plus, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

interface OrgStudent {
  id: string;
  name: string;
  email: string;
  level: number;
  unlockedSkills: number;
  averageGrade: number;
}

export const OrganizationDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [viewTab, setViewTab] = useState<'schools' | 'universities' | 'companies'>('schools');
  const [students, setStudents] = useState<OrgStudent[]>([
    { id: 's1', name: 'Հրանտ Միրզոյան (Hrant)', email: 'hrant@ysu.am', level: 4, unlockedSkills: 8, averageGrade: 92 },
    { id: 's2', name: 'Մարիամ Աբգարյան (Mariam)', email: 'mariam@seua.am', level: 3, unlockedSkills: 5, averageGrade: 88 },
    { id: 's3', name: 'Դավիթ Ղազարյան (Davit)', email: 'davit@krtlab.com', level: 2, unlockedSkills: 3, averageGrade: 74 }
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error(t('common.error'), { description: 'Լրացրեք բոլոր պարտադիր դաշտերը:' });
      return;
    }

    const newStudent: OrgStudent = {
      id: `std_${Date.now()}`,
      name,
      email,
      level: 1,
      unlockedSkills: 1,
      averageGrade: 100
    };

    setStudents(prev => [...prev, newStudent]);
    setIsOpen(false);
    setName('');
    setEmail('');
    toast.success(t('common.success'), { description: 'Ուսանողը հաջողությամբ գրանցվեց համակարգում:' });
  };

  return (
    <div className="space-y-8" id="organization-dashboard-container">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-primary" size={32} />
            {t('orgDashboard.title')}
          </h2>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            {t('orgDashboard.subtitle')}
          </p>
        </div>

        {/* Enroll student action */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 font-bold text-sm cursor-pointer"
        >
          <Plus size={18} />
          {t('orgDashboard.addStudent')}
        </button>
      </div>

      {/* Organization Type Selector */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 max-w-md shadow-sm">
        <button
          onClick={() => setViewTab('schools')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewTab === 'schools' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          {t('orgDashboard.schools')}
        </button>
        <button
          onClick={() => setViewTab('universities')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewTab === 'universities' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          {t('orgDashboard.universities')}
        </button>
        <button
          onClick={() => setViewTab('companies')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewTab === 'companies' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          {t('orgDashboard.companies')}
        </button>
      </div>

      {/* Aggregated Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <Users className="text-primary mb-2" size={24} />
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('orgDashboard.activeStudents')}</span>
          <span className="text-2xl font-black text-slate-900">{students.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <Trophy className="text-primary mb-2" size={24} />
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('orgDashboard.averageGrade')}</span>
          <span className="text-2xl font-black text-slate-900">84.6%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <GraduationCap className="text-primary mb-2" size={24} />
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Դասընթացի Ավարտ</span>
          <span className="text-2xl font-black text-slate-900">76.2%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <BarChart3 className="text-primary mb-2" size={24} />
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('orgDashboard.cohortRetention')}</span>
          <span className="text-2xl font-black text-slate-900">92.8%</span>
        </div>
      </div>

      {/* AI Cohort Analysis */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden border border-slate-800 shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest mb-3">
          <Sparkles size={14} className="animate-pulse" />
          <span>{t('orgDashboard.aiCohortAnalysis')}</span>
        </div>
        <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-xl">
          ԱԲ վերլուծությունը ցույց է տալիս, որ ձեր խմբի ուսանողների <span className="text-white font-extrabold">88%-ը</span> դժվարանում է <span className="text-white font-extrabold">Drizzle ORM-ի Schema Migration-ի</span> հետ։ Խորհուրդ է տրվում ակտիվացնել ինտերակտիվ լաբորատորիայի լրացուցիչ վարժությունները:
        </p>
      </div>

      {/* Roster list */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900">{t('orgDashboard.studentManagement')}</h3>
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-xs font-bold">
            Cohort: Spring 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-6">Անուն / Էլ. փոստ</th>
                <th className="p-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Մակարդակ (Level)</th>
                <th className="p-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Հմտություններ</th>
                <th className="p-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Միջին Գնահատական</th>
                <th className="p-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider pr-6 text-right">Գործողություն</th>
              </tr>
            </thead>
            <tbody>
              {students.map((std) => (
                <tr key={std.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-extrabold text-slate-900 text-sm">{std.name}</div>
                    <div className="text-slate-400 text-xs font-medium">{std.email}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-700 text-xs">Level {std.level}</td>
                  <td className="p-4 font-bold text-slate-700 text-xs">{std.unlockedSkills} ապակողպված</td>
                  <td className="p-4 font-bold text-slate-900 text-xs">
                    <span className={`px-2 py-1 rounded-lg font-black ${std.averageGrade >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                      {std.averageGrade}%
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button className="text-xs font-extrabold text-slate-700 hover:text-primary transition-colors cursor-pointer">
                      Անալիտիկա
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Form Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-900 mb-4">{t('orgDashboard.addStudent')}</h3>
              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Full Name (Լրիվ Անուն)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Օրինակ՝ Արթուր Դավթյան"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase">Email Address (Էլ. փոստ)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.am"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-xs font-medium mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs"
                  >
                    {t('orgDashboard.addStudent')}
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
