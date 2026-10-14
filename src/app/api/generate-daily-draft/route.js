import { NextResponse } from "next/server";

const FALLBACK_TEMPLATES = [
  {
    activities: [
      {
        time_range: "08:30 - 10:00",
        title: "Daily Standup Meeting & Review Tiket Task",
        description: "Mengikuti koordinasi harian bersama tim teknis, memaparkan progres sprint harian, dan sinkronisasi kebutuhan modul kerja.",
      },
      {
        time_range: "10:00 - 12:00",
        title: "Implementasi & Slicing Komponen Antarmuka",
        description: "Melakukan integrasi tata letak responsif, penyesuaian komponen UI, serta memastikan konsistensi desain sistem.",
      },
      {
        time_range: "13:00 - 15:30",
        title: "Integrasi Logika Bisnis & Pengujian Endpoint API",
        description: "Menghubungkan alur pertukaran data frontend dengan backend service serta mengimplementasikan validasi input form.",
      },
      {
        time_range: "15:30 - 17:00",
        title: "Code Review, Testing Mandiri & Dokumentasi Teknis",
        description: "Menjalankan verifikasi fungsionalitas fitur, merapikan struktur kode bersih, dan mencatat progres pekerjaan pada sistem.",
      },
    ],
    learning: "Pendalaman pemahaman mengenai arsitektur perangkat lunak modular, manajemen state aplikasi modern, serta penerapan standar kode bersih dalam lingkungan pengembangan industri.",
    obstacle: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian.",
  },
  {
    activities: [
      {
        time_range: "08:30 - 10:00",
        title: "Sinkronisasi Tim & Analisis Kebutuhan Fitur",
        description: "Mempelajari spesifikasi teknis modul yang akan dikembangkan dan mendiskusikan alur integrasi dengan mentor teknis.",
      },
      {
        time_range: "10:00 - 12:00",
        title: "Debugging & Optimasi Query Aliran Data",
        description: "Mengidentifikasi akar permasalahan pada modul yang mengalami bottleneck performa dan melakukan penyesuaian logika pemrosesan.",
      },
      {
        time_range: "13:00 - 15:30",
        title: "Pengembangan Fitur Operasional & Refactoring Kode",
        description: "Mengimplementasikan peningkatan performa modul kerja dan memastikan interoperabilitas antarkomponen berjalan stabil.",
      },
      {
        time_range: "15:30 - 17:00",
        title: "Penyusunan Log Kemajuan & Quality Assurance Check",
        description: "Melakukan verifikasi hasil pengujian end-to-end secara mandiri dan menyusun dokumentasi ringkas untuk pelaporan tim.",
      },
    ],
    learning: "Peningkatan keterampilan analisis pemecahan masalah teknis, teknik optimasi penanganan data, dan penguasaan alur kerja kolaboratif berbasis version control.",
    obstacle: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian.",
  },
  {
    activities: [
      {
        time_range: "08:30 - 10:00",
        title: "Briefing Pagi & Pemeriksaan Environment Kerja",
        description: "Memastikan kesiapan branch kerja lokal, dependensi pustaka, dan konfigurasi environment sebelum memulai pengerjaan task harian.",
      },
      {
        time_range: "10:00 - 12:00",
        title: "Riset Metodologi Teknis & Implementasi Prototipe",
        description: "Mengeksplorasi referensi dokumentasi resmi dan menerapkan prototipe solusi teknis sesuai kebutuhan kasus kerja.",
      },
      {
        time_range: "13:00 - 15:30",
        title: "Penyelesaian Modul Kerja Utama & Penanganan Validasi",
        description: "Mengembangkan fungsionalitas inti modul dengan memperhatikan edge-case pengujian dan aspek keamanan input data.",
      },
      {
        time_range: "15:30 - 17:00",
        title: "Sinkronisasi Branch Repositori & Rangkuman Harian",
        description: "Melakukan commit perubahan kode secara terstruktur, push ke repositori kerja, dan mencatat rangkuman capaian harian.",
      },
    ],
    learning: "Penguasaan teknik implementasi fungsi perangkat lunak berbasis dokumentasi standar industri dan peningkatan ketelitian dalam validasi data masukan sistem.",
    obstacle: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian.",
  },
];

export async function POST(req) {
  try {
    const { role = "Software Engineer / IT Developer Magang", topic = "" } = await req.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    // Jika tidak ada Groq API key, gunakan template fallback acak berkualitas tinggi
    if (!groqApiKey) {
      const fallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
      return NextResponse.json(fallback);
    }

    const systemPrompt = `Anda adalah asisten cerdas penyusun logbook harian magang industri berstandar formal dan profesional.
Tugas Anda: membuat 1 paket rancangan logbook harian lengkap untuk mahasiswa magang.

Peran/Role Mahasiswa: "${role}".
${topic ? `Fokus Pekerjaan Khusus: "${topic}".` : "Pekerjaan: aktivitas pengembangan teknis, integrasi sistem, pengujian, dan dokumentasi rutin kantor."}

Aturan Ketat:
1. Buat TEPAT 4 aktivitas kerja kantor berurutan yang mencakup jam kerja penuh:
   - Slot 1: "08:30 - 10:00" (Standup meeting / planning / briefing / cek task)
   - Slot 2: "10:00 - 12:00" (Pekerjaan teknis inti / slicing / implementasi / riset)
   - Slot 3: "13:00 - 15:30" (Eksekusi lanjutan / testing / integrasi API / debugging)
   - Slot 4: "15:30 - 17:00" (Testing mandiri / review kode / dokumentasi / sinkronisasi)
2. Setiap judul aktivitas maksimal 8 kata, formal dan profesional.
3. Setiap deskripsi aktivitas minimal 80 karakter, lugas, realistis, dan menggunakan bahasa Indonesia formal.
4. Tulis 1 paragraf 'learning' (hasil pembelajaran/kompetensi teknis) minimal 100 karakter. AWALI LANGSUNG dengan kata benda/konsep profesional (misal: "Pendalaman pemahaman mengenai...", "Peningkatan kompetensi dalam..."). DILARANG menggunakan kata "Hari ini saya".
5. Tulis 1 kalimat 'obstacle' (kendala teknis). Jika tidak ada kendala, gunakan kalimat baku: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian."
6. Wajib mengembalikan respon HANYA dalam format JSON murni tanpa markdown triple backticks.

Format JSON yang wajib diikuti:
{
  "activities": [
    { "time_range": "08:30 - 10:00", "title": "...", "description": "..." },
    { "time_range": "10:00 - 12:00", "title": "...", "description": "..." },
    { "time_range": "13:00 - 15:30", "title": "...", "description": "..." },
    { "time_range": "15:30 - 17:00", "title": "...", "description": "..." }
  ],
  "learning": "...",
  "obstacle": "..."
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Hasilkan 1 paket log harian lengkap format JSON sekarang." },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("Groq API error, falling back to static template");
      const fallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";
    
    // Parse JSON
    try {
      const parsed = JSON.parse(rawContent);
      if (parsed.activities && Array.isArray(parsed.activities) && parsed.learning) {
        return NextResponse.json(parsed);
      }
      throw new Error("Invalid structure from AI response");
    } catch {
      const fallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
      return NextResponse.json(fallback);
    }
  } catch (err) {
    console.error("Error generating daily draft:", err);
    const fallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
    return NextResponse.json(fallback);
  }
}
