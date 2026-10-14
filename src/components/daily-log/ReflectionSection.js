import { BookOpen, Sparkles, AlertCircle } from "lucide-react";

export default function ReflectionSection({
  learning,
  obstacle,
  onChange,
  onGenerateLearning,
  isGeneratingLearning,
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Learning Reflection Card */}
      <div className="brutal-card bg-white p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="pixel-badge bg-[#8b5cf6] text-white">
                [REFLEKSI]
              </span>
              <label className="flex items-center gap-1.5 text-xs md:text-sm font-black uppercase text-black font-mono">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                PEMBELAJARAN
              </label>
            </div>
            <button
              type="button"
              onClick={onGenerateLearning}
              disabled={isGeneratingLearning}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all cursor-pointer font-mono uppercase"
              title="Rangkum refleksi dari daftar kegiatan menggunakan AI"
            >
              <Sparkles className={`w-3.5 h-3.5 stroke-[2.5] ${isGeneratingLearning ? "animate-spin" : ""}`} />
              <span>{isGeneratingLearning ? "Menganalisis..." : "[AI.SUMMARIZE]"}</span>
            </button>
          </div>
          <textarea
            name="learning"
            value={learning}
            onChange={onChange}
            rows={5}
            placeholder="Insight teknis, konsep arsitektur, atau pemahaman baru hari ini..."
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#faf5ff] resize-none text-xs font-bold leading-relaxed"
          />
        </div>
        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-black text-[10px] text-slate-700 font-mono font-bold">
          <span>MIN: 80 KARAKTER</span>
          <span
            className={`pixel-counter ${
              learning.length >= 80 ? "bg-[#a3e635] text-black" : "bg-white text-black"
            }`}
          >
            {learning.length} CHAR
          </span>
        </div>
      </div>

      {/* Obstacles / Blockers Card */}
      <div className="brutal-card bg-white p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="pixel-badge bg-[#8b5cf6] text-white">
                [KENDALA]
              </span>
              <label className="flex items-center gap-1.5 text-xs md:text-sm font-black uppercase text-black font-mono">
                <AlertCircle className="w-4 h-4 stroke-[2.5]" />
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
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#faf5ff] resize-none text-xs font-bold leading-relaxed"
          />
        </div>
        <div className="mt-3 pt-2.5 border-t border-black text-[10px] text-slate-700 font-mono font-black">
          [OPSIONAL: KOSONGKAN JIKA TANPA BLOCKER]
        </div>
      </div>
    </section>
  );
}
