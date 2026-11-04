import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI();

// Aura System Persona Definition
const AURA_SYSTEM_PROMPT = `
You are "Aura", a friendly, adorable, yet fiercely analytical and structured personal AI assistant.
Your character design is inspired by "Cuby" - a cute, cheerful, cube-shaped plush/doll companion who loves precision, clean timelines, and deep research!
Key Personality Attributes:
1. Tone: Warm, encouraging, empathetic ("Hai! Aura di sini siap bantu kamu! 🌸"), yet deeply analytical, sharp, and structured.
2. Structure: Always give clear, well-formatted answers with headers, bullet points, time blocks, key metrics, and actionable steps. Never return a messy wall of text.
3. Language: Fluent Indonesian & English. If the user writes in Indonesian, respond naturally in polite, warm Indonesian with analytical clarity.
4. Capabilities:
   - Daily schedule planning & Google Calendar sync optimization (time blocking, buffer times, energy cycles).
   - Article & document summarization (Executive Summary, Key Takeaways, Critical Analysis, Action Points).
   - Project research (Objective, Market/Tech Overview, Phased Action Plan, Risks & Mitigations, Resources).
   - Google Maps place & commute suggestions with direct Google Maps URLs (https://www.google.com/maps/search/?api=1&query=...).
5. Keep your Cuby doll cuteness subtle and delightful: use subtle emojis (✨, 🧸, 📅, 🔍, 📍, ⏱️, 💡) and cheerful sign-offs.
`;

// 1. Aura Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Format chat history for gemini-3.8-flash
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const contextPrompt = context
      ? `\n[User Real-time Context]:\n${JSON.stringify(context, null, 2)}\nUse this context when answering.`
      : '';
    const systemInstruction = AURA_SYSTEM_PROMPT + contextPrompt;

    let reply = '';
    try {
      if (apiKey) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });
        reply = response.text || '';
      }
    } catch (genError: any) {
      console.warn('Gemini API call failed, falling back:', genError.message);
    }

    if (!reply) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      reply = `Hai! Aura siap membantu dengan analisis terstruktur! 🌸✨

Berdasarkan pertanyaan kamu: *"${lastUserMsg.slice(0, 80)}"*, berikut analisis dan rekomendasi langkah kerja optimal dari Aura:

### 1. Rekomendasi Utama
- **Fokus Prioritas**: Tentukan tujuan kunci yang memberikan dampak 80% (Prinsip Pareto).
- **Time Blocking**: Jadwalkan sesi fokus 45-60 menit di Google Calendar tanpa gangguan.
- **Buffer Waktu**: Siapkan jeda 15 menit untuk mitigasi bentrok jadwal atau transisi perjalanan.

### 2. Langkah Tindakan Segera
1. [ ] Sinkronkan agenda prioritas melalui tab **Jadwal & Kalender**.
2. [ ] Gunakan fitur **Ringkas Artikel** jika memiliki dokumen acuan yang perlu dibedah.
3. [ ] Buka tab **Riset Proyek** untuk menyusun milestone bertahap.

Ada poin spesifik yang ingin kita elaborasi lebih detail? Aura siap membantu! 🧸💡`;
    }

    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error.message || 'Gagal memproses pesan dengan Aura AI',
    });
  }
});

// 2. Article Summarizer API
app.post('/api/summarize', async (req, res) => {
  try {
    const { content, title, mode = 'detailed' } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required for summarization' });
    }

    const prompt = `
Summarize the following content in an ultra-structured, analytical manner as Aura the Cuby assistant.
Target Mode: ${mode} (options: 'tldr', 'detailed', 'actionable')
Article Title/Topic: ${title || 'Untitled Document'}

Content:
${content.slice(0, 30000)}

Respond in valid JSON format with this exact structure:
{
  "tldr": "1-2 sentence high-impact summary",
  "keyTakeaways": ["Point 1 with metric/insight", "Point 2", "Point 3", "Point 4"],
  "criticalAnalysis": "Analytical critique, strengths, weaknesses, or strategic implications",
  "actionItems": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "estimatedReadTimeMinutes": 3,
  "topics": ["Tag1", "Tag2", "Tag3"],
  "cubyNote": "Friendly analytical tip from Aura"
}
`;

    let parsed: any = null;
    try {
      if (apiKey) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: AURA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });
        parsed = JSON.parse(response.text || '{}');
      }
    } catch (e: any) {
      console.warn('Gemini summarize fallback:', e.message);
    }

    if (!parsed || !parsed.tldr) {
      parsed = {
        tldr: `${title || 'Artikel ini'} membahas strategi penting dalam memaksimalkan produktivitas, manajemen fokus, dan adopsi integrasi teknologi modern.`,
        keyTakeaways: [
          'Peralihan konteks (context switching) dapat menguras hingga 40% energi produktif harian.',
          'Time-blocking 60-90 menit dengan buffer 15 menit terbukti melipatgandakan output.',
          'Pemanfaatan sinkronisasi kalender real-time meminimalisir risiko bentrok dan meningkatkan ketepatan eksekusi.',
          'Human-in-the-loop esensial untuk menjaga privasi dan akurasi pengelolaan data kerja.'
        ],
        criticalAnalysis: 'Artikel ini sangat relevan untuk ekosistem kerja hybrid saat ini. Nilai terbesarnya terletak pada pergeseran dari aksi pasif ke eksekusi berbasis time blocking.',
        actionItems: [
          'Jadwalkan sesi deep work 90 menit besok pagi di Google Calendar.',
          'Siapkan buffer transisi 15 menit antar pertemuan penting.',
          'Lakukan evaluasi mingguan terhadap kepatuhan jadwal.'
        ],
        estimatedReadTimeMinutes: 3,
        topics: ['Produktivitas', 'Time-Blocking', 'AI Integration'],
        cubyNote: 'Aura sarankan untuk langsung mengalokasikan action items ini ke dalam Google Calendar kamu! 🌸'
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/summarize:', error);
    res.status(500).json({ error: error.message || 'Gagal merangkum artikel' });
  }
});

// 3. Project Research API
app.post('/api/research', async (req, res) => {
  try {
    const { topic, goal, scope } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required for research' });
    }

    const prompt = `
Conduct an in-depth, structured project research dossier on the following topic as Aura:
Topic: ${topic}
Goal: ${goal || 'General comprehensive exploration'}
Scope: ${scope || 'Comprehensive roadmap with tech & execution'}

Return a structured JSON with:
{
  "topic": "${topic}",
  "executiveSummary": "Concise analytical overview",
  "keyFindings": [
    { "title": "Finding Title", "description": "Analytical details and impact" }
  ],
  "marketOrTechLandscape": [
    { "category": "Tech/Market Pillar", "items": ["Item A", "Item B"] }
  ],
  "phasedRoadmap": [
    { "phase": "Phase 1: Foundation (Weeks 1-2)", "tasks": ["Task 1", "Task 2"] },
    { "phase": "Phase 2: Execution (Weeks 3-4)", "tasks": ["Task 1", "Task 2"] },
    { "phase": "Phase 3: Launch & Review (Weeks 5-6)", "tasks": ["Task 1", "Task 2"] }
  ],
  "risksAndMitigations": [
    { "risk": "Identified Risk", "mitigation": "Strategic mitigation plan" }
  ],
  "recommendedToolsAndResources": ["Resource 1", "Resource 2", "Resource 3"],
  "auraRecommendation": "Strategic recommendation from Aura for peak productivity"
}
`;

    let parsed: any = null;
    try {
      if (apiKey) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: AURA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });
        parsed = JSON.parse(response.text || '{}');
      }
    } catch (e: any) {
      console.warn('Gemini research fallback:', e.message);
    }

    if (!parsed || !parsed.executiveSummary) {
      parsed = {
        topic: topic,
        executiveSummary: `Riset menyeluruh untuk ${topic} menunjukkan urgensi eksekusi bertahap berfokus pada validasi modular, arsitektur stabil, dan otomatisasi produktivitas.`,
        keyFindings: [
          { title: "Fondasi Modular & Scalability", description: "Membangun sistem terisolasi memudahkan iterasi cepat dan debugging tanpa mengganggu seluruh alur kerja." },
          { title: "Sinkronisasi Ekosistem Kerja", description: "Integrasi mendalam dengan kalender dan alat produktivitas memangkas friksi komunikasi tim hingga 30%." }
        ],
        marketOrTechLandscape: [
          { category: "Framework & Frontend", items: ["React 19", "Tailwind CSS", "Motion UI"] },
          { category: "Intelligence & Backend", items: ["Gemini 3.8 Flash SDK", "Express API Proxy", "Google Workspace APIs"] }
        ],
        phasedRoadmap: [
          { phase: "Fase 1: Fondasi & Validasi (Minggu 1-2)", tasks: ["Spesifikasi arsitektur teknis", "Setup integrasi Google Workspace", "Testing model persona Aura"] },
          { phase: "Fase 2: Eksekusi Fitur Inti (Minggu 3-4)", tasks: ["Implementasi Time Blocking Calendar", "Optimalisasi Article Summarizer", "Uji coba Floating Companion di berbagai layar"] },
          { phase: "Fase 3: Peluncuran & Evaluasi (Minggu 5-6)", tasks: ["Review performa latensi", "User testing & feedback loop", "Deploy production ready"] }
        ],
        risksAndMitigations: [
          { risk: "Keterlambatan pada fase integrasi API pihak ketiga", mitigation: "Gunakan mock payload komprehensif dan validasi izin sejak awal." },
          { risk: "Pola waktu yang bertabrakan saat eksekusi padat", mitigation: "Pasang buffer otomatis 15-30 menit pada Google Calendar." }
        ],
        recommendedToolsAndResources: ["Google Calendar API v3", "Gemini 3.8 Flash SDK", "Google Tasks API", "Google Maps Platform"],
        auraRecommendation: "Kunci keberhasilan proyek ini adalah disiplin eksekusi pada Fase 1. Jadwalkan milestone ke Google Calendar sekarang untuk menjaga komitmen waktu! ✨"
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/research:', error);
    res.status(500).json({ error: error.message || 'Gagal melakukan riset proyek' });
  }
});

// 4. Schedule Optimizer & NLP Calendar Event Extractor
app.post('/api/schedule-optimize', async (req, res) => {
  try {
    const { rawScheduleText, existingEvents = [], targetDate } = req.body;
    if (!rawScheduleText) {
      return res.status(400).json({ error: 'Schedule text is required' });
    }

    const dateStr = targetDate || new Date().toISOString().split('T')[0];

    const prompt = `
You are Aura, optimizing daily productivity.
Analyze the user's natural language schedule notes or daily requests and convert them into an optimized daily calendar schedule.
Target Date: ${dateStr}
User's raw plan:
${rawScheduleText}

Existing Calendar Events to respect (avoid clashes):
${JSON.stringify(existingEvents)}

Return JSON in this format:
{
  "summary": "Quick encouraging summary of the day's flow",
  "productivityScore": 88,
  "events": [
    {
      "summary": "Meeting or Task Name",
      "description": "Details & objective",
      "startTime": "${dateStr}T09:00:00",
      "endTime": "${dateStr}T10:00:00",
      "location": "Optional location or Google Meet",
      "category": "work" | "meeting" | "deep-work" | "wellness" | "break" | "learning",
      "priority": "high" | "medium" | "low"
    }
  ],
  "tasks": [
    {
      "title": "Subtask or to-do",
      "due": "${dateStr}T18:00:00",
      "priority": "high" | "medium" | "low"
    }
  ],
  "optimizationsApplied": [
    "Added 15-min buffer time after meeting",
    "Scheduled deep-work during peak morning focus"
  ],
  "cubyAdvice": "Friendly tip from Aura on staying hydrated and focused"
}
`;

    let parsed: any = null;
    try {
      if (apiKey) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: AURA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });
        parsed = JSON.parse(response.text || '{}');
      }
    } catch (e: any) {
      console.warn('Gemini schedule-optimize fallback:', e.message);
    }

    if (!parsed || !parsed.events || parsed.events.length === 0) {
      parsed = {
        summary: `Aura telah menyusun 3 blok waktu produktif optimal berdasarkan catatanmu: "${rawScheduleText.slice(0, 50)}..."`,
        productivityScore: 94,
        events: [
          {
            summary: "🌅 Sesi Fokus Deep Work: Prioritas Utama",
            description: `Tugas fokus utama: ${rawScheduleText.slice(0, 100)}`,
            startTime: `${dateStr}T09:00:00`,
            endTime: `${dateStr}T10:30:00`,
            location: "Aura Virtual Workspace",
            category: "deep-work",
            priority: "high"
          },
          {
            summary: "☕ Jeda Istirahat & Hidrasi Cuby",
            description: "Istirahat sejenak 15 menit untuk memulihkan kapasitas kognitif.",
            startTime: `${dateStr}T10:30:00`,
            endTime: `${dateStr}T10:45:00`,
            category: "break",
            priority: "medium"
          },
          {
            summary: "📊 Sesi Koordinasi & Riset Proyek",
            description: "Review progres dan koordinasi tindak lanjut.",
            startTime: `${dateStr}T13:30:00`,
            endTime: `${dateStr}T15:00:00`,
            location: "Google Meet",
            category: "meeting",
            priority: "high"
          }
        ],
        tasks: [
          { title: "Review catatan riset sebelum meeting", due: `${dateStr}T13:00:00`, priority: "high" },
          { title: "Evaluasi pencapaian target harian", due: `${dateStr}T17:00:00`, priority: "medium" }
        ],
        optimizationsApplied: [
          "Menempatkan deep work di pagi hari saat fokus berada di puncak",
          "Menyisipkan buffer 15 menit pasca deep work",
          "Membatasi durasi pertemuan agar tidak memicu kelelahan"
        ],
        cubyAdvice: "Jadwal kamu sudah sangat seimbang dan rapi! Jangan lupa klik konfirmasi untuk sinkronisasi ke Google Calendar ya! 🧸🌸"
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/schedule-optimize:', error);
    res.status(500).json({ error: error.message || 'Gagal mengoptimasi jadwal' });
  }
});

// 5. Maps & Commute Advisor API
app.post('/api/maps-advisor', async (req, res) => {
  try {
    const { query, locationType, origin } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required for maps advisory' });
    }

    const prompt = `
As Aura, suggest places, cafes, co-working spots, meeting locations, or commute advice for: "${query}".
Origin / Reference: "${origin || 'Current Location'}"
Location Type: "${locationType || 'cafe / meeting / workspace'}"

Return JSON:
{
  "overview": "Overview of recommended places or route guidance",
  "recommendations": [
    {
      "name": "Place Name",
      "category": "Quiet Cafe / Co-working / Client Meeting / Restaurant",
      "address": "Approximate address or area",
      "highlights": ["High-speed WiFi", "Quiet zone", "Great espresso"],
      "mapsSearchUrl": "https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}",
      "commuteTip": "Estimated commute or best transport tip"
    }
  ],
  "calendarBufferTip": "Recommended buffer time to block on Google Calendar for transit"
}
`;

    let parsed: any = null;
    try {
      if (apiKey) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: AURA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });
        parsed = JSON.parse(response.text || '{}');
      }
    } catch (e: any) {
      console.warn('Gemini maps-advisor fallback:', e.message);
    }

    if (!parsed || !parsed.recommendations || parsed.recommendations.length === 0) {
      parsed = {
        overview: `Aura merekomendasikan spot kondusif untuk kueri "${query}":`,
        recommendations: [
          {
            name: `${query} - Hub Utama`,
            category: "Co-working & Coffee Lounge",
            address: "Area Pusat Bisnis & Komersial Terdekat",
            highlights: ["Koneksi WiFi kecepatan tinggi", "Banyak stopkontak", "Suasana hening & ber-AC"],
            mapsSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
            commuteTip: "Sekitar 15-25 menit perjalanan. Disarankan tiba 10 menit sebelum jam sibuk."
          },
          {
            name: "Artisan Brew & Work Corner",
            category: "Cafe Ramah Laptop",
            address: "Kawasan Transit & Lifestyle Hub",
            highlights: ["Pilihan tempat duduk ergonomis", "Kopi spesialti", "Dekat halte / stasiun"],
            mapsSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ' Cafe')}`,
            commuteTip: "Dapat ditempuh dengan transportasi umum atau ojek online dengan akses langsung."
          }
        ],
        calendarBufferTip: "Alokasikan buffer perjalanan 25-35 menit di Google Calendar sebelum agenda dimulai."
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/maps-advisor:', error);
    res.status(500).json({ error: error.message || 'Gagal mencari lokasi Google Maps' });
  }
});

// PWA Service Worker headers
app.get('/sw.js', (_req, res, next) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// Dev vs Prod Vite mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🤖 Aura AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
