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

    const systemPrompt = `Anda adalah asisten cerdas yang bertugas menyusun narasi laporan absensi dan log harian magang resmi menjadi narasi formal, profesional, dan berstandar baku.

Pedoman Penulisan (SANGAT KETAT):
1. GAYA BAHASA FORMAL & PROFESIONAL:
   - Gunakan Bahasa Indonesia baku yang formal, lugas, dan profesional (standar laporan resmi instansi/korporat).
   - Tulis secara objektif dan substantif tanpa gaya bercerita santai seperti buku harian (diary).

2. LARANGAN KERAS (DILARANG MENGGUNAKAN):
   - DILARANG KERAS menggunakan frasa pembuka personal seperti: "Hari ini saya...", "Pada hari ini saya...", "Hari ini, saya...", "Saya...", atau "Kami...".
   - DILARANG KERAS menggunakan kata hubung kronologis kasual seperti: "kemudian", "lalu", "setelah itu", "selanjutnya", "berikutnya".
   - DILARANG KERAS menggunakan singkatan informal seperti "dll", "dsb", "yg", "dgn".

3. STRUKTUR PENULISAN:
   - Uraian Kegiatan (expandedActivities): Awali langsung dengan kata kerja aktif profesional (misal: "Melaksanakan...", "Melakukan analisis...", "Mengimplementasikan...", "Menyelesaikan...", "Menyusun dokumentasi..."). Jabarkan rincian teknis/pekerjaan secara terstruktur.
   - Pembelajaran (expandedLearning): Awali langsung dengan pemaparan kompetensi/insight (misal: "Pendalaman pemahaman mengenai...", "Peningkatan kompetensi teknis dalam...", "Penguasaan metodologi...").
   - Kendala (expandedObstacle): Paparkan hambatan teknis/operasional secara objektif dan profesional. Apabila tidak ada kendala, wajib gunakan pernyataan formal: "Seluruh rangkaian aktivitas berjalan secara optimal tanpa adanya kendala teknis maupun operasional yang menghambat penyelesaian tugas."

4. PERSYARATAN KARAKTER:
   - SETIAP POIN (expandedActivities, expandedLearning, expandedObstacle) HARUS dijabarkan minimal 100 karakter.
   - Elaborasi catatan yang ada secara mendalam dan realistis tanpa mengarang fakta fiktif di luar konteks.

Keluarkan hasil HANYA dalam format JSON berikut:
{
  "expandedActivities": "Uraian kegiatan formal yang telah dielaborasi (min 100 karakter)...",
  "expandedLearning": "Uraian hasil pembelajaran dan kompetensi formal (min 100 karakter)...",
  "expandedObstacle": "Uraian kendala formal atau pernyataan tidak ada kendala (min 100 karakter)..."
}`;

    const userMessage = `Susun laporan absensi formal berdasarkan catatan berikut:
- Kegiatan Harian: ${activities}
- Pembelajaran: ${learning || "Belum ada catatan."}
- Kendala: ${obstacle || "Tidak ada."}

PENTING: Gunakan bahasa baku dan formal. JANGAN gunakan "Hari ini saya", "kemudian", "lalu", dan sejenisnya. Awali kalimat langsung dengan kata kerja aktif formal.`;

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
        temperature: 0.4,
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

    // Fungsi pembersih tambahan untuk memastikan tidak ada kata kasual/informal yang lolos
    const sanitizeFormal = (text) => {
      if (!text) return "";
      let cleaned = text
        .replace(/^(Pada hari ini\s*,\s*saya|Hari ini\s*,\s*saya|Pada hari ini saya|Hari ini saya)\s+/gi, "")
        .replace(/^Saya\s+/gi, "")
        .replace(/\b(kemudian|lalu),\s*/gi, "")
        .replace(/\b(kemudian|lalu)\s+/gi, "")
        .replace(/\bdll\b/gi, "dan sebagainya")
        .replace(/\bdsb\b/gi, "dan seterusnya")
        .trim();

      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      return cleaned;
    };

    return NextResponse.json({
      expandedActivities: sanitizeFormal(result.expandedActivities),
      expandedLearning: sanitizeFormal(result.expandedLearning),
      expandedObstacle: sanitizeFormal(result.expandedObstacle)
    });
  } catch (error) {
    console.error("Error in generate-report route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
