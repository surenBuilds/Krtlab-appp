import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade-out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-gradient-brand overflow-hidden"
        >
          {/* Animated Background Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 180],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-[800px] h-[800px] bg-accent/20 blur-[120px] rounded-full -top-1/4 -left-1/4"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1],
              rotate: [180, 90, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute w-[600px] h-[600px] bg-secondary/20 blur-[100px] rounded-full -bottom-1/4 -right-1/4"
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="p-8 rounded-[3rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative group"
            >
              <Logo size="xl" showText={false} />
              
              {/* Pulse Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-accent/30 blur-2xl rounded-full -z-10"
              />
            </motion.div>

            <div className="flex flex-col items-center gap-2">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl font-black tracking-tighter text-white"
              >
                Krt<span className="text-accent">Lab</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-sm font-medium tracking-widest text-white/60 uppercase"
              >
                Build Your Mind. Upgrade Your Future.
              </motion.p>
            </div>
          </div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute bottom-20 h-1 bg-accent/50 rounded-full overflow-hidden"
          >
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-accent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
