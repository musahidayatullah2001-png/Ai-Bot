import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  MessageSquare,
  Calendar,
  FileText,
  Search,
  MapPin,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle,
  Sun,
  Moon,
  Minimize2,
} from 'lucide-react';
import { CubyAvatar, CubyMood } from './components/CubyAvatar';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { FloatingCompanion } from './components/FloatingCompanion';
import { ChatView } from './components/ChatView';
import { ScheduleView } from './components/ScheduleView';
import { SummarizerView } from './components/SummarizerView';
import { ResearchView } from './components/ResearchView';
import { MapsView } from './components/MapsView';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { sound } from './lib/sound';
import { CalendarEvent, fetchGoogleCalendarEvents } from './lib/calendarApi';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'schedule' | 'summarize' | 'research' | 'maps'>('chat');
  const [cubyMood, setCubyMood] = useState<CubyMood>('idle');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCompanionMode, setIsCompanionMode] = useState(false);

  // Initialize Firebase Auth on app mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        // Not authenticated
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch upcoming agenda for companion preview
  useEffect(() => {
    async function loadNext() {
      try {
        const events = await fetchGoogleCalendarEvents(accessToken);
        if (events && events.length > 0) {
          setNextEvent(events[0]);
        }
      } catch (e) {
        console.warn('Next event fetch err:', e);
      }
    }
    loadNext();
  }, [accessToken]);

  // Google Login flow
  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    sound.playThinking();
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setCubyMood('celebrate');
        sound.playSuccess();
        setTimeout(() => setCubyMood('idle'), 2500);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      alert('Gagal menghubungkan Google Calendar & Workspace: ' + (err.message || 'Unknown error'));
      setCubyMood('idle');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Google Logout flow
  const handleGoogleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    sound.playPop();
  };

  const toggleSound = () => {
    const nextVal = !isSoundEnabled;
    setIsSoundEnabled(nextVal);
    sound.setEnabled(nextVal);
    if (nextVal) sound.playChirp();
  };

  const navItems = [
    { id: 'chat', label: 'Chat Aura', icon: MessageSquare },
    { id: 'schedule', label: 'Jadwal & Kalender', icon: Calendar },
    { id: 'summarize', label: 'Ringkas Artikel', icon: FileText },
    { id: 'research', label: 'Riset Proyek', icon: Search },
    { id: 'maps', label: 'Google Maps', icon: MapPin },
  ];

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-200`}>
      {/* Compact Mini Companion Mode ("Nongkrong di Layar") view banner if enabled */}
      {isCompanionMode ? (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-900/40 via-zinc-950/90 to-black/90 backdrop-blur-md">
          <div className="p-8 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-purple-200 dark:border-purple-800 shadow-2xl text-center max-w-sm space-y-4">
            <CubyAvatar mood="happy" size="lg" interactive showSpeechBubble speechText="Aura lagi nongkrong di pojok layar kamu! ✨" />
            <h3 className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Mode Nongkrong di Layar Aktif
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Kamu bisa terus bekerja atau browsing, widget boneka Cuby tetap siap di sudut layar laptop atau ponselmu!
            </p>
            <button
              onClick={() => {
                sound.playPop();
                setIsCompanionMode(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Kembali ke Layar Penuh Studio
            </button>
          </div>
        </div>
      ) : null}

      {/* Main App Layout */}
      <div className="flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            {/* Logo & Brand */}
            <div
              onClick={() => {
                sound.playChirp();
                setActiveTab('chat');
              }}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div className="relative">
                <CubyAvatar mood={cubyMood} size="sm" interactive={false} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                    Aura
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Cuby AI
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 hidden sm:block">
                  Analytical & Productivity Assistant
                </span>
              </div>
            </div>

            {/* Desktop Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.playPop();
                      setActiveTab(item.id as any);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Tools & Google Sign-In */}
            <div className="flex items-center gap-2">
              {/* PWA Install Button (shows when installable) */}
              <PWAInstallBanner variant="button" />

              {/* Nongkrong Mode button */}
              <button
                onClick={() => {
                  sound.playPop();
                  setIsCompanionMode(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold border border-purple-200 dark:border-purple-800/60 transition-colors"
                title="Sembunyikan ke widget nongkrong di layar"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Nongkrong</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title={isSoundEnabled ? 'Suara Aktif' : 'Mute'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => {
                  sound.playPop();
                  setIsDarkMode(!isDarkMode);
                }}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Google Workspace Sign In Button */}
              <GoogleSignInButton
                user={user}
                isLoading={isAuthLoading}
                onSignIn={handleGoogleSignIn}
                onSignOut={handleGoogleSignOut}
              />
            </div>
          </div>

          {/* Mobile Tab Scroller */}
          <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-zinc-100 dark:border-zinc-800 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playPop();
                    setActiveTab(item.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 overflow-x-hidden">
          {/* PWA Install Banner on mobile/top */}
          <PWAInstallBanner variant="banner" className="mb-4" />

          {activeTab === 'chat' && (
            <ChatView
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              cubyMood={cubyMood}
              setCubyMood={setCubyMood}
              userContext={{
                hasGoogleToken: !!accessToken,
                userEmail: user?.email,
                currentDateTime: new Date().toISOString(),
                nextEvent: nextEvent?.summary,
              }}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              accessToken={accessToken}
              onRequireAuth={handleGoogleSignIn}
              cubyMood={cubyMood}
              setCubyMood={setCubyMood}
            />
          )}

          {activeTab === 'summarize' && (
            <SummarizerView
              cubyMood={cubyMood}
              setCubyMood={setCubyMood}
            />
          )}

          {activeTab === 'research' && (
            <ResearchView
              accessToken={accessToken}
              cubyMood={cubyMood}
              setCubyMood={setCubyMood}
            />
          )}

          {activeTab === 'maps' && (
            <MapsView
              accessToken={accessToken}
              cubyMood={cubyMood}
              setCubyMood={setCubyMood}
            />
          )}
        </main>
      </div>

      {/* Floating Companion ("Nongkrong di Layar") Widget */}
      <FloatingCompanion
        mood={cubyMood}
        nextEvent={nextEvent}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={toggleSound}
        onExpandToFull={(tab) => {
          setIsCompanionMode(false);
          if (tab) setActiveTab(tab as any);
        }}
        onQuickAsk={(prompt) => {
          setActiveTab('chat');
          setIsCompanionMode(false);
          // Pass prompt to chat by triggering a search or event
        }}
      />
    </div>
  );
}
