import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, Timer as TimerIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GameSessionResult } from '../../types';

interface MemoryItem {
  id: string;
  text: string;
  matchId: string;
}

interface MemoryMatchProps {
  dataset: { pairs: MemoryItem[] };
  onComplete: (score: number, result: GameSessionResult) => void;
  internalLevel?: number;
}

const displayText = (val: any): string => {
  if (typeof val === 'string') return val;
  if (!val) return '';
  if (typeof val === 'object') {
    return val.armenian || val.english || val.text || JSON.stringify(val);
  }
  return String(val);
};

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ dataset, onComplete, internalLevel = 1 }) => {
  const [cards, setCards] = useState<(MemoryItem & { isFlipped: boolean; isMatched: boolean })[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scaling logic based on internal level
  const pairs = dataset?.pairs || [];
  const pairCount = Math.min(pairs.filter(p => p?.id && !p.id.endsWith('m')).length, 4 + (internalLevel - 1) * 2);
  const timeLimit = internalLevel === 1 ? null : 120 - (internalLevel * 15);

  useEffect(() => {
    // Deduplicate and filter pairs based on difficulty
    if (pairs.length === 0) return;
    const uniquePairs = pairs.filter(p => p?.id && !p.id.endsWith('m')).slice(0, pairCount);
    const gamePairs = uniquePairs.flatMap(p => {
      const match = pairs.find(m => m?.id === p.matchId);
      return [p, match!];
    });

    const shuffled = gamePairs
      .sort(() => Math.random() - 0.5)
      .map(card => ({ ...card, isFlipped: false, isMatched: false }));
    setCards(shuffled);
  }, [dataset, pairCount]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleFlip = useCallback((index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIds.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIds, index];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const isMatch = cards[firstIdx].matchId === cards[secondIdx].id;

      if (isMatch) {
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[firstIdx].isMatched = true;
            next[secondIdx].isMatched = true;
            return next;
          });
          setFlippedIds([]);
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === pairCount) {
              if (timerRef.current) clearInterval(timerRef.current);
              const duration = (Date.now() - startTime) / 1000;
              const accuracy = Math.round((pairCount / (pairCount + errors)) * 100);
              onComplete(accuracy, {
                accuracy,
                reactionTime: Math.round((duration / (pairCount + errors)) * 1000),
                completionTime: duration,
                errorCount: errors,
                timestamp: new Date().toISOString(),
                difficultyLevel: internalLevel
              });
            }
            return newMatches;
          });
        }, 500);
      } else {
        setErrors(e => e + 1);
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[firstIdx].isFlipped = false;
            next[secondIdx].isFlipped = false;
            return next;
          });
          setFlippedIds([]);
        }, 1000);
      }
    }
  }, [cards, flippedIds, pairCount, errors, startTime, onComplete, internalLevel]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <TimerIcon size={18} />
          <span>{timer}վ</span>
          {timeLimit && <span className="text-slate-300">/ {timeLimit}վ</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Սխալներ:</span>
          <span className="text-sm font-black text-red-500">{errors}</span>
        </div>
      </div>

      <div className={cn(
        "grid gap-4",
        pairCount <= 4 ? "grid-cols-2" : pairCount <= 6 ? "grid-cols-3" : "grid-cols-4"
      )}>
        {cards.map((card, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFlip(i)}
            className={cn(
              "h-28 rounded-2xl flex items-center justify-center p-3 text-center transition-all duration-500",
              card.isFlipped || card.isMatched 
                ? "bg-white border-2 border-accent text-slate-800 shadow-md" 
                : "bg-slate-900 text-white shadow-lg"
            )}
          >
            <div className="text-xs font-bold leading-tight">
              {(card.isFlipped || card.isMatched) ? displayText(card.text) : <Brain size={24} className="opacity-20" />}
            </div>
            {card.isMatched && (
              <div className="absolute top-2 right-2 text-emerald-500">
                <CheckCircle2 size={14} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
