import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { activities } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY tidak ditemukan di environment variables." },
        { status: 500 }
      );
    }

    if (!activities || !activities.length) {
      return NextResponse.json(
        { error: "Daftar kegiatan kosong. Tambahkan kegiatan terlebih dahulu." },
        { status: 400 }
      );
    }

    // Format list kegiatan menjadi teks deskriptif
    const activitiesText = activities
      .map((act, index) => {
        const time = act.time_range ? `[${act.time_range}] ` : "";
        const desc = act.description ? ` - ${act.description}` : "";
        return `${index + 1}. ${time}${act.title}${desc}`;
      })
      .join("\n");

    const systemPrompt = `Anda adalah asisten cerdas untuk mahasiswa magang yang bertugas merangkum hasil pembelajaran dan insight teknis secara formal, profesional, dan berstandar baku berdasarkan daftar kegiatan harian magang.

Aturan Ketat Penulisan:
1. Gunakan bahasa Indonesia baku, formal, objektif, dan profesional (standar laporan resmi instansi/korporat).
2. DILARANG KERAS menggunakan frasa pembuka personal atau gaya bercerita seperti: 'Hari ini saya...', 'Pada hari ini saya belajar...', 'Hari ini, saya...', 'Saya memahami...', 'Saya mempelajari...'.
3. DILARANG KERAS menggunakan kata hubung kronologis kasual seperti 'kemudian', 'lalu', 'setelah itu', serta singkatan seperti 'dll', 'dsb'.
4. LANGSUNG TO THE POINT menjelaskan kompetensi teknis, penguasaan materi, atau metodologi yang didapatkan. Awali kalimat langsung dengan istilah profesional (misalnya: "Pendalaman pemahaman terkait...", "Peningkatan kompetensi dalam...", "Penguasaan teknik dan implementasi...").
5. Panjang teks pembelajaran HARUS MINIMAL 100 karakter.
6. Hasilkan HANYA teks isi pembelajaran dalam bahasa Indonesia, tanpa pengantar, tanpa penutup, tanpa format markdown tebal (*), dan tanpa tanda kutip.`;

    const userMessage = `Berikut adalah kegiatan magang yang dilakukan:\n${activitiesText}\n\nTuliskan hasil pembelajaran formal secara langsung to the point tanpa kata "Hari ini saya", "kemudian", "lalu", dll:`;

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
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API Error in generate-learning:", errorData);
      try {
        const parsedError = JSON.parse(errorData);
        return NextResponse.json(
          { error: parsedError.error?.message || "Gagal memproses AI dengan Groq." },
          { status: 500 }
        );
      } catch {
        return NextResponse.json(
          { error: errorData || "Gagal memproses AI dengan Groq." },
          { status: 500 }
        );
      }
    }

    const data = await response.json();
    let learningText = data.choices?.[0]?.message?.content?.trim() || "";

    // Bersihkan jika ada tanda kutip pembungkus dan frasa informal
    learningText = learningText
      .replace(/^["']|["']$/g, "")
      .replace(/^(Pada hari ini\s*,\s*saya|Hari ini\s*,\s*saya|Pada hari ini saya|Hari ini saya)\s+/gi, "")
      .replace(/^Saya\s+/gi, "")
      .replace(/\b(kemudian|lalu),\s*/gi, "")
      .replace(/\b(kemudian|lalu)\s+/gi, "")
      .replace(/\bdll\b/gi, "dan sebagainya")
      .replace(/\bdsb\b/gi, "dan seterusnya")
      .trim();

    if (learningText.length > 0) {
      learningText = learningText.charAt(0).toUpperCase() + learningText.slice(1);
    }

    return NextResponse.json({ learning: learningText });
  } catch (error) {
    console.error("Error in generate-learning route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server: " + error.message },
      { status: 500 }
    );
  }
}
