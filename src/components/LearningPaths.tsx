import React from 'react';
import { motion } from 'motion/react';
import { 
  CATEGORIZED_LEARNING_PATHS, 
  RECOMMENDED_PATHS, 
  LearningPath, 
  Difficulty,
  getPersonalizedPaths
} from '../data/learningPaths';
import { UserProfile } from '../types';
import { 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Star, 
  ChevronRight, 
  Layout, 
  TrendingUp,
  Brain,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LearningPathsProps {
  onStartPath: (path: LearningPath) => void;
  completedSteps: string[]; // IDs of completed steps in format "categoryId-subfieldId-levelId"
  profile?: UserProfile;
}

export const LearningPaths: React.FC<LearningPathsProps> = ({ onStartPath, completedSteps, profile }) => {
  const getProgress = (path: LearningPath) => {
    const totalSteps = path.steps.length;
    if (totalSteps === 0) return 0;
    const completedCount = path.steps.filter(step => 
      completedSteps.includes(`${step.categoryId}-${step.subfieldId}-${step.levelId}`)
    ).length;
    return (completedCount / totalSteps) * 100;
  };

  const personalizedPaths = profile?.discovery 
    ? getPersonalizedPaths(profile.discovery.goal, profile.discovery.skillLevel)
    : [];

  return (
    <div className="space-y-24 pb-20">
      {/* Header Section */}
      <section className="space-y-6 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-accent/10 px-5 py-2.5 rounded-full border border-accent/20"
        >
          <Zap size={18} className="text-accent" />
          <span className="text-sm font-black text-accent uppercase tracking-widest">Ուսումնական Ուղիներ</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight"
        >
          Հասիր քո նպատակներին
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 font-medium leading-relaxed"
        >
          Հետևիր մասնագիտական ուղիներին, որոնք նախագծված են քո առաջընթացը արագացնելու համար:
        </motion.p>
      </section>

      {/* Personalized Paths Section */}
      {personalizedPaths.length > 0 && (
        <section className="space-y-10">
          <div className="flex items-center justify-between px-4 sm:px-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Քեզ համար առանձնացված</h2>
                <p className="text-slate-500 font-medium text-sm">Հիմնված քո նպատակների և մակարդակի վրա</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personalizedPaths.map((path, idx) => (
              <PathCard 
                key={path.id} 
                path={path} 
                progress={getProgress(path)} 
                onStart={onStartPath}
                index={idx}
                isHighlight={idx === 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Paths - Horizontal Scroll */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-4 sm:px-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
              <Star size={24} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Առաջարկվող Ուղիներ</h2>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-8 pb-10 -mx-4 px-4 sm:-mx-8 sm:px-8 hide-scrollbar">
          {RECOMMENDED_PATHS.map((path, idx) => (
            <PathCard 
              key={path.id} 
              path={path} 
              progress={getProgress(path)} 
              onStart={onStartPath}
              index={idx}
              isHighlight
            />
          ))}
        </div>
      </section>

      {/* Categorized Sections */}
      <div className="space-y-20">
        {CATEGORIZED_LEARNING_PATHS.map((category, catIdx) => (
          <section key={category.id} className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm transition-transform hover:scale-110">
                    <category.icon size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{category.title}</h2>
                </div>
                <p className="text-slate-500 font-medium text-lg max-w-2xl">{category.description}</p>
              </div>
              <div className="text-sm font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                {category.paths.length} Ուղի
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {category.paths.map((path, pathIdx) => (
                <PathCard 
                  key={path.id} 
                  path={path} 
                  progress={getProgress(path)} 
                  onStart={onStartPath}
                  index={pathIdx}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

interface PathCardProps {
  path: LearningPath;
  progress: number;
  onStart: (path: LearningPath) => void;
  index: number;
  isHighlight?: boolean;
}

const PathCard: React.FC<PathCardProps> = ({ path, progress, onStart, index, isHighlight }) => {
  const Icon = path.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={cn(
        "flex-shrink-0 flex flex-col justify-between bg-white rounded-[3rem] p-8 sm:p-10 border transition-all duration-500 group relative overflow-hidden",
        isHighlight 
          ? "w-[320px] sm:w-[400px] border-amber-100 shadow-2xl shadow-amber-200/30" 
          : "border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50"
      )}
    >
      {isHighlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
      )}
      
      <div className="space-y-8 relative">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:rotate-6",
            isHighlight ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-200" : "bg-gradient-brand shadow-primary/20"
          )}>
            <Icon size={32} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
              path.difficulty === 'Beginner' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              path.difficulty === 'Intermediate' ? "bg-blue-50 text-blue-600 border-blue-100" :
              "bg-purple-50 text-purple-600 border-purple-100"
            )}>
              {path.difficulty}
            </span>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <Clock size={12} />
              <span>{path.duration}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
            {path.title}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed text-base line-clamp-2">
            {path.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Առաջընթաց</span>
            <span className="text-sm font-black text-slate-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isHighlight ? "bg-amber-500" : "bg-primary"
              )}
            />
          </div>
        </div>

        {/* Lessons List preview */}
        <div className="space-y-4 pt-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ուղու քայլերը</p>
          <div className="space-y-2.5">
            {path.steps.slice(0, 3).map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-600 group/item">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all group-hover/item:scale-150",
                  isHighlight ? "bg-amber-400" : "bg-primary"
                )} />
                <span className="font-bold line-clamp-1">{step.title}</span>
              </div>
            ))}
            {path.steps.length > 3 && (
              <p className="text-[10px] text-slate-400 font-black pl-4 uppercase tracking-widest">
                ... և ևս {path.steps.length - 3} դաս
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => onStart(path)}
        className={cn(
          "mt-10 w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all uppercase tracking-widest group-hover:shadow-xl",
          isHighlight 
            ? "bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600" 
            : "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
        )}
      >
        Սկսել Ուղին
        <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
};
