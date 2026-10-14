import { NextResponse } from "next/server";

function generateDynamicFallback(role = "", topic = "", isSaturday = false) {
  const subject = topic?.trim() || role?.trim() || "operasional teknis harian";

  if (isSaturday) {
    return {
      activities: [
        {
          time_range: "07:00 - 08:30",
          title: `Koordinasi Pagi & Briefing ${subject.slice(0, 32)}`,
          description: `Mengikuti koordinasi pagi jam 07:00, memeriksa daftar prioritas kerja shift Sabtu terkait ${subject}, serta menyiapkan peralatan kerja pendukung.`,
        },
        {
          time_range: "08:30 - 10:15",
          title: `Pelaksanaan Teknis Utama ${subject.slice(0, 32)}`,
          description: `Melakukan eksekusi tahapan kerja inti pada ${subject}, menerapkan prosedur teknis standar industri, dan memastikan kualitas pengerjaan berjalan optimal.`,
        },
        {
          time_range: "10:15 - 12:00",
          title: `Verifikasi Hasil & Dokumentasi Checkout`,
          description: `Menjalankan pengujian fungsionalitas dan verifikasi hasil kerja ${subject}, merapikan inventaris atau berkas, serta menyusun laporan ringkas sebelum jam pulang 12:00 WIB.`,
        },
      ],
      learning: `Peningkatan kompetensi praktis dan efisiensi kerja dalam penanganan ${subject} pada jam kerja efektif akhir pekan, mencakup ketelitian verifikasi operasional.`,
      obstacle: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian.",
    };
  }

  return {
    activities: [
      {
        time_range: "07:00 - 08:30",
        title: `Koordinasi Pagi & Briefing ${subject.slice(0, 32)}`,
        description: `Mengikuti briefing harian tepat waktu pukul 07:00, memeriksa tiket prioritas terkait ${subject}, serta menyiapkan perlengkapan dan lingkungan kerja pendukung.`,
      },
      {
        time_range: "08:30 - 10:30",
        title: `Pelaksanaan Teknis Inti ${subject.slice(0, 32)}`,
        description: `Melakukan eksekusi tahapan kerja inti pada ${subject}, menerapkan prosedur teknis standar industri, dan memastikan target pengerjaan tercapai.`,
      },
      {
        time_range: "10:30 - 12:30",
        title: `Pemeriksaan Lanjutan & Validasi ${subject.slice(0, 32)}`,
        description: `Menjalankan verifikasi hasil penanganan ${subject}, pengujian fungsional menyeluruh, serta mengatasi kendala teknis minor di lapangan.`,
      },
      {
        time_range: "12:30 - 14:00",
        title: `Dokumentasi Teknis & Pelaporan Progres`,
        description: `Mencatat seluruh detail perubahan dan progres pekerjaan ${subject} ke dalam sistem pelaporan, serta merapikan peralatan kerja sebelum jam pulang pukul 14:00 WIB.`,
      },
    ],
    learning: `Peningkatan kompetensi praktis dan metodologi kerja dalam penanganan ${subject}, mencakup pemahaman alur kerja standar industri serta ketelitian verifikasi operasional.`,
    obstacle: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian.",
  };
}

export async function POST(req) {
  try {
    const { role = "IT Specialist / Hardware & Network Support", topic = "", date = "" } = await req.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    let isSaturday = false;
    if (date) {
      const [y, m, d] = date.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      isSaturday = dt.getDay() === 6;
    } else {
      isSaturday = new Date().getDay() === 6;
    }

    if (!groqApiKey) {
      console.warn("GROQ_API_KEY tidak ditemukan, menggunakan fallback dinamis.");
      return NextResponse.json(generateDynamicFallback(role, topic, isSaturday));
    }

    const focusContext = topic?.trim()
      ? `Fokus Utama: "${topic.trim()}" (Role: ${role}). Seluruh aktivitas WAJIB fokus dan relevan dengan "${topic.trim()}".`
      : `Pekerjaan: aktivitas kerja profesional sesuai peran "${role}".`;

    const workingHoursInstruction = isSaturday
      ? `Jadwal Kerja Hari Sabtu (Setengah Hari: 07:00 - 12:00 WIB):
Buat TEPAT 3 aktivitas berurutan yang mencakup jam kerja 07:00 sampai 12:00:
- Slot 1: "07:00 - 08:30" (Briefing pagi / inspeksi / cek tiket tugas Sabtu)
- Slot 2: "08:30 - 10:15" (Eksekusi teknis inti / penanganan pekerjaan utama)
- Slot 3: "10:15 - 12:00" (Quality check / dokumentasi kerja / persiapan checkout 12:00)`
      : `Jadwal Kerja Hari Kerja (Senin - Jumat: 07:00 - 14:00 WIB):
Buat TEPAT 4 aktivitas berurutan yang mencakup jam kerja penuh 07:00 sampai 14:00:
- Slot 1: "07:00 - 08:30" (Briefing pagi 07:00 / koordinasi tim / cek tiket & persiapan)
- Slot 2: "08:30 - 10:30" (Eksekusi teknis inti / inspeksi / pengerjaan tugas utama)
- Slot 3: "10:30 - 12:30" (Tindak lanjut / testing / verifikasi & penanganan lanjutan)
- Slot 4: "12:30 - 14:00" (Quality check / dokumentasi kerja / pelaporan sebelum checkout 14:00)`;

    const exampleFormat = isSaturday
      ? `{\n  "activities": [\n    { "time_range": "07:00 - 08:30", "title": "...", "description": "..." },\n    { "time_range": "08:30 - 10:15", "title": "...", "description": "..." },\n    { "time_range": "10:15 - 12:00", "title": "...", "description": "..." }\n  ],\n  "learning": "...",\n  "obstacle": "..."\n}`
      : `{\n  "activities": [\n    { "time_range": "07:00 - 08:30", "title": "...", "description": "..." },\n    { "time_range": "08:30 - 10:30", "title": "...", "description": "..." },\n    { "time_range": "10:30 - 12:30", "title": "...", "description": "..." },\n    { "time_range": "12:30 - 14:00", "title": "...", "description": "..." }\n  ],\n  "learning": "...",\n  "obstacle": "..."\n}`;

    const systemPrompt = `Anda adalah asisten cerdas penyusun logbook dan report aktivitas kerja harian profesional industri berstandar formal.
Tugas Anda: membuat 1 paket rancangan logbook kerja harian lengkap untuk staf/karyawan profesional.

${focusContext}

${workingHoursInstruction}

Aturan Ketat:
1. Pastikan time_range PERSIS mengikuti rentang jam di atas (${isSaturday ? "07:00 - 12:00" : "07:00 - 14:00"}).
2. Setiap judul aktivitas maksimal 8 kata, formal, profesional, dan WAJIB MENYEBUTKAN/BERKAITAN ERAT dengan topik pekerjaan (${topic || role}).
3. Setiap deskripsi aktivitas minimal 80 karakter, realistis, lugas, dan menggunakan bahasa Indonesia formal sesuai topik (${topic || role}).
4. Tulis 1 paragraf 'learning' (hasil pembelajaran/kompetensi teknis) minimal 100 karakter yang berkaitan langsung dengan (${topic || role}). AWALI LANGSUNG dengan istilah kompetensi (misal: "Peningkatan kompetensi teknis dalam...", "Pendalaman pemahaman prosedur..."). DILARANG menggunakan kata "Hari ini saya".
5. Tulis 1 kalimat 'obstacle' (kendala teknis). Jika tidak ada kendala, gunakan kalimat baku: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa kendala teknis maupun operasional yang menghambat penyelesaian tugas harian."
6. Wajib mengembalikan respon HANYA dalam format JSON murni.

Format JSON yang wajib diikuti:
${exampleFormat}`;

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
          { role: "user", content: `Buatkan 1 paket log harian lengkap format JSON untuk topik: "${topic || role}". Jam kerja: ${isSaturday ? "07:00 - 12:00 (Sabtu)" : "07:00 - 14:00"}.` },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Groq API error, falling back to dynamic template:", errText);
      return NextResponse.json(generateDynamicFallback(role, topic, isSaturday));
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
      return NextResponse.json(generateDynamicFallback(role, topic, isSaturday));
    }
  } catch (err) {
    console.error("Error generating daily draft:", err);
    return NextResponse.json(generateDynamicFallback(role, topic, false));
  }
}
