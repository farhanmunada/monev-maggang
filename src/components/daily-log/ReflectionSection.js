import { BookOpen, Sparkles, AlertCircle } from "lucide-react";

export default function ReflectionSection({
  learning,
  obstacle,
  onChange,
  onGenerateLearning,
  isGeneratingLearning,
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      {/* Learning Reflection Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Refleksi Pembelajaran
            </label>
            <button
              type="button"
              onClick={onGenerateLearning}
              disabled={isGeneratingLearning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 disabled:opacity-50 transition-all cursor-pointer"
              title="Rangkum refleksi dari daftar kegiatan menggunakan AI"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingLearning ? "animate-spin" : ""}`} />
              <span>{isGeneratingLearning ? "Menganalisis..." : "Rangkum AI"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Tuliskan pemahaman konseptual, tool baru, atau insight teknis yang didapat hari ini.
          </p>
          <textarea
            name="learning"
            value={learning}
            onChange={onChange}
            rows={5}
            placeholder="Misal: Mempelajari optimasi query Supabase dengan indexing serta pemisahan relasi kegiatan..."
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none text-xs leading-relaxed"
          />
        </div>
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Target minimal: 80 karakter</span>
          <span
            className={
              learning.length >= 80
                ? "text-emerald-600 font-bold font-mono"
                : "text-slate-500 font-mono"
            }
          >
            {learning.length} karakter
          </span>
        </div>
      </div>

      {/* Obstacles / Blockers Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Kendala & Solusi Solutif
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Hambatan teknis, bug rumit, atau kendala koordinasi kerja yang dihadapi hari ini.
          </p>
          <textarea
            name="obstacle"
            value={obstacle}
            onChange={onChange}
            rows={5}
            placeholder="Tuliskan kendala yang dihadapi (kosongkan jika kegiatan berjalan lancar tanpa blocker)..."
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none text-xs leading-relaxed"
          />
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          Kosongkan jika semua kegiatan berjalan tanpa kendala teknis.
        </div>
      </div>
    </section>
  );
}
