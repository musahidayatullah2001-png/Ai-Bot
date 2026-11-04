import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { sound } from '../lib/sound';

export type CubyMood = 'idle' | 'happy' | 'thinking' | 'analytical' | 'celebrate' | 'sleeping';

interface CubyAvatarProps {
  mood?: CubyMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onTap?: () => void;
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
}

export const CubyAvatar: React.FC<CubyAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  interactive = true,
  onTap,
  showSpeechBubble = false,
  speechText,
  className = '',
}) => {
  const [internalMood, setInternalMood] = useState<CubyMood>(mood);
  const [isBlinking, setIsBlinking] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    setInternalMood(mood);
  }, [mood]);

  // Periodic blinking effect for realistic doll animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClick = () => {
    if (!interactive) return;
    sound.playChirp();
    setClickCount((c) => c + 1);
    setInternalMood('celebrate');
    setTimeout(() => {
      setInternalMood(mood);
    }, 1200);

    if (onTap) onTap();
  };

  const sizePixels = {
    sm: 52,
    md: 84,
    lg: 130,
    xl: 180,
  }[size];

  const speechQuotes = [
    'Aura siap bantu kamu produktif hari ini! ✨',
    'Semua jadwal terstruktur rapi, semangat ya! 🌸',
    'Analisis data selesai dengan presisi tinggi! 🔍',
    'Jangan lupa minum air & istirahat 5 menit ya! ☕',
  ];

  const currentSpeech = speechText || speechQuotes[clickCount % speechQuotes.length];

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute -top-14 z-30 px-3 py-1.5 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800 text-xs text-zinc-700 dark:text-zinc-200 font-medium whitespace-nowrap pointer-events-none flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {currentSpeech}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-800 rotate-45 border-r border-b border-purple-200 dark:border-purple-800" />
        </motion.div>
      )}

      {/* Cuby Body Container */}
      <motion.div
        whileHover={interactive ? { scale: 1.08, rotate: [0, -3, 3, 0] } : undefined}
        whileTap={interactive ? { scale: 0.92, y: 4 } : undefined}
        animate={
          internalMood === 'thinking'
            ? { y: [0, -4, 0], rotate: [0, 2, -2, 0] }
            : internalMood === 'celebrate'
            ? { y: [0, -12, 0, -6, 0], rotate: [0, -5, 5, -2, 0] }
            : { y: [0, -3, 0] }
        }
        transition={{
          repeat: internalMood === 'celebrate' ? 0 : Infinity,
          duration: internalMood === 'thinking' ? 1.5 : 2.6,
          ease: 'easeInOut',
        }}
        onClick={handleClick}
        className={`cursor-${interactive ? 'pointer' : 'default'} relative`}
        style={{ width: sizePixels, height: sizePixels }}
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(147,51,234,0.22)]"
        >
          <defs>
            {/* Body Gradient: Cute Pastel Lavender & Rose Peach */}
            <linearGradient id="cubyBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="45%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>

            {/* Front Face Gradient */}
            <linearGradient id="cubyFace" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FAF5FF" />
              <stop offset="100%" stopColor="#F3E8FF" />
            </linearGradient>

            {/* Top Cube Face (Isometric Depth) */}
            <linearGradient id="cubyTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="100%" stopColor="#D8B4FE" />
            </linearGradient>

            {/* Ear / Antennas */}
            <linearGradient id="antennaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shadow underneath */}
          <ellipse
            cx="80"
            cy="150"
            rx="52"
            ry="9"
            fill="#000000"
            opacity="0.18"
            className="transition-all"
          />

          {/* Cute Plush Bear/Cat Ears or Antenna */}
          <g>
            {/* Left Ear */}
            <rect
              x="36"
              y="22"
              width="24"
              height="24"
              rx="8"
              fill="url(#antennaGrad)"
              transform="rotate(-15 48 34)"
            />
            <rect
              x="41"
              y="26"
              width="14"
              height="14"
              rx="5"
              fill="#FDF2F8"
              transform="rotate(-15 48 34)"
            />

            {/* Right Ear */}
            <rect
              x="100"
              y="22"
              width="24"
              height="24"
              rx="8"
              fill="url(#antennaGrad)"
              transform="rotate(15 112 34)"
            />
            <rect
              x="105"
              y="26"
              width="14"
              height="14"
              rx="5"
              fill="#FDF2F8"
              transform="rotate(15 112 34)"
            />

            {/* Center Smart Hologram Antenna */}
            <line
              x1="80"
              y1="34"
              x2="80"
              y2="14"
              stroke="#A855F7"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle
              cx="80"
              cy="12"
              r="7"
              fill="#38BDF8"
              filter="url(#softGlow)"
              className={internalMood === 'thinking' ? 'animate-pulse' : ''}
            />
            <circle cx="80" cy="12" r="3" fill="#FFFFFF" />
          </g>

          {/* Main Cuby Outer Body (Rounded Box Shape) */}
          <rect
            x="24"
            y="32"
            width="112"
            height="110"
            rx="32"
            fill="url(#cubyBody)"
            stroke="#9333EA"
            strokeWidth="3"
          />

          {/* Inner Cute Face Screen / Plush Belly */}
          <rect
            x="32"
            y="42"
            width="96"
            height="90"
            rx="24"
            fill="url(#cubyFace)"
            stroke="#E9D5FF"
            strokeWidth="2"
          />

          {/* Plush Stitching Details (Top and sides) */}
          <path
            d="M 52 46 L 56 46 M 70 46 L 74 46 M 86 46 L 90 46 M 104 46 L 108 46"
            stroke="#D8B4FE"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Analytical Glasses / Smart HUD if in analytical mood */}
          {internalMood === 'analytical' && (
            <g stroke="#8B5CF6" strokeWidth="2.5" fill="none" opacity="0.85">
              <rect x="42" y="65" width="30" height="26" rx="7" />
              <rect x="88" y="65" width="30" height="26" rx="7" />
              <line x1="72" y1="78" x2="88" y2="78" />
              <line x1="32" y1="78" x2="42" y2="78" />
              <line x1="118" y1="78" x2="128" y2="78" />
            </g>
          )}

          {/* EYES */}
          {internalMood === 'happy' || internalMood === 'celebrate' ? (
            // Joyful Happy Crescent Eyes (^_^)
            <g stroke="#581C87" strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M 46 78 Q 57 66 68 78" />
              <path d="M 92 78 Q 103 66 114 78" />
            </g>
          ) : internalMood === 'sleeping' ? (
            // Sleeping closed lines (-_-)
            <g stroke="#6B21A8" strokeWidth="4" strokeLinecap="round" fill="none">
              <path d="M 48 80 Q 58 84 68 80" />
              <path d="M 92 80 Q 102 84 112 80" />
            </g>
          ) : isBlinking ? (
            // Blinking Slit
            <g stroke="#4C1D95" strokeWidth="4" strokeLinecap="round" fill="none">
              <line x1="48" y1="78" x2="68" y2="78" />
              <line x1="92" y1="78" x2="112" y2="78" />
            </g>
          ) : (
            // Sparkling Big Anime/Chibi Eyes
            <g>
              {/* Left Eye */}
              <ellipse cx="58" cy="77" rx="9" ry="12" fill="#3B0764" />
              <circle cx="55" cy="73" r="4.2" fill="#FFFFFF" />
              <circle cx="61" cy="82" r="2.2" fill="#C084FC" />
              {internalMood === 'thinking' && (
                <path d="M 48 64 Q 58 60 68 64" stroke="#7E22CE" strokeWidth="2.5" fill="none" />
              )}

              {/* Right Eye */}
              <ellipse cx="102" cy="77" rx="9" ry="12" fill="#3B0764" />
              <circle cx="99" cy="73" r="4.2" fill="#FFFFFF" />
              <circle cx="105" cy="82" r="2.2" fill="#C084FC" />
              {internalMood === 'thinking' && (
                <path d="M 92 61 Q 102 57 112 62" stroke="#7E22CE" strokeWidth="2.5" fill="none" />
              )}
            </g>
          )}

          {/* Rosy Pink Blush Cheeks */}
          <ellipse
            cx="44"
            cy="90"
            rx="8"
            ry="4.5"
            fill="#FB7185"
            opacity="0.65"
            className="animate-pulse"
          />
          <ellipse
            cx="116"
            cy="90"
            rx="8"
            ry="4.5"
            fill="#FB7185"
            opacity="0.65"
            className="animate-pulse"
          />

          {/* Small Cute Mouth */}
          {internalMood === 'celebrate' || internalMood === 'happy' ? (
            // Open laughing mouth
            <path
              d="M 72 90 Q 80 102 88 90 Z"
              fill="#F43F5E"
              stroke="#881337"
              strokeWidth="1.5"
            />
          ) : internalMood === 'thinking' ? (
            // Curious cute 'o' mouth
            <circle cx="80" cy="91" r="3.5" fill="#581C87" />
          ) : (
            // Cute tiny cat smile mouth (:3)
            <path
              d="M 74 88 Q 77 92 80 88 Q 83 92 86 88"
              stroke="#581C87"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Cute Little Paws at bottom */}
          <circle cx="54" cy="138" r="10" fill="#A855F7" stroke="#7E22CE" strokeWidth="2" />
          <circle cx="106" cy="138" r="10" fill="#A855F7" stroke="#7E22CE" strokeWidth="2" />
          <circle cx="54" cy="138" r="4" fill="#F472B6" />
          <circle cx="106" cy="138" r="4" fill="#F472B6" />
        </svg>

        {/* Small floating sparkles / sleep bubbles */}
        {internalMood === 'celebrate' && (
          <div className="absolute -top-3 -right-3 text-lg animate-bounce">✨</div>
        )}
        {internalMood === 'thinking' && (
          <div className="absolute -top-2 -right-1 text-sm animate-spin">⚙️</div>
        )}
        {internalMood === 'sleeping' && (
          <div className="absolute -top-4 -right-1 text-sm text-purple-400 font-bold animate-pulse">
            zZz
          </div>
        )}
      </motion.div>
    </div>
  );
};
