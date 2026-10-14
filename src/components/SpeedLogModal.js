"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X, Zap, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD } from "@/lib/date";

const PRESET_CHIPS = [
  { label: "STANDUP", prefix: "Daily Standup Meeting", icon: "⚡" },
  { label: "DEV", prefix: "Slicing & Feature Development", icon: "💻" },
  { label: "BUGFIX", prefix: "Debugging & Problem Resolution", icon: "🐞" },
  { label: "MAINT", prefix: "Maintenance & Perawatan Hardware", icon: "🛠️" },
  { label: "HW-CHECK", prefix: "Pengecekan & Diagnosis Hardware", icon: "🖥️" },
  { label: "MEETING", prefix: "Team Sync & Discussion", icon: "🤝" },
  { label: "TESTING", prefix: "Manual Testing & QA Review", icon: "🧪" },
];

export default function SpeedLogModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jangan tampilkan speed log di halaman daily-log (karena editor penuh sudah ada di sana)
  if (pathname === "/daily-log") {
    return null;
  }

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    return `${h}:${m}`;
  };

  const handleOpen = () => {
    setTimeRange(getCurrentTimeSlot());
    setTitle("");
    setDescription("");
    setIsOpen(true);
  };

  const handleApplyPreset = (preset) => {
    setTitle(preset.prefix);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Judul aktivitas wajib diisi.");

    setIsSubmitting(true);
    try {
      const todayStr = formatYMD();

      // 1. Get or create today's daily log
      let { data: log, error: fetchError } = await supabase
        .from("daily_logs")
        .select("id")
        .eq("date", todayStr)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let logId = log?.id;

      if (!logId) {
        const { data: newLog, error: createError } = await supabase
          .from("daily_logs")
          .insert({
            date: todayStr,
            attendance: "Hadir",
            learning: "",
            obstacle: "",
          })
          .select("id")
          .single();

        if (createError) throw createError;
        logId = newLog.id;
      }

      // 2. Insert into activities
      const { error: actError } = await supabase.from("activities").insert({
        daily_log_id: logId,
        time_range: timeRange.trim() || getCurrentTimeSlot(),
        title: title.trim(),
        description: description.trim() || null,
      });

      if (actError) throw actError;

      toast.success("Aktivitas tercatat ke logbook hari ini!");
      setIsOpen(false);
    } catch (err) {
      console.error("Error speed logging:", err);
      toast.error("Gagal mencatat: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Speed Log Button (Neo-Brutalist floating action) */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 bg-[#a3e635] text-black px-3.5 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] border-[2.5px] border-black transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2 cursor-pointer group select-none"
        title="Catat Cepat Log Harian Tanpa Pindah Rute"
      >
        <div className="w-5 h-5 rounded-md bg-black text-[#a3e635] flex items-center justify-center font-bold">
          <Zap className="w-3 h-3 fill-current" />
        </div>
        <span className="font-mono font-black text-xs uppercase tracking-wider">
          SPEED.LOG
        </span>
      </button>

      {/* Speed Log Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-[8px_8px_0px_0px_#000] flex flex-col overflow-hidden border-[3px] border-black animate-brutal-pop">
            {/* Header */}
            <div className="p-4 border-b-2 border-black flex items-center justify-between bg-[#8b5cf6] text-white">
              <div className="flex items-center gap-2">
                <span className="pixel-badge bg-black text-[#a3e635] border border-black shadow-[1.5px_1.5px_0px_#000]">
                  FAST.ENTRY
                </span>
                <h3 className="text-sm font-black uppercase text-white">
                  Catat Cepat Aktivitas Hari Ini
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-black p-1 rounded-lg border-2 border-black transition-colors cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Preset Chips */}
              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1.5 font-mono">
                  Preset 1-Klik:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleApplyPreset(chip)}
                      className="pixel-badge bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#a3e635] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
                    >
                      <span>{chip.icon}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> Jam / Waktu Pengerjaan
                </label>
                <input
                  type="text"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="Misal: 14:00 - 15:30"
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#faf5ff]"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
                  Aktivitas yang Dikerjakan
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ketik apa yang barusan kamu kerjakan..."
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#faf5ff]"
                />
              </div>

              {/* Brief Description */}
              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail singkat hasil atau kendala..."
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#faf5ff]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#a3e635] hover:bg-[#8ee01a] text-black font-black uppercase tracking-wider text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Simpan ke Jurnal Hari Ini</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
