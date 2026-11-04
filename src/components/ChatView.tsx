import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  Calendar,
  Search,
  FileText,
  MapPin,
  Volume2,
  Trash2,
} from 'lucide-react';
import { CubyAvatar, CubyMood } from './CubyAvatar';
import { sound } from '../lib/sound';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatViewProps {
  onNavigateTab: (tab: string, extraData?: any) => void;
  cubyMood: CubyMood;
  setCubyMood: (mood: CubyMood) => void;
  userContext?: any;
}

export const ChatView: React.FC<ChatViewProps> = ({
  onNavigateTab,
  cubyMood,
  setCubyMood,
  userContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hai! Aku **Aura**, boneka Cuby analis dan asisten pribadi produktivitas kamu! 🌸✨

Aku siap membantu kamu setiap saat dengan presisi analitis tinggi:
* 📅 **Jadwal Harian & Google Calendar**: Atur time blocking, mitigasi bentrok jadwal, dan sinkronisasi real-time.
* 📑 **Ringkasan Artikel Cerdas**: Ekstrak inti sari, poin tindakan, dan analisis kritis dalam hitungan detik.
* 🔍 **Riset Proyek Mendalam**: Susun roadmap, analisis pasar & teknologi, hingga evaluasi risiko proyek.
* 📍 **Google Maps & Komut**: Rekomendasi tempat kerja kondusif dan estimasi waktu perjalanan.

Ada yang bisa Aura bantu analisiskan sekarang?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    sound.playPop();
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCubyMood('thinking');
    sound.playThinking();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: userContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi Aura Server');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Maaf, Aura tidak mendapatkan respon dari sistem.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setCubyMood('happy');
      sound.playSuccess();
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `⚠️ Maaf, ada kendala saat menghubungi kecerdasan Aura: ${err.message}. Pastikan koneksi server aktif ya!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setCubyMood('idle');
    } finally {
      setIsLoading(false);
      setTimeout(() => setCubyMood('idle'), 3000);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sound.playPop();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleaned = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05;
      utterance.pitch = 1.15; // slightly higher friendly Cuby pitch
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearChat = () => {
    if (window.confirm('Bersihkan percakapan chat dengan Aura?')) {
      setMessages([messages[0]]);
      sound.playPop();
    }
  };

  const quickPrompts = [
    {
      label: '📅 Optimasi Jadwal Hari Ini',
      prompt: 'Tolong bantu optimasikan jadwal harianku. Aku butuh time blocking untuk deep work, meeting evaluasi, dan waktu istirahat yang seimbang.',
    },
    {
      label: '📑 Rangkum Artikel Baru',
      prompt: 'Aura, bagaimana format terbaik untuk menganalisis artikel riset secara kritis dan mengekstrak action items?',
    },
    {
      label: '🔍 Riset Arsitektur Proyek',
      prompt: 'Tolong buatkan framework riset proyek komprehensif untuk meluncurkan produk digital berbasis AI dalam 4 minggu.',
    },
    {
      label: '📍 Cari Cafe Co-working',
      prompt: 'Rekomendasikan kriteria tempat kerja atau cafe co-working ideal untuk meeting klien dengan koneksi internet stabil.',
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Top Banner / Cuby Status */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-indigo-950/40 rounded-3xl border border-purple-200/60 dark:border-purple-800/60 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CubyAvatar mood={cubyMood} size="sm" interactive showSpeechBubble={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Aura Analytical Companion
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Brain
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Boneka Cuby Analitis • Multi-Task Productivity • Real-time Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Bersihkan chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            {msg.role === 'user' ? (
              <div className="w-9 h-9 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                <UserIcon className="w-4 h-4" />
              </div>
            ) : (
              <div className="shrink-0 pt-1">
                <CubyAvatar size="sm" mood={cubyMood} interactive={false} />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 shadow-sm text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-xs'
                  : 'bg-white dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 rounded-tl-xs'
              }`}
            >
              {/* Content rendering */}
              <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                {msg.content}
              </div>

              {/* Footer */}
              <div
                className={`mt-2 flex items-center justify-between text-[10px] ${
                  msg.role === 'user' ? 'text-purple-200' : 'text-zinc-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(msg.content)}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title="Dengarkan Aura bicara"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <CubyAvatar size="sm" mood="thinking" interactive={false} />
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>Aura Cuby sedang menganalisis data & memformulasikan jawaban...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800/60 transition-all active:scale-95 shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative mt-1">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ketik pertanyaan, instruksi riset, atau rencana jadwal ke Aura... (Tekan Enter untuk kirim)"
          className="w-full p-3.5 pr-14 rounded-3xl bg-white dark:bg-zinc-800/90 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shadow-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-3 bottom-3.5 p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
