import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder } from 'motion/react';
import { GripVertical, CheckCircle2, Timer as TimerIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GameSessionResult } from '../../types';

interface SortItem {
  id: string;
  text: string;
  order: number;
}

interface SortingGameProps {
  dataset: { items: SortItem[] };
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

export const SortingGame: React.FC<SortingGameProps> = ({ dataset, onComplete, internalLevel = 1 }) => {
  const [items, setItems] = useState<SortItem[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scaling logic
  const itemsList = dataset?.items || [];
  const itemCount = Math.min(itemsList.length, 3 + (internalLevel - 1));

  useEffect(() => {
    if (itemsList.length === 0) return;
    const subset = [...itemsList]
      .sort((a, b) => (a?.order || 0) - (b?.order || 0))
      .slice(0, itemCount)
      .sort(() => Math.random() - 0.5);
    setItems(subset);

    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [dataset, itemCount]);

  const checkOrder = (newItems: SortItem[]) => {
    setItems(newItems);
    const correct = newItems.every((item, index) => {
      // Re-map the order for the subset
      const sortedSubset = [...newItems].sort((a, b) => a.order - b.order);
      return item.id === sortedSubset[index].id;
    });

    if (correct) {
      setIsCorrect(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const duration = (Date.now() - startTime) / 1000;
      setTimeout(() => {
        onComplete(100, {
          accuracy: 100,
          reactionTime: Math.round((duration / itemCount) * 1000),
          completionTime: duration,
          errorCount: 0, // Sorting doesn't track intermediate errors easily here
          timestamp: new Date().toISOString(),
          difficultyLevel: internalLevel
        });
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <TimerIcon size={18} />
          <span>{timer}վ</span>
        </div>
        <div className="text-xs font-black text-slate-400">
          Մակարդակ: <span className="text-accent">{internalLevel}</span>
        </div>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={checkOrder} className="space-y-3">
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className={cn(
              "p-6 bg-white border-2 rounded-2xl flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all shadow-sm",
              isCorrect ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-accent/30"
            )}
          >
            <GripVertical className="text-slate-300" size={20} />
            <span className="flex-1 font-bold text-slate-700">{displayText(item.text)}</span>
            {isCorrect && <CheckCircle2 className="text-emerald-500" size={24} />}
          </Reorder.Item>
        ))}
      </Reorder.Group>
      
      {isCorrect && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-emerald-600 font-black"
        >
          Ճիշտ հերթականություն:
        </motion.p>
      )}
    </div>
  );
};
