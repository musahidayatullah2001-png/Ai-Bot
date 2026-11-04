import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Clock,
  Tag,
  CheckSquare,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { CubyAvatar, CubyMood } from './CubyAvatar';
import { sound } from '../lib/sound';

interface SummarizerViewProps {
  cubyMood: CubyMood;
  setCubyMood: (mood: CubyMood) => void;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  cubyMood,
  setCubyMood,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'detailed' | 'tldr' | 'actionable'>('detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const sampleArticles = [
    {
      label: '🤖 Paradigma AI Agents 2026',
      title: 'Evolusi Autonomous AI Agents dalam Produktivitas Modern',
      text: `Perkembangan sistem Artificial Intelligence pada tahun 2026 telah bergeser dari model tanya-jawab reaktif (reactive chat) menuju Autonomous AI Agents yang proaktif. Agen otonom memiliki kemampuan untuk memecah tujuan tingkat tinggi (high-level goals) menjadi sub-tugas yang terkoordinasi secara mandiri.

Pilar utama dari revolusi ini adalah integrasi ekosistem API real-time, seperti Google Workspace, kalender dinamis, dan sistem navigasi kontekstual. Agen AI tidak lagi hanya menghasilkan teks pasif, melainkan mampu membaca kalender pengguna, mendeteksi bentrok jadwal, mengoptimalkan jeda istirahat untuk memulihkan kapasitas kognitif, dan merangkum literatur proyek secara kritis.

Namun, tantangan terbesar tetap terletak pada akurasi eksekusi dan keamanan data. Implementasi 'Human-in-the-Loop' tetap esensial untuk operasi mutasi data, memastikan pengguna selalu memiliki kendali penuh atas setiap aksi sistem.`,
    },
    {
      label: '⚡ Sains Deep Work & Focus Block',
      title: 'Optimalisasi Waktu Kerja dengan Teknik Time-Blocking Modern',
      text: `Riset neurosains menunjukkan bahwa peralihan konteks (context switching) dapat menghabiskan hingga 40% energi produktif seseorang dalam satu hari kerja. Ketika seorang profesional beralih antar aplikasi atau tugas tanpa jeda yang terstruktur, otak mengalami fenomena 'attention residue'.

Untuk mengatasi hal ini, metodologi Time-Blocking menyarankan pembagian hari menjadi blok-blok waktu diskret dengan durasi 60 hingga 90 menit untuk deep work, diikuti oleh buffer transisi minimal 15 menit. Penjadwalan cerdas yang menyelaraskan ritme sirkadian dengan tingkat kompleksitas tugas terbukti melipatgandakan output kualitatif tanpa memicu kelelahan mental (burnout).`,
    },
  ];

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setCubyMood('thinking');
    sound.playThinking();

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          mode,
        }),
      });

      if (!res.ok) throw new Error('Gagal merangkum artikel');
      const data = await res.json();
      setResult(data);
      setCubyMood('happy');
      sound.playSuccess();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setCubyMood('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const text = `## Ringkasan: ${title || 'Artikel'}\n\n**TL;DR:** ${result.tldr}\n\n### Poin Utama:\n${result.keyTakeaways?.map((p: string) => `- ${p}`).join('\n')}\n\n### Analisis Kritis:\n${result.criticalAnalysis}\n\n### Tindakan Lanjutan:\n${result.actionItems?.map((a: string) => `- [ ] ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    sound.playPop();
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CubyAvatar mood={cubyMood} size="md" interactive showSpeechBubble={false} />
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Aura Article Summarizer
            </h2>
            <p className="text-xs text-pink-100 mt-1 max-w-md">
              Ekstraksi esensi, poin analitis, dan action items dari artikel atau dokumen panjang secara cepat dan terstruktur.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Input Artikel / Teks
              </span>
              <span className="text-[10px] text-zinc-400">
                {content.length} karakter
              </span>
            </div>

            {/* Sample Chips */}
            <div>
              <span className="text-[11px] text-zinc-400 block mb-1.5">
                Coba contoh artikel:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleArticles.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(sample.title);
                      setContent(sample.text);
                      sound.playPop();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs font-medium hover:bg-pink-100 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Judul / Topik (Opsional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Riset Model Fondasi AI Terkini"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Mode selection */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Fokus Ringkasan
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'detailed', label: 'Komprehensif' },
                  { id: 'tldr', label: 'TL;DR Cepat' },
                  { id: 'actionable', label: 'Action Items' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      mode === m.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Teks Artikel / Catatan
              </label>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tempelkan isi artikel, paper, rangkuman web, atau catatan meeting di sini..."
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <button
              onClick={handleSummarize}
              disabled={!content.trim() || isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Aura Menganalisis Artikel...' : 'Mulai Analisis & Ringkas'}
            </button>
          </div>
        </div>

        {/* Output Panel (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[460px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <CubyAvatar mood="thinking" size="lg" interactive={false} />
                <div className="text-center">
                  <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    Aura Cuby Sedang Membedah Dokumen
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Mengekstrak inti poin, menganalisis implikasi, dan menyusun langkah aksi...
                  </p>
                </div>
              </div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Result Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      Analisis Selesai
                    </span>
                    {result.estimatedReadTimeMinutes && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Hemat baca ~{result.estimatedReadTimeMinutes} menit
                      </span>
                    )}
                  </div>
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin!' : 'Salin Ringkasan'}</span>
                  </button>
                </div>

                {/* TL;DR Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/70 dark:border-purple-800/60">
                  <span className="text-[10px] font-black tracking-wider uppercase text-purple-600 dark:text-purple-400 block mb-1">
                    ⚡ TL;DR Executive Summary
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-relaxed">
                    {result.tldr}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Poin Kunci & Wawasan Utama
                  </h4>
                  <ul className="space-y-2">
                    {result.keyTakeaways?.map((point: string, idx: number) => (
                      <li
                        key={idx}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Critical Analysis */}
                {result.criticalAnalysis && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                    <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Analisis Kritis & Implikasi Strategis
                    </h4>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {result.criticalAnalysis}
                    </p>
                  </div>
                )}

                {/* Action Items */}
                {result.actionItems?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Langkah Aksi yang Direkomendasikan
                    </h4>
                    <div className="space-y-1.5">
                      {result.actionItems.map((act: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-xs flex items-center gap-2"
                        >
                          <div className="w-4 h-4 rounded-md border border-emerald-500 flex items-center justify-center text-emerald-600">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-zinc-800 dark:text-zinc-200">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cuby Analytical Note */}
                {result.cubyNote && (
                  <div className="p-3 rounded-2xl bg-purple-100/50 dark:bg-purple-950/40 border border-purple-200 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-3">
                    <CubyAvatar mood="happy" size="sm" interactive={false} />
                    <div>
                      <span className="font-bold block">Pesan Aura Cuby:</span>
                      <span>{result.cubyNote}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center text-zinc-400 space-y-3">
                <FileText className="w-12 h-12 stroke-[1.2] opacity-40" />
                <p className="text-xs max-w-sm">
                  Masukkan teks artikel di sebelah kiri atau pilih salah satu contoh untuk melihat ringkasan analitis Aura.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
