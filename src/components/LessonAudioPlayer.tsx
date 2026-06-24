import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface LessonAudioPlayerProps {
  lessonId: string;
  lessonText: string;
}

export const LessonAudioPlayer: React.FC<LessonAudioPlayerProps> = ({ lessonId, lessonText }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Preload speech on mount or text change
  useEffect(() => {
    if (!lessonText) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(lessonText);
    utterance.lang = 'hy-AM'; // Armenian
    utterance.rate = 0.9; // Steady pace
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      setError("Ձայնային նվագարկումը չհաջողվեց:");
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [lessonText]);

  const togglePlay = () => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      if (utteranceRef.current) {
        window.speechSynthesis.speak(utteranceRef.current);
      }
    }
  };

  const restart = () => {
    window.speechSynthesis.cancel();
    if (utteranceRef.current) {
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              {isPlaying && !isPaused ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            <button
              onClick={restart}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
              title="Կրկնել"
            >
              <RotateCcw size={20} />
            </button>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">ԱԲ Ուսուցիչ</span>
              <span className="text-xs text-blue-400">{isPlaying ? (isPaused ? "Դադարեցված է" : "Նվագարկվում է...") : "Պատրաստ է"}</span>
            </div>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-blue-600 transition-all duration-300",
                  isPlaying && !isPaused ? "w-full" : "w-0"
                )}
                style={{ transitionDuration: isPlaying && !isPaused ? '120s' : '0s' }}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm font-medium">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
