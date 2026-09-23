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

    const systemPrompt = `Anda adalah asisten cerdas untuk mahasiswa magang yang bertugas merangkum hasil pembelajaran/insight teknis dan profesional berdasarkan daftar kegiatan harian magang.

Aturan Ketat Penulisan:
1. Buat teks pembelajaran yang HUMANIS (alami, profesional, reflektif, seperti ditulis oleh manusia, tidak kaku atau terdengar seperti template AI).
2. DILARANG KERAS menggunakan kata pembuka klise seperti 'Hari ini saya...', 'Pada hari ini saya belajar...', 'Hari ini, saya...', 'Hari ini saya memahami...', atau variasi semacamnya.
3. LANGSUNG TO THE POINT menjelaskan apa esensi, konsep baru, insight teknis, atau keahlian yang didapatkan dari kegiatan tersebut.
4. Panjang teks pembelajaran HARUS MINIMAL 100 karakter.
5. Hasilkan HANYA teks isi pembelajaran dalam bahasa Indonesia, tanpa pengantar, tanpa penutup, tanpa format markdown tebal (*), dan tanpa tanda kutip.`;

    const userMessage = `Berikut adalah kegiatan magang yang dilakukan:\n${activitiesText}\n\nTuliskan hasil pembelajaran langsung to the point:`;

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
        temperature: 0.7,
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

    // Bersihkan jika ada tanda kutip pembungkus
    learningText = learningText.replace(/^["']|["']$/g, "").trim();

    return NextResponse.json({ learning: learningText });
  } catch (error) {
    console.error("Error in generate-learning route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server: " + error.message },
      { status: 500 }
    );
  }
}
