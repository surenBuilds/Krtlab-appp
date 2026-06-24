import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, CheckCircle2, XCircle, RefreshCcw, Gamepad2, Brain, Zap, Target, Calculator, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUserProfile } from '../hooks/useUserProfile';
import { toast } from 'sonner';

interface GameCardProps {
  key?: string | number;
  title: string;
  description: string;
  difficulty: 'Հեշտ' | 'Միջին' | 'Բարդ' | string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, difficulty, icon, onClick, color }) => (
  <motion.button
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left flex flex-col gap-6 group relative overflow-hidden"
  >
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
    <div className="flex items-center justify-between mt-auto">
      <span className={cn(
        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
        difficulty === 'Հեշտ' ? "bg-emerald-50 text-emerald-600" :
        difficulty === 'Միջին' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
      )}>
        {difficulty}
      </span>
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
        <Gamepad2 size={20} />
      </div>
    </div>
  </motion.button>
);

export const GamesSection = () => {
  const { profile, updateGameScore } = useUserProfile();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      id: 'memory',
      title: 'Հիշողության Մարտահրավեր',
      description: 'Գտեք զույգերը և ամրապնդեք ձեր տեսողական հիշողությունը:',
      difficulty: 'Միջին',
      icon: <Brain size={28} />,
      color: 'bg-indigo-500 shadow-indigo-200'
    },
    {
      id: 'quiz',
      title: 'Արագ Թեստ',
      description: 'Պատասխանեք հարցերին՝ որքան հնարավոր է արագ և ճիշտ:',
      difficulty: 'Հեշտ',
      icon: <CheckCircle2 size={28} />,
      color: 'bg-emerald-500 shadow-emerald-200'
    },
    {
      id: 'reaction',
      title: 'Ռեակցիայի Փորձ',
      description: 'Ստուգեք ձեր ուշադրությունը և արձագանքման արագությունը:',
      difficulty: 'Բարդ',
      icon: <Zap size={28} />,
      color: 'bg-amber-500 shadow-amber-200'
    },
    {
      id: 'focus',
      title: 'Կենտրոնացում',
      description: 'Գտեք տարբերվող տարրը խառնաշփոթի մեջ:',
      difficulty: 'Միջին',
      icon: <Target size={28} />,
      color: 'bg-rose-500 shadow-rose-200'
    },
    {
      id: 'math',
      title: 'Մաթեմատիկական Արագություն',
      description: 'Լուծեք հաշվարկային խնդիրներ՝ ժամանակի դեմ պայքարում:',
      difficulty: 'Միջին',
      icon: <Calculator size={28} />,
      color: 'bg-blue-500 shadow-blue-200'
    }
  ];

  if (activeGame === 'memory') return <MemoryGame onExit={() => setActiveGame(null)} updateScore={(s, xp) => updateGameScore('memory', s, xp)} highScore={profile?.gameHighScores?.['memory'] || 0} />;
  if (activeGame === 'quiz') return <QuickQuizGame onExit={() => setActiveGame(null)} updateScore={(s, xp) => updateGameScore('quiz', s, xp)} highScore={profile?.gameHighScores?.['quiz'] || 0} />;
  if (activeGame === 'reaction') return <ReactionGame onExit={() => setActiveGame(null)} updateScore={(s, xp) => updateGameScore('reaction', s, xp)} highScore={profile?.gameHighScores?.['reaction'] || 0} />;
  if (activeGame === 'focus') return <FocusGame onExit={() => setActiveGame(null)} updateScore={(s, xp) => updateGameScore('focus', s, xp)} highScore={profile?.gameHighScores?.['focus'] || 0} />;
  if (activeGame === 'math') return <MathGame onExit={() => setActiveGame(null)} updateScore={(s, xp) => updateGameScore('math', s, xp)} highScore={profile?.gameHighScores?.['math'] || 0} />;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ուսումնական Խաղեր</h2>
          <p className="text-slate-500 font-medium mt-1">Կրթությունը դարձրեք հետաքրքիր մարտահրավեր:</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <Trophy className="text-amber-400" size={24} />
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ընդհանուր XP</p>
            <p className="text-lg font-black text-slate-900">{profile?.xp || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map(game => (
          <GameCard 
            key={game.id}
            title={game.title}
            description={game.description}
            difficulty={game.difficulty}
            icon={game.icon}
            color={game.color}
            onClick={() => setActiveGame(game.id)}
          />
        ))}
      </div>
    </div>
  );
};

// --- INDIVIDUAL GAME COMPONENTS ---

const MemoryGame = ({ onExit, updateScore, highScore }: { onExit: () => void, updateScore: (s: number, xp: number) => void, highScore: number }) => {
  const concepts = ['React', 'TS', 'Git', 'CSS', 'HTML', 'SQL', 'Python', 'AI'];
  const [cards, setCards] = useState<{ id: number, val: string, flipped: boolean, matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    const initialCards = [...concepts, ...concepts]
      .sort(() => Math.random() - 0.5)
      .map((val, i) => ({ id: i, val, flipped: false, matched: false }));
    setCards(initialCards);
  }, []);

  const handleCardClick = (id: number) => {
    if (selected.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newSelected;
      if (cards[first].val === cards[second].val) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setSelected([]);
        if (newCards.every(c => c.matched)) {
          setIsWon(true);
          updateScore(moves, 50);
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setSelected([]);
        }, 800);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
       <div className="flex justify-between items-center">
         <button onClick={onExit} className="text-slate-400 font-bold hover:text-slate-900 transition-colors">← Հետ դեպի խաղեր</button>
         <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 font-black text-slate-600">Քայլեր: {moves}</div>
           <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 font-black text-amber-600">Ռեկորդ: {highScore}</div>
         </div>
       </div>

       <div className="grid grid-cols-4 gap-4 aspect-square max-w-md mx-auto">
         {cards.map(card => (
           <motion.button
             key={card.id}
             whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => handleCardClick(card.id)}
             className={cn(
               "aspect-square rounded-2xl text-xl font-bold transition-all shadow-sm border-2",
               card.flipped || card.matched ? "bg-white border-primary text-primary" : "bg-slate-100 border-slate-100 text-transparent"
             )}
           >
             {card.flipped || card.matched ? card.val : '?'}
           </motion.button>
         ))}
       </div>

       <AnimatePresence>
         {isWon && (
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-6">
              <Trophy size={64} className="text-emerald-500 mx-auto" />
              <h2 className="text-4xl font-black text-emerald-900">Հրաշալի է:</h2>
              <p className="text-emerald-700 font-medium">Դուք բացեցիք բոլոր քարտերը {moves} քայլում:</p>
              <button onClick={() => window.location.reload()} className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200">Կրկնել</button>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

const QuickQuizGame = ({ onExit, updateScore, highScore }: { onExit: () => void, updateScore: (s: number, xp: number) => void, highScore: number }) => {
  const questions = [
    { q: 'Ո՞ր լեզուն է օգտագործվում վեբի կառուցվածքի համար:', a: ['HTML', 'CSS', 'JS', 'C++'], c: 0 },
    { q: 'Ի՞նչ է նշանակում CSS:', a: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Syntax', 'Colorful Style Sheets'], c: 0 },
    { q: 'React-ը ո՞ր ընկերության կողմից է ստեղծվել:', a: ['Google', 'Meta', 'Microsoft', 'Apple'], c: 1 },
    { q: 'JSON-ը նախատեսված է...', a: ['Տվյալների փոխանակման', 'Դիզայնի', 'Անվտանգության', 'Մոնտաժի'], c: 0 },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (i: number) => {
    if (i === questions[idx].c) setScore(s => s + 1);
    
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
    } else {
      setFinished(true);
      updateScore(score + (i === questions[idx].c ? 1 : 0), (score + (i === questions[idx].c ? 1 : 0)) * 25);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
       <button onClick={onExit} className="text-slate-400 font-bold hover:text-slate-900 transition-colors">← Հետ</button>
       
       <AnimatePresence mode="wait">
         {!finished ? (
           <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 space-y-12">
             <div className="flex justify-between items-center bg-slate-50 p-2 rounded-full px-4">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Հարց {idx+1}/{questions.length}</span>
               <span className="text-xs font-black text-primary uppercase tracking-widest">Միավոր: {score}</span>
             </div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">{questions[idx].q}</h3>
             <div className="grid gap-4">
               {questions[idx].a.map((opt, i) => (
                 <button key={i} onClick={() => handleAnswer(i)} className="w-full p-6 text-left border-2 border-slate-100 rounded-2xl font-bold hover:border-primary hover:bg-primary/5 transition-all text-slate-700">
                   {opt}
                 </button>
               ))}
             </div>
           </motion.div>
         ) : (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 space-y-10">
              <Award size={80} className="text-amber-400 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Ավարտվեց!</h2>
                <p className="text-slate-500 font-medium text-xl">Քո արդյունքը: <span className="text-primary font-black">{score}/{questions.length}</span></p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm font-bold text-slate-400 uppercase tracking-widest">
                Լավագույն արդյունք: {highScore}
              </div>
              <button onClick={() => { setIdx(0); setScore(0); setFinished(false); }} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:opacity-90 transition-all">
                <RefreshCcw /> Փորձել նորից
              </button>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

const ReactionGame = ({ onExit, updateScore, highScore }: { onExit: () => void, updateScore: (s: number, xp: number) => void, highScore: number }) => {
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState(0);
  const timerRef = useRef<any>(null);

  const start = () => {
    setState('waiting');
    const delay = 1000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setState('ready');
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      clearTimeout(timerRef.current);
      toast.error('Չափազանց շուտ!');
      setState('idle');
    } else if (state === 'ready') {
      const diff = Date.now() - startTime;
      setResult(diff);
      setState('result');
      updateScore(diff, diff < 200 ? 50 : diff < 400 ? 30 : 10);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 text-center">
       <div className="flex justify-between items-center mb-12">
         <button onClick={onExit} className="text-slate-400 font-bold hover:text-slate-900 transition-colors">← Հետ</button>
         <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 font-black text-amber-600">Լավագույն: {highScore ? `${highScore}ms` : '---'}</div>
       </div>

       <motion.button
         animate={{ 
           scale: state === 'ready' ? 1.05 : 1,
           backgroundColor: state === 'idle' ? '#F8FAFC' : state === 'waiting' ? '#F87171' : state === 'ready' ? '#10B981' : '#F8FAFC' 
         }}
         onClick={state === 'idle' || state === 'result' ? start : handleClick}
         className="w-full aspect-[2/1] rounded-[4rem] text-4xl font-black shadow-2xl flex items-center justify-center border-4 border-white transition-colors uppercase tracking-widest text-white cursor-pointer"
         style={{ color: state === 'idle' || state === 'result' ? '#1E293B' : 'white' }}
       >
         {state === 'idle' ? 'Սկսել' : state === 'waiting' ? 'Սպասիր...' : state === 'ready' ? 'ՍԵՂՄԻՐ!' : `${result}ms`}
       </motion.button>

       {state === 'result' && (
         <p className="text-slate-500 font-medium mt-8">
           {result < 200 ? '🚀 Ֆենոմենալ ռեակցիա!' : result < 300 ? '🔥 Շատ արագ!' : '💪 Լավ է, փորձիր էլի:'}
         </p>
       )}
    </div>
  );
};

const FocusGame = ({ onExit, updateScore, highScore }: { onExit: () => void, updateScore: (s: number, xp: number) => void, highScore: number }) => {
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState<{ id: number, val: string, special: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateLevel = useCallback((l: number) => {
    const size = Math.min(l + 2, 7);
    const count = size * size;
    const icons = ['🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑'];
    const pair = [icons[Math.floor(Math.random() * icons.length)], icons[Math.floor(Math.random() * icons.length)]];
    while (pair[0] === pair[1]) pair[1] = icons[Math.floor(Math.random() * icons.length)];

    const specialIdx = Math.floor(Math.random() * count);
    const newItems = Array.from({ length: count }).map((_, i) => ({
      id: i,
      val: i === specialIdx ? pair[1] : pair[0],
      special: i === specialIdx
    }));
    setItems(newItems);
  }, []);

  useEffect(() => generateLevel(1), [generateLevel]);

  const handleClick = (special: boolean) => {
    if (special) {
      setScore(s => s + 1);
      setLevel(l => l + 1);
      generateLevel(level + 1);
    } else {
      setGameOver(true);
      updateScore(score, score * 10);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 text-center">
       <div className="flex justify-between items-center mb-12">
          <button onClick={onExit} className="text-slate-400 font-bold hover:text-slate-900 transition-colors">← Հետ</button>
          <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 font-black text-rose-600 italic uppercase">Մակարդակ: {level}</div>
          <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 font-black text-amber-600">Ռեկորդ: {highScore}</div>
       </div>

       <AnimatePresence mode="wait">
         {!gameOver ? (
           <motion.div key={level} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid gap-2 mx-auto" style={{ gridTemplateColumns: `repeat(${Math.sqrt(items.length)}, 1fr)`, width: 'min(90vw, 400px)' }}>
             {items.map(item => (
               <button key={item.id} onClick={() => handleClick(item.special)} className="aspect-square bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-3xl flex items-center justify-center">
                 {item.val}
               </button>
             ))}
           </motion.div>
         ) : (
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 space-y-8">
              <Target size={80} className="text-rose-500 mx-auto" />
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Խաղն ավարտվեց:</h2>
              <p className="text-slate-500 font-medium">Քո արդյունքը՝ {score} կետ:</p>
              <button onClick={() => { setScore(0); setLevel(1); generateLevel(1); setGameOver(false); }} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:opacity-90 transition-all">Կրկնել</button>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

const MathGame = ({ onExit, updateScore, highScore }: { onExit: () => void, updateScore: (s: number, xp: number) => void, highScore: number }) => {
  const [problem, setProblem] = useState({ q: '', a: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  const generateProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let ans = 0;
    if (op === '+') ans = a + b;
    else if (op === '-') ans = a - b;
    else if (op === '*') ans = a * b;

    setProblem({ q: `${a} ${op} ${b} = ?`, a: ans });
    const opts = [ans, ans + 2, ans - 2, ans + Math.floor(Math.random() * 5) + 1].sort(() => Math.random() - 0.5);
    setOptions(opts);
  }, []);

  useEffect(() => {
    generateProblem();
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [generateProblem]);

  useEffect(() => {
    if (gameOver) updateScore(score, score * 5);
  }, [gameOver, score, updateScore]);

  const handleAnswer = (val: number) => {
    if (val === problem.a) {
      setScore(s => s + 1);
      generateProblem();
    } else {
      setTimeLeft(t => Math.max(0, t - 5));
      toast.error('-5 վայրկյան!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 text-center">
       <div className="flex justify-between items-center mb-12">
          <button onClick={onExit} className="text-slate-400 font-bold hover:text-slate-900 transition-colors">← Հետ</button>
          <div className="flex gap-4">
            <div className={cn("px-4 py-2 rounded-xl border font-black transition-colors", timeLeft < 10 ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100")}>Ժամանակ: {timeLeft}ս</div>
            <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 font-black text-amber-600">Միավոր: {score}</div>
          </div>
       </div>

       <AnimatePresence mode="wait">
         {!gameOver ? (
           <motion.div key={problem.q} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-12">
             <div className="text-7xl font-black text-slate-900 tracking-tighter">{problem.q}</div>
             <div className="grid grid-cols-2 gap-4">
               {options.map((opt, i) => (
                 <button key={i} onClick={() => handleAnswer(opt)} className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 text-3xl font-black hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-700">
                   {opt}
                 </button>
               ))}
             </div>
           </motion.div>
         ) : (
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 space-y-8">
              <Calculator size={80} className="text-blue-500 mx-auto" />
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ժամանակը սպառվեց:</h2>
              <p className="text-slate-500 font-medium">Քո արդյունքը՝ {score} ճիշտ պատասխան:</p>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm font-bold text-slate-400 uppercase tracking-widest">
                Ռեկորդ: {highScore}
              </div>
              <button onClick={() => { setScore(0); setTimeLeft(30); setGameOver(false); generateProblem(); }} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:opacity-90 transition-all">Նորից սկսել</button>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};
