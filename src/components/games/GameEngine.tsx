import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  ChevronRight, 
  Brain, 
  Timer, 
  Target, 
  Layers,
  ArrowLeft,
  X,
  Rocket
} from 'lucide-react';
import { UniversalGame, GameSessionResult } from '../../types';
import { MemoryMatch } from './MemoryMatch';
import { SortingGame } from './SortingGame';
import { ApplicationScenario } from './ApplicationScenario';
import { SimulationGame } from './SimulationGame';
import { cn } from '../../lib/utils';
import { useUserProfile } from '../../hooks/useUserProfile';
import { AdaptiveGameService } from '../../services/adaptiveGameService';

interface GameEngineProps {
  games: UniversalGame[];
  onAllComplete: (totalScore: number) => void;
  onExit: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ games, onAllComplete, onExit }) => {
  const { profile, updateGameScore } = useUserProfile();
  const [currentGameIdx, setCurrentGameIdx] = useState<number | null>(null);
  const [completedGames, setCompletedGames] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleGameComplete = (score: number, result?: GameSessionResult) => {
    if (currentGameIdx === null) return;
    const game = games[currentGameIdx];
    
    // Save adaptive stats to profile
    updateGameScore(game.id, score, game.scoringSystem.basePoints, result);
    
    setCompletedGames(prev => ({ ...prev, [game.id]: score }));
    
    setTimeout(() => {
      setCurrentGameIdx(null);
      if (Object.keys(completedGames).length + 1 === games.length) {
        setShowResult(true);
      }
    }, 1000);
  };

  const getInternalLevel = (gameId: string) => {
    return profile?.gameAdaptiveStats?.[gameId]?.currentInternalLevel || 1;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'memory': return <Brain size={24} />;
      case 'sorting': return <Layers size={24} />;
      case 'application': return <Target size={24} />;
      case 'speed': return <Timer size={24} />;
      case 'quiz': return <Gamepad2 size={24} />;
      case 'simulation': return <Rocket size={24} />;
      default: return <Gamepad2 size={24} />;
    }
  };

  const renderGame = () => {
    if (currentGameIdx === null) return null;
    const game = games[currentGameIdx];
    const internalLevel = getInternalLevel(game.id);

    switch (game.type) {
      case 'memory':
        return <MemoryMatch 
                dataset={game.dataset} 
                onComplete={handleGameComplete} 
                internalLevel={internalLevel}
               />;
      case 'sorting':
        return <SortingGame dataset={game.dataset} onComplete={handleGameComplete} />;
      case 'application':
        return <ApplicationScenario dataset={game.dataset} onComplete={handleGameComplete} />;
      case 'simulation':
        return <SimulationGame dataset={game.dataset} onComplete={handleGameComplete} />;
      case 'speed':
      case 'quiz':
        return <ApplicationScenario 
                dataset={{ scenario: game.instructions, stages: game.dataset.questions }} 
                onComplete={handleGameComplete} 
               />;
      default:
        return <div className="text-center p-12">Խաղի տեսակը ժամանակավորապես անհասանելի է:</div>;
    }
  };

  if (showResult) {
    const scores = Object.values(completedGames);
    const totalScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => (a as number) + (b as number), 0) as number / games.length)
      : 0;
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-12 py-12"
      >
        <div className="w-40 h-40 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
          <Trophy size={80} />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">Լաբորատորիան Անցած է!</h2>
          <div className="inline-flex items-center gap-6 bg-slate-900 text-white px-10 py-6 rounded-3xl shadow-xl">
            <span className="text-slate-400 uppercase font-black tracking-widest text-sm">Խաղերի Միջին՝</span>
            <span className="text-5xl font-black text-emerald-400">{totalScore}%</span>
          </div>
        </div>
        <button
          onClick={() => onAllComplete(totalScore)}
          className="bg-gradient-brand text-white px-16 py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all glow-cyan-hover uppercase tracking-widest"
        >
          Ամբողջացնել Դասընթացը
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 p-4">
      {currentGameIdx === null ? (
        <div className="space-y-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mb-4">
              <Gamepad2 size={40} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Գործնական Խաղեր</h2>
            <p className="text-slate-500 text-lg max-w-lg font-medium">
              Ամրապնդիր ստացված գիտելիքները ինտերակտիվ խաղերի միջոցով:
            </p>
          </div>

          <div className="grid gap-6">
            {games.map((game, i) => (
              <motion.button
                key={game.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentGameIdx(i)}
                disabled={!!completedGames[game.id]}
                className={cn(
                  "p-8 rounded-[2.5rem] flex items-center gap-6 text-left transition-all border-2",
                  completedGames[game.id] 
                    ? "bg-slate-50 border-slate-100 opacity-60 grayscale" 
                    : "bg-white border-slate-100 shadow-xl shadow-slate-100 hover:border-accent/40"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                  completedGames[game.id] ? "bg-slate-200 text-slate-400" : "bg-accent/10 text-accent"
                )}>
                  {getIcon(game.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{game.title}</h3>
                    {completedGames[game.id] !== undefined && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-black">
                        {completedGames[game.id]}%
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed">{game.instructions}</p>
                </div>
                {completedGames[game.id] === undefined && (
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg">
                    <ChevronRight size={24} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <button
              onClick={() => setCurrentGameIdx(null)}
              className="flex items-center gap-3 text-slate-400 font-black hover:text-slate-600 transition-all uppercase tracking-widest text-xs"
            >
              <ArrowLeft size={20} />
              Բոլոր Խաղերը
            </button>
            <div className="flex items-center gap-4">
              <span className="text-slate-300 font-bold">|</span>
              <h3 className="font-black text-xl text-slate-800 tracking-tight">{games[currentGameIdx].title}</h3>
            </div>
            <div className="w-24" /> {/* Spacer */}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentGameIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
            >
              {renderGame()}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
