"use client";

import { useState } from "react";
import { X, Zap, Clock, Plus, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD } from "@/lib/date";

const PRESET_CHIPS = [
  { label: "STANDUP", prefix: "Daily Standup Meeting", icon: "⚡" },
  { label: "DEV", prefix: "Slicing & Feature Development", icon: "💻" },
  { label: "BUGFIX", prefix: "Debugging & Problem Resolution", icon: "🐞" },
  { label: "MEETING", prefix: "Team Sync & Discussion", icon: "🤝" },
  { label: "TESTING", prefix: "Manual Testing & QA Review", icon: "🧪" },
];

export default function SpeedLogModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {/* Floating Speed Log Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 bg-slate-900/90 hover:bg-slate-950 text-white px-3.5 py-2 rounded-2xl shadow-lg shadow-slate-900/25 backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer group"
        title="Catat Cepat Log Harian Tanpa Pindah Rute"
      >
        <div className="w-5 h-5 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
          <Zap className="w-3 h-3 fill-current" />
        </div>
        <span className="pixel-badge text-white bg-slate-800 border-slate-600 group-hover:border-amber-400">
          SPEED.LOG
        </span>
      </button>

      {/* Speed Log Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/80">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/60">
              <div className="flex items-center gap-2">
                <span className="pixel-badge text-amber-800 bg-amber-50 border-amber-300">
                  FAST.ENTRY
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Catat Cepat Aktivitas Hari Ini
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Preset Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Preset 1-Klik:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleApplyPreset(chip)}
                      className="pixel-badge text-slate-700 bg-white/90 border-slate-300 hover:border-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <span>{chip.icon}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> Jam / Waktu Pengerjaan
                </label>
                <input
                  type="text"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="Misal: 14:00 - 15:30"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Aktivitas yang Dikerjakan
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ketik apa yang barusan kamu kerjakan..."
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
                />
              </div>

              {/* Brief Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail singkat hasil atau kendala..."
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-70 mt-1 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
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
