import { NextResponse } from "next/server";

function generateDynamicFallback(role = "", topic = "") {
  const subject = topic?.trim() || role?.trim() || "operasional teknis harian";
  return {
    activities: [
      {
        time_range: "08:30 - 10:00",
        title: `Koordinasi & Briefing ${subject.slice(0, 32)}`,
        description: `Mengikuti koordinasi harian, memeriksa daftar prioritas kerja terkait ${subject}, serta menyiapkan perlengkapan dan lingkungan kerja pendukung.`,
      },
      {
        time_range: "10:00 - 12:00",
        title: `Pelaksanaan Teknis ${subject.slice(0, 32)}`,
        description: `Melakukan eksekusi tahapan kerja inti pada ${subject}, menerapkan prosedur teknis standar industri, dan memastikan kualitas pengerjaan optimal.`,
      },
      {
        time_range: "13:00 - 15:30",
        title: `Pemeriksaan & Validasi ${subject.slice(0, 32)}`,
        description: `Menjalankan verifikasi hasil penanganan ${subject}, pengujian fungsionalitas menyeluruh, serta mengatasi kendala teknis minor di lapangan.`,
      },
      {
        time_range: "15:30 - 17:00",
        title: `Dokumentasi Teknis & Pelaporan Progres`,
        description: `Mencatat seluruh detail perubahan dan progres pekerjaan ${subject} ke dalam sistem pelaporan, serta merapikan peralatan kerja sebelum jam pulang.`,
      },
    ],
    learning: `Peningkatan kompetensi praktis dan metodologi kerja dalam penanganan ${subject}, mencakup pemahaman alur kerja standar industri serta ketelitian verifikasi operasional.`,
    obstacle: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian.",
  };
}

export async function POST(req) {
  try {
    const { role = "Software Engineer / IT Developer Magang", topic = "" } = await req.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.warn("GROQ_API_KEY tidak ditemukan, menggunakan fallback dinamis.");
      return NextResponse.json(generateDynamicFallback(role, topic));
    }

    const focusContext = topic?.trim()
      ? `Fokus Utama: "${topic.trim()}" (Role: ${role}). Seluruh 4 aktivitas WAJIB fokus dan relevan dengan "${topic.trim()}".`
      : `Pekerjaan: aktivitas kerja profesional sesuai peran "${role}".`;

    const systemPrompt = `Anda adalah asisten cerdas penyusun logbook harian magang industri berstandar formal dan profesional.
Tugas Anda: membuat 1 paket rancangan logbook harian lengkap untuk mahasiswa magang.

${focusContext}

Aturan Ketat:
1. Buat TEPAT 4 aktivitas kerja berurutan yang mencakup jam kerja penuh:
   - Slot 1: "08:30 - 10:00" (Briefing / koordinasi / cek tiket & persiapan)
   - Slot 2: "10:00 - 12:00" (Eksekusi teknis inti / inspeksi / perbaikan / pengerjaan utama)
   - Slot 3: "13:00 - 15:30" (Tindak lanjut / testing / verifikasi / integrasi)
   - Slot 4: "15:30 - 17:00" (Quality check / review / dokumentasi kerja & laporan)
2. Setiap judul aktivitas maksimal 8 kata, formal, profesional, dan WAJIB MENYEBUTKAN/BERKAITAN ERAT dengan topik pekerjaan (${topic || role}).
3. Setiap deskripsi aktivitas minimal 80 karakter, realistis, lugas, dan menggunakan bahasa Indonesia formal sesuai topik (${topic || role}).
4. Tulis 1 paragraf 'learning' (hasil pembelajaran/kompetensi teknis) minimal 100 karakter yang berkaitan langsung dengan (${topic || role}). AWALI LANGSUNG dengan istilah kompetensi (misal: "Peningkatan kompetensi teknis dalam...", "Pendalaman pemahaman prosedur..."). DILARANG menggunakan kata "Hari ini saya".
5. Tulis 1 kalimat 'obstacle' (kendala teknis). Jika tidak ada kendala, gunakan kalimat baku: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian."
6. Wajib mengembalikan respon HANYA dalam format JSON murni.

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
        model: "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Buatkan 1 paket log harian lengkap format JSON untuk topik: "${topic || role}".` },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Groq API error, falling back to dynamic template:", errText);
      return NextResponse.json(generateDynamicFallback(role, topic));
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";
    
    try {
      const parsed = JSON.parse(rawContent);
      if (parsed.activities && Array.isArray(parsed.activities) && parsed.learning) {
        return NextResponse.json(parsed);
      }
      throw new Error("Invalid structure from AI response");
    } catch {
      return NextResponse.json(generateDynamicFallback(role, topic));
    }
  } catch (err) {
    console.error("Error generating daily draft:", err);
    return NextResponse.json(generateDynamicFallback(role, topic));
  }
}
