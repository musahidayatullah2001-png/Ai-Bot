import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CubyAvatar, CubyMood } from './CubyAvatar';
import {
  Maximize2,
  Calendar,
  Sparkles,
  Search,
  FileText,
  Volume2,
  VolumeX,
  X,
  ChevronUp,
  MapPin,
  Clock,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../lib/sound';
import { CalendarEvent } from '../lib/calendarApi';

interface FloatingCompanionProps {
  onExpandToFull: (tab?: string) => void;
  nextEvent?: CalendarEvent | null;
  onQuickAsk: (prompt: string) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  mood?: CubyMood;
}

export const FloatingCompanion: React.FC<FloatingCompanionProps> = ({
  onExpandToFull,
  nextEvent,
  onQuickAsk,
  isSoundEnabled,
  onToggleSound,
  mood = 'idle',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  // Timer loop
  React.useEffect(() => {
    let interval: any;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isPomodoroRunning) {
      sound.playSuccess();
      setIsPomodoroRunning(false);
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroSeconds]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    sound.playChirp();
    onQuickAsk(quickInput.trim());
    setQuickInput('');
    setIsMenuOpen(false);
  };

  return (
    <div
      className="fixed z-40 select-none"
      style={{
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        right: 'calc(1.25rem + env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Quick Menu Overlay Popover */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm sm:w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-purple-200/80 dark:border-purple-800/80 text-zinc-800 dark:text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Aura Companion Mini
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                  Online
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleSound}
                  className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                  title={isSoundEnabled ? 'Suara Aktif' : 'Mute'}
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
                </button>
                <button
                  onClick={() => onExpandToFull()}
                  className="p-1.5 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  title="Perbesar ke Layar Penuh"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Next Agenda Banner */}
            {nextEvent ? (
              <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-800/40 text-xs">
                <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Agenda Terdekat
                  </span>
                  <span>
                    {nextEvent.start.dateTime
                      ? new Date(nextEvent.start.dateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Hari Ini'}
                  </span>
                </div>
                <div className="font-bold text-zinc-900 dark:text-white truncate">
                  {nextEvent.summary}
                </div>
                {nextEvent.location && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span className="truncate">{nextEvent.location}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500 text-center">
                Belum ada agenda Google Calendar mendesak ✨
              </div>
            )}

            {/* Quick Focus Pomodoro Widget Toggle */}
            <div className="mt-3 p-2.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold">Deep Focus Companion:</span>
                <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                  {formatTime(pomodoroSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                  className="p-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  {isPomodoroRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsPomodoroRunning(false);
                    setPomodoroSeconds(25 * 60);
                  }}
                  className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button
                onClick={() => onExpandToFull('schedule')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Jadwal</span>
              </button>

              <button
                onClick={() => onExpandToFull('summarize')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-950/40 text-xs transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Ringkasan</span>
              </button>

              <button
                onClick={() => onExpandToFull('research')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Riset</span>
              </button>

              <button
                onClick={() => onExpandToFull('maps')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Maps</span>
              </button>
            </div>

            {/* Quick Ask Form */}
            <form onSubmit={handleQuickSubmit} className="mt-3 relative">
              <input
                type="text"
                placeholder="Tanya Aura atau input jadwal cepat..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 border border-transparent focus:border-purple-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xs hover:shadow-md hover:scale-105 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cuby Trigger Button ("Nongkrong di Layar") */}
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sound.playPop();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="relative group cursor-pointer flex items-center gap-2 p-2 pr-3.5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl border-2 border-purple-300 dark:border-purple-700 transition-all"
        >
          {/* Adorable Cuby Avatar */}
          <CubyAvatar
            size="sm"
            mood={mood}
            interactive={false}
            className="drop-shadow-md"
          />

          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Aura Cuby
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Nongkrong Aktif
            </span>
          </div>

          <ChevronUp
            className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </motion.div>
      </div>
    </div>
  );
};
