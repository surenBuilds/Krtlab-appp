import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
    xl: { icon: 64, text: 'text-6xl' },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <svg
          width={sizes[size].icon}
          height={sizes[size].icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Abstract Brain + Flask Fusion */}
          <motion.path
            d="M50 10C30 10 15 25 15 45C15 60 25 75 40 80V90H60V80C75 75 85 60 85 45C85 25 70 10 50 10Z"
            stroke="url(#brand-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Neural Network Lines */}
          <motion.circle cx="35" cy="35" r="3" fill="#06B6D4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.circle cx="65" cy="35" r="3" fill="#06B6D4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
          <motion.circle cx="50" cy="55" r="3" fill="#06B6D4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
          
          <motion.path
            d="M35 35L50 55L65 35"
            stroke="#06B6D4"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          <defs>
            <linearGradient id="brand-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E3A8A" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full -z-10" />
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <motion.span
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`${sizes[size].text} font-black tracking-tighter text-primary flex items-center`}
          >
            Krt<span className="text-secondary">Lab</span>
          </motion.span>
          {size === 'lg' || size === 'xl' ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-slate-500 font-medium tracking-wide uppercase"
            >
              Build Your Mind. Upgrade Your Future.
            </motion.p>
          ) : null}
        </div>
      )}
    </div>
  );
};
