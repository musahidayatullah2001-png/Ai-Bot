import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Navigation,
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  Coffee,
  Building2,
  Car,
  Compass,
} from 'lucide-react';
import { CubyAvatar, CubyMood } from './CubyAvatar';
import { ConfirmationModal } from './ConfirmationModal';
import { createGoogleCalendarEvent } from '../lib/calendarApi';
import { sound } from '../lib/sound';

interface MapsViewProps {
  accessToken: string | null;
  cubyMood: CubyMood;
  setCubyMood: (mood: CubyMood) => void;
}

export const MapsView: React.FC<MapsViewProps> = ({
  accessToken,
  cubyMood,
  setCubyMood,
}) => {
  const [query, setQuery] = useState('');
  const [origin, setOrigin] = useState('');
  const [locationType, setLocationType] = useState('Cafe Kerja Kondusif');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>({
    overview: 'Rekomendasi area kerja produktif dan rute komut efisien.',
    recommendations: [
      {
        name: 'Work & Co Space Hub',
        category: 'Co-working & Dedicated Desk',
        address: 'Jl. Senopati / SCBD Area, Jakarta Selatan',
        highlights: ['Internet serat optik 200 Mbps', 'Ruang meeting kedap suara', 'Spesialis espresso'],
        commuteTip: 'Waktu terbaik berangkat sebelum jam 08:30 WIB untuk hindari ganjil-genap.',
        mapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Work+Co-working+Senopati+Jakarta',
      },
      {
        name: 'Kopi & Konsep Studio Cafe',
        category: 'Cafe Kerja Santai',
        address: 'Kuningan Business District',
        highlights: ['Banyak colokan listrik di setiap meja', 'Area outdoor tenang', 'Buka hingga 23:00'],
        commuteTip: 'Dapat diakses 5 menit jalan kaki dari stasiun LRT terdekat.',
        mapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Kopi+Konsep+Kuningan+Jakarta',
      },
    ],
    calendarBufferTip: 'Alokasikan buffer perjalanan 30-40 menit pada Google Calendar saat jam sibuk.',
  });

  // Modal for scheduling meeting at chosen location
  const [selectedPlaceForSchedule, setSelectedPlaceForSchedule] = useState<any>(null);

  const presets = [
    { label: '☕ Cafe Kerja & WiFi', type: 'Cafe dengan WiFi stabil & banyak colokan' },
    { label: '🏢 Co-working Space', type: 'Modern co-working space dengan private booth' },
    { label: '🤝 Meeting Klien Eksklusif', type: 'Tempat meeting formal & tenang' },
    { label: '🚗 Rute Komut Cepat', type: 'Analisis rute komut dan waktu tempuh optimal' },
  ];

  const handleSearchMaps = async () => {
    if (!query.trim() && !locationType) return;
    setIsLoading(true);
    setCubyMood('thinking');
    sound.playThinking();

    try {
      const res = await fetch('/api/maps-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim() || locationType,
          origin,
          locationType,
        }),
      });

      if (!res.ok) throw new Error('Gagal mendapatkan data Google Maps');
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

  const handleConfirmScheduleMeeting = async () => {
    if (!selectedPlaceForSchedule) return;
    const place = selectedPlaceForSchedule;
    setSelectedPlaceForSchedule(null);

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startISO = new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString();
      const endISO = new Date(tomorrow.setHours(15, 30, 0, 0)).toISOString();

      await createGoogleCalendarEvent(accessToken, {
        summary: `📍 Sesi Kerja / Meeting: ${place.name}`,
        description: `Alamat: ${place.address}\nTips Komut: ${place.commuteTip}\nGoogle Maps: ${place.mapsSearchUrl}\n\n[Direncanakan oleh Aura Maps & Commute Planner]`,
        startTime: startISO,
        endTime: endISO,
        location: `${place.name}, ${place.address}`,
      });

      sound.playSuccess();
      alert(`Meeting di ${place.name} telah dijadwalkan di Google Calendar!`);
    } catch (err: any) {
      alert(`Gagal menjadwalkan: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedPlaceForSchedule}
        title="Jadwalkan Meeting di Lokasi Ini ke Google Calendar?"
        description="Aura akan membuat agenda baru di Google Calendar lengkap dengan alamat lokasi dan tautan Google Maps."
        confirmLabel="Jadwalkan Agenda"
        cancelLabel="Batal"
        type="primary"
        affectedItemName={selectedPlaceForSchedule?.name}
        affectedItemDetails={`Alamat: ${selectedPlaceForSchedule?.address || ''}`}
        onConfirm={handleConfirmScheduleMeeting}
        onCancel={() => setSelectedPlaceForSchedule(null)}
      />

      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CubyAvatar mood={cubyMood} size="md" interactive showSpeechBubble={false} />
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-300" />
              Aura Google Maps & Commute Advisor
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-md">
              Temukan tempat kerja kondusif, meeting spot representatif, serta sinkronisasi buffer komut ke Google Calendar.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Search Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Cari Lokasi & Rute
              </h3>
            </div>

            {/* Presets */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5">
                Kategori Cepat:
              </label>
              <div className="space-y-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLocationType(p.type);
                      setQuery(p.label);
                      sound.playPop();
                    }}
                    className="w-full text-left p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 text-xs font-semibold transition-colors truncate"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Kueri Lokasi / Nama Tempat
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Misal: Cafe dekat SCBD, Co-working di BSD..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Titik Keberangkatan (Opsional)
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Misal: Kantor Sudirman atau Lokasi Saat Ini"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleSearchMaps}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {isLoading ? 'Aura Menganalisis Lokasi...' : 'Cari Rekomendasi Maps'}
            </button>
          </div>
        </div>

        {/* Results Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                  Rekomendasi Tempat & Navigasi
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Google Maps Ready
                </span>
              </div>
            </div>

            {/* Commute Buffer Tip */}
            {result?.calendarBufferTip && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Tips Buffer Google Calendar:</strong> {result.calendarBufferTip}
                </span>
              </div>
            )}

            {/* Recommendations List */}
            <div className="space-y-4">
              {result?.recommendations?.map((item: any, idx: number) => {
                const mapsUrl =
                  item.mapsSearchUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${item.name} ${item.address || ''}`
                  )}`;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3 hover:border-emerald-400 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{item.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                          Buka di Google Maps
                        </a>

                        <button
                          onClick={() => setSelectedPlaceForSchedule(item)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Jadwalkan di Sini
                        </button>
                      </div>
                    </div>

                    {/* Highlights */}
                    {item.highlights?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.highlights.map((hl: string, hidx: number) => (
                          <span
                            key={hidx}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-medium"
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Commute Tip */}
                    {item.commuteTip && (
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 bg-zinc-100/60 dark:bg-zinc-800/80 p-2 rounded-xl">
                        <Car className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{item.commuteTip}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
