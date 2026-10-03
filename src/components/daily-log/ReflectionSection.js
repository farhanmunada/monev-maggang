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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Refleksi Pembelajaran
            </label>
            <button
              type="button"
              onClick={onGenerateLearning}
              disabled={isGeneratingLearning}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 disabled:opacity-50 transition-all cursor-pointer"
              title="Generate refleksi pembelajaran dari daftar kegiatan dengan AI"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingLearning ? "animate-spin" : ""}`} />
              {isGeneratingLearning ? "Menyusun..." : "Rangkum AI"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Tuliskan pemahaman atau hal baru yang berhasil dipelajari hari ini.
          </p>
          <textarea
            name="learning"
            value={learning}
            onChange={onChange}
            rows={5}
            placeholder="Catat ilmu baru sebelum menguap begitu saja saat ditanya pembimbing..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none text-xs leading-relaxed"
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
          <span>Rekomendasi minimal 100 karakter</span>
          <span
            className={
              learning.length >= 100
                ? "text-emerald-600 font-semibold font-mono"
                : "text-slate-500 font-mono"
            }
          >
            {learning.length} karakter
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Kendala & Hambatan
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Ada kendala teknis atau masalah koordinasi dalam tugas hari ini?
          </p>
          <textarea
            name="obstacle"
            value={obstacle}
            onChange={onChange}
            rows={5}
            placeholder="Ceritakan tantangan atau blocker yang dihadapi hari ini..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none text-xs leading-relaxed"
          />
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Kosongkan jika semua pekerjaan berjalan lancar tanpa hambatan.
        </div>
      </div>
    </section>
  );
}
