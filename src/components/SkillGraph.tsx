import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { Sparkles, GitCommit, Compass, CheckCircle, Lock, Play, Layers, Award } from 'lucide-react';

interface SkillNode {
  id: string;
  label: string;
  category: string;
  status: 'completed' | 'in-progress' | 'locked';
  x: number; // For visualization
  y: number;
  prerequisites: string[];
  recommendation: string;
  unlockedLevel: number;
}

const INITIAL_SKILLS: SkillNode[] = [
  { id: 'prog', label: 'Programming Foundation', category: 'Core', status: 'completed', x: 200, y: 50, prerequisites: [], recommendation: 'Դուք արդեն տիրապետում եք հիմնադրույթներին։', unlockedLevel: 2 },
  { id: 'py', label: 'Python Automation', category: 'Language', status: 'completed', x: 200, y: 150, prerequisites: ['prog'], recommendation: 'Սովորեք գրել սցենարներ և ավտոմատացնել գործընթացները:', unlockedLevel: 3 },
  { id: 'ai', label: 'AI Principles', category: 'Artificial Intelligence', status: 'in-progress', x: 100, y: 255, prerequisites: ['py'], recommendation: 'Բացահայտեք նեյրոնային ցանցերի և LLM-ների գործունեությունը:', unlockedLevel: 4 },
  { id: 'ml', label: 'Machine Learning Models', category: 'Data Science', status: 'locked', x: 100, y: 370, prerequisites: ['ai'], recommendation: 'Իմացեք սուպերվայզդ և անսուպերվայզդ ալգորիթմների կառուցումը:', unlockedLevel: 5 },
  { id: 'robotics', label: 'Robotics Control Systems', category: 'Hardware', status: 'in-progress', x: 300, y: 255, prerequisites: ['py'], recommendation: 'Կառավարեք ֆիզիկական սարքերը՝ օգտագործելով կոդ:', unlockedLevel: 4 },
  { id: 'adv_robotics', label: 'Advanced Robotics Engineering', category: 'Hardware', status: 'locked', x: 300, y: 370, prerequisites: ['robotics', 'ml'], recommendation: 'Ստեղծեք ինքնավար ռոբոտներ՝ համակարգչային տեսողությամբ և ML-ով։', unlockedLevel: 6 }
];

export const SkillGraph: React.FC = () => {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<SkillNode[]>(INITIAL_SKILLS);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(skills[2]); // Default selected is AI Principles

  const totalUnlocked = skills.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-8" id="skill-graph-container">
      {/* Header section */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <GitCommit className="text-primary rotate-45" size={32} />
          {t('skillGraph.title')}
        </h2>
        <p className="text-slate-500 font-medium mt-2 max-w-xl">
          {t('skillGraph.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive SVG Graph Area */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div className="flex items-center justify-between mb-4 z-10">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('skillGraph.interactiveGraph')}</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                {t('skillGraph.completedSkills')}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                {t('skillGraph.inProgressSkills')}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500">
                <span className="w-2.5 h-2.5 bg-slate-350 rounded-full" />
                {t('skillGraph.lockedSkills')}
              </span>
            </div>
          </div>

          {/* Interactive SVG Map */}
          <div className="relative flex-1 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden flex items-center justify-center p-4 min-h-[400px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Draw dependency lines */}
              <line x1="50%" y1="10%" x2="50%" y2="30%" stroke="#e2e8f0" strokeWidth="3" />
              <line x1="50%" y1="30%" x2="25%" y2="50%" stroke="#e2e8f0" strokeWidth="3" />
              <line x1="50%" y1="30%" x2="75%" y2="50%" stroke="#e2e8f0" strokeWidth="3" />
              <line x1="25%" y1="50%" x2="25%" y2="75%" stroke="#e2e8f0" strokeWidth="3" />
              <line x1="75%" y1="50%" x2="75%" y2="75%" stroke="#e2e8f0" strokeWidth="3" />
              
              {/* Highlight active connections */}
              <line x1="50%" y1="10%" x2="50%" y2="30%" stroke="#10b981" strokeWidth="3" strokeDasharray="5,5" className="animate-[dash_2s_linear_infinite]" />
            </svg>

            {/* Interactive Nodes Absolute Overlays */}
            <div className="absolute inset-0 flex flex-col justify-around py-4">
              {/* Tier 1: Core Foundation */}
              <div className="flex justify-center z-10">
                <NodeButton node={skills[0]} isSelected={selectedNode?.id === skills[0].id} onClick={() => setSelectedNode(skills[0])} />
              </div>

              {/* Tier 2: Languages */}
              <div className="flex justify-center z-10">
                <NodeButton node={skills[1]} isSelected={selectedNode?.id === skills[1].id} onClick={() => setSelectedNode(skills[1])} />
              </div>

              {/* Tier 3: AI and Robotics Branches */}
              <div className="flex justify-around px-4 sm:px-12 z-10">
                <NodeButton node={skills[2]} isSelected={selectedNode?.id === skills[2].id} onClick={() => setSelectedNode(skills[2])} />
                <NodeButton node={skills[4]} isSelected={selectedNode?.id === skills[4].id} onClick={() => setSelectedNode(skills[4])} />
              </div>

              {/* Tier 4: Machine Learning and Advanced Robotics */}
              <div className="flex justify-around px-4 sm:px-12 z-10">
                <NodeButton node={skills[3]} isSelected={selectedNode?.id === skills[3].id} onClick={() => setSelectedNode(skills[3])} />
                <NodeButton node={skills[5]} isSelected={selectedNode?.id === skills[5].id} onClick={() => setSelectedNode(skills[5])} />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-bold mt-2 text-center">
            {t('skillGraph.clickNode')}
          </div>
        </div>

        {/* Sidebar details panels */}
        <div className="space-y-6">
          {/* Node details */}
          {selectedNode && (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-md space-y-4">
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                {selectedNode.category}
              </span>

              <h3 className="text-xl font-black text-slate-900">{selectedNode.label}</h3>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-slate-500">Կարգավիճակ՝</span>
                {selectedNode.status === 'completed' && (
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <CheckCircle size={14} /> {t('common.completed')}
                  </span>
                )}
                {selectedNode.status === 'in-progress' && (
                  <span className="text-primary font-extrabold flex items-center gap-1 animate-pulse">
                    <Compass size={14} /> Ուսումնասիրվում է
                  </span>
                )}
                {selectedNode.status === 'locked' && (
                  <span className="text-slate-400 font-extrabold flex items-center gap-1">
                    <Lock size={14} /> {t('skillGraph.lockedSkills')}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prerequisites (Նախապայմաններ)</span>
                <span className="text-xs font-bold text-slate-700">
                  {selectedNode.prerequisites.length === 0 ? 'Չկան' : selectedNode.prerequisites.map(p => skills.find(s => s.id === p)?.label).join(', ')}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">ԱԲ Առաջարկություններ</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedNode.recommendation}
                </p>
              </div>

              {selectedNode.status !== 'locked' ? (
                <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
                  <Play size={12} fill="currentColor" />
                  <span>Շարունակել ուսումը</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-bold leading-relaxed">
                  <Lock size={16} className="shrink-0" />
                  <span>Բացեք նախորդ հմտությունները՝ այս բաժինը ակտիվացնելու համար։</span>
                </div>
              )}
            </div>
          )}

          {/* AI Recommended Path Indicator */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-[2rem] p-6 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <Sparkles className="text-secondary" size={18} />
              <h4 className="text-sm font-black uppercase tracking-wider text-secondary">{t('skillGraph.recommendedPath')}</h4>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {t('skillGraph.recommendationMsg')}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {t('skillGraph.totalUnlocked')}
              </span>
              <span className="text-lg font-black text-white">{totalUnlocked} / {skills.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Helper sub-component for Skill Nodes */
const NodeButton: React.FC<{ node: SkillNode; isSelected: boolean; onClick: () => void }> = ({ node, isSelected, onClick }) => {
  const isCompleted = node.status === 'completed';
  const isInProgress = node.status === 'in-progress';

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2 border cursor-pointer ${
        isSelected
          ? 'bg-primary text-white border-primary scale-110 ring-4 ring-primary/20 z-20'
          : isCompleted
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:scale-105'
          : isInProgress
          ? 'bg-white text-primary border-primary/30 hover:border-primary hover:scale-105 animate-[pulse_3s_infinite]'
          : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-100 hover:scale-105'
      }`}
    >
      {isCompleted && <CheckCircle size={14} className="text-emerald-500" />}
      {isInProgress && <Compass size={14} className="text-primary" />}
      {!isCompleted && !isInProgress && <Lock size={12} className="text-slate-400" />}
      <span>{node.label}</span>
    </button>
  );
};
