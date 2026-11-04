import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Sparkles,
  Layers,
  Calendar,
  AlertTriangle,
  Wrench,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CubyAvatar, CubyMood } from './CubyAvatar';
import { ConfirmationModal } from './ConfirmationModal';
import { createGoogleCalendarEvent } from '../lib/calendarApi';
import { sound } from '../lib/sound';

interface ResearchViewProps {
  accessToken: string | null;
  cubyMood: CubyMood;
  setCubyMood: (mood: CubyMood) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  accessToken,
  cubyMood,
  setCubyMood,
}) => {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [scope, setScope] = useState('Full Roadmap & Tech Stack');
  const [isLoading, setIsLoading] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Confirmation modal state for adding roadmap to Google Calendar
  const [modalOpen, setModalOpen] = useState(false);

  const presets = [
    {
      label: '🚀 SaaS AI Companion Launch',
      topic: 'Peluncuran Aplikasi SaaS AI Companion dengan Google Workspace Sync',
      goal: 'Menghadirkan personal assistant multi-platform dalam 6 minggu',
    },
    {
      label: '⚡ Optimalisasi Produktivitas Tim',
      topic: 'Implementasi Framework Time-Blocking & Calendar Automation untuk Tim',
      goal: 'Mereduksi context switching dan meningkatkan deep work sebesar 35%',
    },
    {
      label: '🏢 Arsitektur Cloud & API 2026',
      topic: 'Evaluasi Microservices vs Monolith Modular untuk Aplikasi AI Real-time',
      goal: 'Memilih infrastruktur dengan latensi < 100ms dan skalabilitas tinggi',
    },
  ];

  const handleRunResearch = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setCubyMood('analytical');
    sound.playThinking();

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, goal, scope }),
      });

      if (!res.ok) throw new Error('Gagal melakukan riset proyek');
      const data = await res.json();
      setDossier(data);
      setCubyMood('happy');
      sound.playSuccess();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setCubyMood('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!dossier) return;
    const md = `# Riset Proyek: ${dossier.topic}
Disusun oleh Aura Cuby AI Assistant

## Ringkasan Eksekutif
${dossier.executiveSummary}

## Temuan Utama
${dossier.keyFindings?.map((f: any) => `### ${f.title}\n${f.description}`).join('\n\n')}

## Peta Jalan (Roadmap)
${dossier.phasedRoadmap?.map((p: any) => `### ${p.phase}\n${p.tasks?.map((t: string) => `- [ ] ${t}`).join('\n')}`).join('\n\n')}

## Matriks Risiko & Mitigasi
${dossier.risksAndMitigations?.map((r: any) => `- **Risiko:** ${r.risk}\n  **Mitigasi:** ${r.mitigation}`).join('\n')}

## Rekomendasi Aura
${dossier.auraRecommendation}
`;
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    sound.playPop();
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Schedule Roadmap phases into Google Calendar with Confirmation
  const handleConfirmScheduleRoadmap = async () => {
    setModalOpen(false);
    if (!dossier?.phasedRoadmap) return;

    sound.playThinking();
    try {
      const today = new Date();
      for (let i = 0; i < dossier.phasedRoadmap.length; i++) {
        const phase = dossier.phasedRoadmap[i];
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (i + 1) * 7); // 1 week interval per phase

        const startISO = new Date(targetDate.setHours(10, 0, 0, 0)).toISOString();
        const endISO = new Date(targetDate.setHours(11, 30, 0, 0)).toISOString();

        await createGoogleCalendarEvent(accessToken, {
          summary: `🚩 [Milestone] ${phase.phase}`,
          description: `Tugas Kunci:\n${phase.tasks?.join('\n')}\n\n[Direncanakan oleh Aura Research Lab]`,
          startTime: startISO,
          endTime: endISO,
          location: 'Aura Project HQ',
        });
      }

      confetti({ particleCount: 70, spread: 60 });
      sound.playSuccess();
      alert('Semua milestone fase roadmap telah berhasil dijadwalkan di Google Calendar!');
    } catch (err: any) {
      alert(`Gagal menjadwalkan ke Google: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        title="Jadwalkan Fase Roadmap ke Google Calendar?"
        description={`Aura akan membuat agenda penanda milestone untuk ${dossier?.phasedRoadmap?.length || 3} fase roadmap proyek pada Google Calendar kamu.`}
        confirmLabel="Ya, Jadwalkan Milestone"
        cancelLabel="Batal"
        type="primary"
        affectedItemName={`Roadmap Proyek: ${dossier?.topic || topic}`}
        affectedItemDetails={dossier?.phasedRoadmap?.map((p: any) => `• ${p.phase}`).join('\n')}
        onConfirm={handleConfirmScheduleRoadmap}
        onCancel={() => setModalOpen(false)}
      />

      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CubyAvatar mood={cubyMood} size="md" interactive showSpeechBubble={false} />
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Aura Deep Project Research Lab
            </h2>
            <p className="text-xs text-indigo-100 mt-1 max-w-md">
              Riset analitis komprehensif untuk proyekmu: tinjauan pasar, roadmap bertahap, matriks risiko, dan rekomendasi teknis.
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Parameter Riset
              </h3>
            </div>

            {/* Presets */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5">
                Template Cepat:
              </label>
              <div className="space-y-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(p.topic);
                      setGoal(p.goal);
                      sound.playPop();
                    }}
                    className="w-full text-left p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-200 text-xs font-semibold transition-colors truncate"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Topik / Judul Proyek
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Misal: Pengembangan Bot Asisten Pintar"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Tujuan Utama (Goal)
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Misal: Rilis versi 1.0 dalam 1 bulan"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Cakupan Riset (Scope)
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option>Full Roadmap & Tech Stack</option>
                <option>Market & Competitive Analysis</option>
                <option>Technical Architecture & Security</option>
                <option>Execution Sprint 30-Day</option>
              </select>
            </div>

            <button
              onClick={handleRunResearch}
              disabled={!topic.trim() || isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Aura Meneliti Secara Mendalam...' : 'Mulai Riset Analitis'}
            </button>
          </div>
        </div>

        {/* Dossier Output (8 cols) */}
        <div className="lg:col-span-8">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <CubyAvatar mood="analytical" size="lg" interactive={false} />
                <div className="text-center">
                  <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    Aura Sedang Mengompilasi Dokumen Riset
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Menganalisis dependensi arsitektur, menyusun roadmap bertahap, dan memetakan risiko...
                  </p>
                </div>
              </div>
            ) : dossier ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Dossier Top Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white">
                      {dossier.topic}
                    </h3>
                    <span className="text-[11px] text-zinc-500">
                      Riset Analitis Lengkap disusun oleh Aura
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyMarkdown}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Tersalin' : 'Export MD'}</span>
                    </button>

                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Jadwalkan Milestone
                    </button>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
                  <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                    🎯 Ringkasan Eksekutif
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {dossier.executiveSummary}
                  </p>
                </div>

                {/* Key Findings */}
                {dossier.keyFindings?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      Temuan & Pilar Kunci
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dossier.keyFindings.map((f: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs space-y-1"
                        >
                          <div className="font-bold text-zinc-900 dark:text-white">
                            {f.title}
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {f.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phased Roadmap */}
                {dossier.phasedRoadmap?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Peta Jalan Bertahap (Phased Roadmap)
                    </h4>
                    <div className="space-y-3">
                      {dossier.phasedRoadmap.map((p: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-xs shadow-xs"
                        >
                          <div className="font-bold text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            <span>{p.phase}</span>
                          </div>
                          <ul className="space-y-1.5 pl-8 list-disc text-zinc-600 dark:text-zinc-300">
                            {p.tasks?.map((t: string, tidx: number) => (
                              <li key={tidx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risks & Mitigation */}
                {dossier.risksAndMitigations?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                    <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Matriks Risiko & Strategi Mitigasi
                    </h4>
                    <div className="space-y-2">
                      {dossier.risksAndMitigations.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs space-y-0.5">
                          <span className="font-bold text-rose-900 dark:text-rose-200">
                            ⚠️ Risiko: {item.risk}
                          </span>
                          <p className="text-zinc-700 dark:text-zinc-300 pl-4">
                            ↳ <strong>Solusi:</strong> {item.mitigation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aura Recommendation */}
                {dossier.auraRecommendation && (
                  <div className="p-4 rounded-2xl bg-purple-100/50 dark:bg-purple-950/40 border border-purple-200 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-3">
                    <CubyAvatar mood="happy" size="sm" interactive={false} />
                    <div>
                      <div className="font-bold mb-0.5">Rekomendasi Analitis Aura Cuby:</div>
                      <p className="leading-relaxed">{dossier.auraRecommendation}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center text-zinc-400 space-y-3">
                <Search className="w-12 h-12 stroke-[1.2] opacity-40" />
                <p className="text-xs max-w-sm">
                  Tentukan topik proyek di kolom sebelah kiri dan biarkan Aura menyusun dossier riset komprehensif untukmu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
