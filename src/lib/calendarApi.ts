export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  category?: 'work' | 'meeting' | 'deep-work' | 'wellness' | 'break' | 'learning';
  isLocalOnly?: boolean;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
  isLocalOnly?: boolean;
}

const DEFAULT_MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'mock-1',
    summary: '🌅 Aura Morning Briefing & Priority Sync',
    description: 'Review tujuan utama hari ini, time blocking, dan kesiapan energi.',
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 30).toISOString() },
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 60).toISOString() },
    location: 'Aura Studio Virtual',
    category: 'deep-work',
    isLocalOnly: true,
  },
  {
    id: 'mock-2',
    summary: '📊 Analisis Proyek & Research Review',
    description: 'Bedah data arsitektur sistem dan validasi riset terkini bersama tim.',
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 120).toISOString() },
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 180).toISOString() },
    location: 'Google Meet',
    category: 'meeting',
    isLocalOnly: true,
  },
  {
    id: 'mock-3',
    summary: '☕ Cuby Coffee & Mind Refreshment',
    description: 'Jeda 20 menit untuk peregangan mata dan hidrasi optimal.',
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 240).toISOString() },
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 270).toISOString() },
    location: 'Pantry / Cafe Terdekat',
    category: 'break',
    isLocalOnly: true,
  },
  {
    id: 'mock-4',
    summary: '🚀 Deep Focus: Implementasi Fitur Utama',
    description: 'Sesi fokus tanpa distraksi untuk menyelesaikan modul prioritas tinggi.',
    start: { dateTime: new Date(Date.now() + 1000 * 60 * 330).toISOString() },
    end: { dateTime: new Date(Date.now() + 1000 * 60 * 450).toISOString() },
    category: 'deep-work',
    isLocalOnly: true,
  },
];

const DEFAULT_MOCK_TASKS: GoogleTaskItem[] = [
  {
    id: 'task-1',
    title: 'Review ringkasan artikel arsitektur AI terbaru',
    notes: 'Gunakan fitur Article Summarizer Aura untuk ekstrak action points',
    status: 'needsAction',
    isLocalOnly: true,
  },
  {
    id: 'task-2',
    title: 'Validasi jadwal mingguan di Google Calendar',
    notes: 'Pastikan ada buffer 15 menit antar pertemuan',
    status: 'completed',
    isLocalOnly: true,
  },
  {
    id: 'task-3',
    title: 'Riset lokasi meeting di Google Maps dengan WiFi stabil',
    notes: 'Cari co-working space atau cafe tenang dekat kantor',
    status: 'needsAction',
    isLocalOnly: true,
  },
];

export async function fetchGoogleCalendarEvents(
  token: string | null,
  timeMin?: string,
  timeMax?: string
): Promise<CalendarEvent[]> {
  if (!token) {
    return DEFAULT_MOCK_EVENTS;
  }

  try {
    const min = timeMin || new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const max = timeMax || new Date(new Date().setDate(new Date().getDate() + 7)).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      min
    )}&timeMax=${encodeURIComponent(max)}&singleEvents=true&orderBy=startTime&maxResults=50`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Sesi Google telah kedaluwarsa. Silakan sign in ulang.');
      }
      throw new Error(`Google Calendar API error: ${res.statusText}`);
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || '(Tanpa Judul)',
      description: item.description || '',
      location: item.location || '',
      start: item.start || {},
      end: item.end || {},
      htmlLink: item.htmlLink,
      isLocalOnly: false,
    }));
  } catch (error) {
    console.warn('Gagal mengambil kalender Google langsung, menggunakan data lokal:', error);
    return DEFAULT_MOCK_EVENTS;
  }
}

export async function createGoogleCalendarEvent(
  token: string | null,
  event: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
  }
): Promise<CalendarEvent> {
  if (!token) {
    const newEvent: CalendarEvent = {
      id: 'local-' + Date.now(),
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startTime },
      end: { dateTime: event.endTime },
      isLocalOnly: true,
    };
    return newEvent;
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startTime },
      end: { dateTime: event.endTime },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gagal membuat agenda di Google Calendar: ${res.statusText}`);
  }

  const created = await res.json();
  return {
    id: created.id,
    summary: created.summary,
    description: created.description,
    location: created.location,
    start: created.start,
    end: created.end,
    htmlLink: created.htmlLink,
    isLocalOnly: false,
  };
}

export async function deleteGoogleCalendarEvent(
  token: string | null,
  eventId: string
): Promise<boolean> {
  if (!token || eventId.startsWith('mock-') || eventId.startsWith('local-')) {
    return true;
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      eventId
    )}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.ok;
}

export async function fetchGoogleTasks(token: string | null): Promise<GoogleTaskItem[]> {
  if (!token) {
    return DEFAULT_MOCK_TASKS;
  }

  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return DEFAULT_MOCK_TASKS;
    }

    const data = await res.json();
    return (data.items || []).map((t: any) => ({
      id: t.id,
      title: t.title || 'Untitled Task',
      notes: t.notes,
      due: t.due,
      status: t.status === 'completed' ? 'completed' : 'needsAction',
      isLocalOnly: false,
    }));
  } catch (err) {
    console.warn('Gagal mengambil Google Tasks, fallback:', err);
    return DEFAULT_MOCK_TASKS;
  }
}

export async function createGoogleTask(
  token: string | null,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTaskItem> {
  if (!token) {
    return {
      id: 'local-task-' + Date.now(),
      title: task.title,
      notes: task.notes,
      due: task.due,
      status: 'needsAction',
      isLocalOnly: true,
    };
  }

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: task.title,
      notes: task.notes,
      due: task.due,
    }),
  });

  if (!res.ok) {
    throw new Error('Gagal menambahkan Google Task');
  }

  const data = await res.json();
  return {
    id: data.id,
    title: data.title,
    notes: data.notes,
    due: data.due,
    status: data.status || 'needsAction',
    isLocalOnly: false,
  };
}
