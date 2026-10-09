import { BookOpen, Sparkles, AlertCircle } from "lucide-react";

export default function ReflectionSection({
  learning,
  obstacle,
  onChange,
  onGenerateLearning,
  isGeneratingLearning,
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {/* Learning Reflection Card */}
      <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="pixel-badge border-indigo-200 text-indigo-700 bg-indigo-50/80">
                [REFLEKSI]
              </span>
              <label className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-900 font-mono">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 inline" />
                PEMBELAJARAN
              </label>
            </div>
            <button
              type="button"
              onClick={onGenerateLearning}
              disabled={isGeneratingLearning}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-indigo-50/80 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 disabled:opacity-50 transition-all cursor-pointer font-mono"
              title="Rangkum refleksi dari daftar kegiatan menggunakan AI"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingLearning ? "animate-spin" : ""}`} />
              <span>{isGeneratingLearning ? "Menganalisis..." : "[AI.SUMMARIZE]"}</span>
            </button>
          </div>
          <textarea
            name="learning"
            value={learning}
            onChange={onChange}
            rows={5}
            placeholder="Insight teknis, konsep arsitektur, atau pemahaman baru hari ini..."
            className="w-full px-3.5 py-2.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none text-xs leading-relaxed"
          />
        </div>
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100/70 text-[10px] text-slate-400 font-mono">
          <span>MIN: 80 KARAKTER</span>
          <span
            className={`pixel-counter ${
              learning.length >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-300" : ""
            }`}
          >
            {learning.length} CHAR
          </span>
        </div>
      </div>

      {/* Obstacles / Blockers Card */}
      <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="pixel-badge border-amber-300 text-amber-800 bg-amber-50/80">
                [KENDALA]
              </span>
              <label className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-900 font-mono">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 inline" />
                BLOCKER / SOLUSI
              </label>
            </div>
          </div>
          <textarea
            name="obstacle"
            value={obstacle}
            onChange={onChange}
            rows={5}
            placeholder="Kendala teknis / bug yang dihadapi (kosongkan bila lancar)..."
            className="w-full px-3.5 py-2.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none text-xs leading-relaxed"
          />
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100/70 text-[10px] text-slate-400 font-mono">
          [OPSIONAL: KOSONGKAN JIKA TANPA BLOCKER]
        </div>
      </div>
    </section>
  );
}
