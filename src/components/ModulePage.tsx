import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, BookOpen, Compass, Milestone } from 'lucide-react';

interface ModulePageProps {
  onBack: () => void;
}

export const ModulePage: React.FC<ModulePageProps> = ({ onBack }) => {
  return (
    <motion.div
      id="module-page"
      key="module-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Header and Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            id="module-back-button"
            onClick={onBack}
            className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all text-sm font-bold mb-4 focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Հետ դեպի Գլխավոր</span>
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Module Page</h2>
          <p className="text-slate-500 font-medium mt-2">
            Բարի գալուստ ուսումնական նոր մոդուլների էջ։ Այստեղ դուք կարող եք ուսումնասիրել լրացուցիչ թեմաներ և ընդլայնել ձեր գիտելիքները։
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
        {/* Abstract background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="max-w-2xl relative z-10">
          <div className="w-12 h-12 bg-primary/15 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <BookOpen size={24} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-4">Ուսումնական Մոդուլների Պլատֆորմ</h3>
          
          <p className="text-slate-600 leading-relaxed mb-8 font-medium">
            Սա նոր ուսումնական մոդուլի տեղապահ է (placeholder description): Ապագայում այս բաժնում կավելացվեն ինտերակտիվ դասընթացներ,
            գործնական առաջադրանքներ, սիմուլյացիաներ և այլ կրթական նյութեր, որոնք կօգնեն ձեզ ավելի խորությամբ յուրացնել առարկաները:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-primary">Մոդուլ 1</span>
                <Milestone size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <h4 className="font-bold text-slate-950 mb-1">Հիմնարար Գիտելիքներ</h4>
              <p className="text-xs text-slate-500">Բացահայտեք հիմունքները և ներածական թեմաները։</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-secondary">Մոդուլ 2</span>
                <Compass size={16} className="text-slate-400 group-hover:text-secondary transition-colors" />
              </div>
              <h4 className="font-bold text-slate-950 mb-1">Գործնական Կիրառություն</h4>
              <p className="text-xs text-slate-500">Իրական օրինակներ և ինտերակտիվ լաբորատորիաներ։</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
