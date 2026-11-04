import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MapPin,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CubyAvatar, CubyMood } from './CubyAvatar';
import { ConfirmationModal } from './ConfirmationModal';
import {
  CalendarEvent,
  GoogleTaskItem,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  fetchGoogleTasks,
  createGoogleTask,
} from '../lib/calendarApi';
import { sound } from '../lib/sound';

interface ScheduleViewProps {
  accessToken: string | null;
  onRequireAuth: () => void;
  cubyMood: CubyMood;
  setCubyMood: (mood: CubyMood) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  accessToken,
  onRequireAuth,
  cubyMood,
  setCubyMood,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // NLP Schedule input
  const [rawPlanText, setRawPlanText] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // Confirmation Modal states
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'primary' | 'danger' | 'success';
    affectedItemName?: string;
    affectedItemDetails?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Manual Add Event state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSummary, setNewSummary] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Load calendar events
  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const startOfDay = new Date(`${selectedDate}T00:00:00Z`).toISOString();
      const endOfDay = new Date(`${selectedDate}T23:59:59Z`).toISOString();
      const [fetchedEvents, fetchedTasks] = await Promise.all([
        fetchGoogleCalendarEvents(accessToken, startOfDay, endOfDay),
        fetchGoogleTasks(accessToken),
      ]);
      setEvents(fetchedEvents);
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error('Error fetching calendar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [accessToken, selectedDate]);

  // Run AI Optimization
  const handleOptimizeSchedule = async () => {
    if (!rawPlanText.trim()) return;
    setIsOptimizing(true);
    setCubyMood('thinking');
    sound.playThinking();

    try {
      const res = await fetch('/api/schedule-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawScheduleText: rawPlanText,
          existingEvents: events.map((e) => ({
            summary: e.summary,
            start: e.start.dateTime || e.start.date,
            end: e.end.dateTime || e.end.date,
          })),
          targetDate: selectedDate,
        }),
      });

      if (!res.ok) throw new Error('Gagal mengoptimasi jadwal');
      const data = await res.json();
      setOptimizationResult(data);
      setCubyMood('happy');
      sound.playSuccess();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setCubyMood('idle');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Safe apply optimized events with MANDATORY confirmation
  const handleRequestApplyOptimization = () => {
    if (!optimizationResult || !optimizationResult.events?.length) return;

    const eventCount = optimizationResult.events.length;
    const taskCount = optimizationResult.tasks?.length || 0;

    setModalConfig({
      isOpen: true,
      title: 'Sinkronkan Agenda ke Google Calendar?',
      description: `Aura akan menambahkan ${eventCount} agenda terjadwal dan ${taskCount} tugas baru ke Google Calendar & Tasks kamu untuk tanggal ${selectedDate}.`,
      confirmLabel: 'Ya, Sinkronkan Sekarang',
      cancelLabel: 'Batal',
      type: 'primary',
      affectedItemName: `${eventCount} Agenda Baru (Time Blocking Optimal)`,
      affectedItemDetails: optimizationResult.events
        .map((e: any) => `• ${e.startTime.slice(11, 16)} - ${e.summary}`)
        .join('\n'),
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          for (const ev of optimizationResult.events) {
            await createGoogleCalendarEvent(accessToken, {
              summary: ev.summary,
              description: `${ev.description || ''}\n\n[Dibuat oleh Aura Cuby AI Assistant]`,
              startTime: ev.startTime,
              endTime: ev.endTime,
              location: ev.location,
            });
          }
          if (optimizationResult.tasks) {
            for (const t of optimizationResult.tasks) {
              await createGoogleTask(accessToken, {
                title: t.title,
                due: t.due,
              });
            }
          }
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
          sound.playSuccess();
          setOptimizationResult(null);
          setRawPlanText('');
          await loadCalendarData();
        } catch (err: any) {
          alert(`Gagal menyimpan ke Google: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Safe manual add event with confirmation
  const handleRequestAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const startTimeISO = new Date(`${selectedDate}T${newStartTime}:00`).toISOString();
    const endTimeISO = new Date(`${selectedDate}T${newEndTime}:00`).toISOString();

    setModalConfig({
      isOpen: true,
      title: 'Tambahkan Agenda ke Google Calendar?',
      description: 'Agenda baru ini akan tersimpan di kalender utama akun Google kamu.',
      confirmLabel: 'Tambahkan Agenda',
      cancelLabel: 'Batal',
      type: 'primary',
      affectedItemName: newSummary,
      affectedItemDetails: `Waktu: ${newStartTime} - ${newEndTime} | Lokasi: ${newLocation || 'Online'}`,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          await createGoogleCalendarEvent(accessToken, {
            summary: newSummary,
            description: newDesc,
            startTime: startTimeISO,
            endTime: endTimeISO,
            location: newLocation,
          });
          sound.playSuccess();
          setShowAddForm(false);
          setNewSummary('');
          setNewLocation('');
          setNewDesc('');
          await loadCalendarData();
        } catch (err: any) {
          alert(`Gagal menambah agenda: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Safe delete event with confirmation
  const handleRequestDelete = (ev: CalendarEvent) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Agenda dari Google Calendar?',
      description: 'Apakah kamu yakin ingin menghapus agenda ini secara permanen dari Google Calendar?',
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
      type: 'danger',
      affectedItemName: ev.summary,
      affectedItemDetails: `ID: ${ev.id}`,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          await deleteGoogleCalendarEvent(accessToken, ev.id);
          sound.playPop();
          await loadCalendarData();
        } catch (err: any) {
          alert(`Gagal menghapus: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        type={modalConfig.type}
        affectedItemName={modalConfig.affectedItemName}
        affectedItemDetails={modalConfig.affectedItemDetails}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Top Header Card */}
      <div className="p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CubyAvatar mood={cubyMood} size="md" interactive showSpeechBubble={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">
                Aura Smart Calendar Sync
              </h2>
              {accessToken ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-bold">
                  Google Connected
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
                  Preview Mode
                </span>
              )}
            </div>
            <p className="text-xs text-purple-100 mt-1 max-w-lg">
              Sinkronisasi real-time Google Calendar & Google Tasks dengan time blocking cerdas dan analisis ritme energi harian oleh Aura.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold focus:outline-none focus:bg-white/20"
          />
          <button
            onClick={loadCalendarData}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
            title="Refresh Jadwal"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {!accessToken && (
            <button
              onClick={onRequireAuth}
              className="px-4 py-2 rounded-2xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 shadow-md transition-all active:scale-95"
            >
              Hubungkan Google
            </button>
          )}
        </div>
      </div>

      {/* Grid: Left = AI Schedule Optimizer, Right = Visual Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Natural Language AI Optimizer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Schedule Box */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Aura Day Planner AI
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                NLP Time-Blocker
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
              Tuliskan rencana harianmu dengan bahasa santai. Aura akan menyusun time blocking terstruktur dan buffer istirahat optimal!
            </p>

            <textarea
              rows={4}
              value={rawPlanText}
              onChange={(e) => setRawPlanText(e.target.value)}
              placeholder="Contoh: Jam 9 pagi sync sprint tim, jam 1 siang riset arsitektur AI, jam 3 sore meeting klien di cafe, sore olahraga 45 menit..."
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all resize-none"
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CubyAvatar mood={isOptimizing ? 'thinking' : 'idle'} size="sm" interactive={false} />
                <span className="text-[11px] text-zinc-500">
                  {isOptimizing ? 'Menghitung time blocking...' : 'Siap optimasi'}
                </span>
              </div>
              <button
                onClick={handleOptimizeSchedule}
                disabled={!rawPlanText.trim() || isOptimizing}
                className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isOptimizing ? 'Mengoptimasi...' : 'Optimasi Jadwal'}
              </button>
            </div>

            {/* Optimization Result Preview */}
            {optimizationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    Hasil Rekomendasi Aura
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 font-bold">
                    Skor: {optimizationResult.productivityScore || 90}/100
                  </span>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-3">
                  {optimizationResult.summary}
                </p>

                {/* Event list preview */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3 pr-1 text-xs">
                  {optimizationResult.events?.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-purple-100 dark:border-purple-800/60 flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold text-zinc-900 dark:text-white truncate">
                          {ev.summary}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {ev.startTime?.slice(11, 16)} - {ev.endTime?.slice(11, 16)}
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium">
                        {ev.category || 'agenda'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Advice */}
                {optimizationResult.cubyAdvice && (
                  <div className="text-[11px] text-purple-800 dark:text-purple-300 italic mb-3">
                    🧸 Aura: "{optimizationResult.cubyAdvice}"
                  </div>
                )}

                <button
                  onClick={handleRequestApplyOptimization}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Terapkan ke Google Calendar (Konfirmasi)
                </button>
              </motion.div>
            )}
          </div>

          {/* Google Tasks Checklist */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Google Tasks
                </h3>
              </div>
              <span className="text-xs text-zinc-400">{tasks.length} Tugas</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400">
                  Tidak ada tugas aktif
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                      task.status === 'completed'
                        ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400 line-through'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-400'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      {task.notes && (
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {task.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Day Agenda & Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Agenda Google Calendar
                </h3>
                <p className="text-xs text-zinc-500">
                  {new Date(selectedDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddForm ? 'Tutup Form' : 'Tambah Agenda'}
              </button>
            </div>

            {/* Manual Add Event Form */}
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleRequestAddManual}
                className="mb-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3"
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Tambah Agenda Baru
                </div>
                <input
                  type="text"
                  placeholder="Judul Agenda / Meeting"
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Mulai</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Selesai</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Lokasi (Opsional / Google Meet)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-zinc-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm"
                  >
                    Simpan Agenda
                  </button>
                </div>
              </motion.form>
            )}

            {/* Events Timeline List */}
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  Tidak ada agenda terjadwal untuk hari ini.
                </div>
              ) : (
                events.map((ev) => {
                  const startTime = ev.start.dateTime
                    ? new Date(ev.start.dateTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'All Day';
                  const endTime = ev.end.dateTime
                    ? new Date(ev.end.dateTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={ev.id}
                      className="group p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-zinc-200/80 dark:border-zinc-700/80 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 text-center shrink-0 pt-0.5">
                          <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-300">
                            {startTime}
                          </span>
                          {endTime && (
                            <span className="block text-[10px] text-zinc-400">
                              {endTime}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                            <span>{ev.summary}</span>
                            {ev.isLocalOnly && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                Demo
                              </span>
                            )}
                          </div>
                          {ev.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                              {ev.description}
                            </p>
                          )}
                          {ev.location && (
                            <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            title="Buka di Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleRequestDelete(ev)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Hapus agenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
