import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { activities, learning, obstacle } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY tidak ditemukan di environment variables." },
        { status: 500 }
      );
    }

    const systemPrompt = `Anda adalah asisten cerdas yang bertugas menyempurnakan catatan harian magang KHUSUS UNTUK HARI INI SAJA.
Tugas Anda:
1. Ubah catatan singkat yang diberikan menjadi paragraf yang lebih panjang, lengkap, dan profesional HANYA untuk aktivitas hari ini.
2. JANGAN PERNAH menyinggung hari kemarin atau hari esok. Fokus 100% pada apa yang dilakukan hari ini.
3. Gunakan gaya bahasa yang HUMANIS (alami, seperti manusia, tidak terlihat kaku atau seperti robot AI). 
4. SETIAP POIN (Uraian Kegiatan, Pembelajaran, Kendala) HARUS dijabarkan minimal 100 karakter. 
5. Jangan menambahkan informasi palsu yang tidak ada di catatan asli, cukup elaborasi, rapikan bahasanya, dan buat lebih deskriptif.

Keluarkan hasil dalam format JSON berikut:
{
  "expandedActivities": "Uraian kegiatan HARI INI yang sudah dielaborasi (min 100 karakter)...",
  "expandedLearning": "Pembelajaran HARI INI yang sudah dielaborasi (min 100 karakter)...",
  "expandedObstacle": "Kendala HARI INI yang sudah dielaborasi (min 100 karakter, atau tulis 'Tidak ada kendala berarti...' jika aslinya kosong)..."
}`;

    const userMessage = `Tolong elaborasi catatan magang saya HARI INI:
- Kegiatan Harian: ${activities}
- Pembelajaran: ${learning || "Belum ada catatan."}
- Kendala: ${obstacle || "Tidak ada."}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // Model terbaru yang tersedia di Groq
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API Error:", errorData);
      try {
        const parsedError = JSON.parse(errorData);
        return NextResponse.json({ error: parsedError.error.message || "Gagal memproses data dengan Groq API." }, { status: 500 });
      } catch (e) {
        return NextResponse.json({ error: errorData || "Gagal memproses data dengan Groq API." }, { status: 500 });
      }
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-report route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
