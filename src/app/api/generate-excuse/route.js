import { NextResponse } from "next/server";

const FALLBACK_EXCUSES = {
  Sakit: [
    "Kondisi kesehatan sedang menurun (demam dan flu berat) sehingga memerlukan istirahat total dan pemeriksaan medis mandiri di rumah.",
    "Mengalami gangguan pencernaan akut yang mengharuskan istirahat serta pemulihan kondisi fisik sesuai anjuran medis.",
    "Kondisi fisik kurang fit disertai gejala migrain dan demam tinggi, beristirahat untuk pemulihan optimal agar dapat kembali bekerja esok hari.",
  ],
  Izin: [
    "Menghadiri agenda akademik wajib di kampus terkait koordinasi bimbingan laporan dan verifikasi administrasi program studi.",
    "Menyelesaikan keperluan administrasi kependudukan dan keluarga mendesak yang tidak dapat diwakilkan pada jam kerja.",
    "Menghadiri kegiatan akademik universitas yang bertepatan dengan jadwal kerja lapangan setelah berkoordinasi dengan pihak pembimbing.",
  ],
};

export async function POST(req) {
  try {
    const { type = "Izin", hint = "" } = await req.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    const list = FALLBACK_EXCUSES[type] || FALLBACK_EXCUSES.Izin;
    const defaultFallback = list[Math.floor(Math.random() * list.length)];

    if (!groqApiKey) {
      return NextResponse.json({ excuse: defaultFallback });
    }

    const systemPrompt = `Anda adalah asisten mahasiswa magang yang bertugas menyusun 1-2 kalimat alasan resmi ketidakhadiran (${type}) yang sopan, formal, meyakinkan, dan profesional untuk diajukan ke pembimbing lapangan / HR kantor.
Aturan:
1. Bahasa Indonesia formal, sopan, dan lugas.
2. Tidak bertele-tele, maksimal 30 kata.
3. Hasilkan HANYA kalimat alasannya saja tanpa tanda kutip, salam pembuka, atau penutup.`;

    const userMessage = hint
      ? `Buat kalimat alasan ${type} formal berdasarkan konteks ini: ${hint}`
      : `Buat kalimat alasan ${type} formal standar yang masuk akal dan profesional.`;

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
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ excuse: defaultFallback });
    }

    const data = await response.json();
    let excuse = data.choices?.[0]?.message?.content?.trim() || defaultFallback;
    excuse = excuse.replace(/^["']|["']$/g, "").trim();

    return NextResponse.json({ excuse });
  } catch (err) {
    console.error("Error generating excuse:", err);
    return NextResponse.json({
      excuse: "Keperluan mendesak yang tidak dapat ditinggalkan setelah berkoordinasi dengan pihak terkait.",
    });
  }
}
