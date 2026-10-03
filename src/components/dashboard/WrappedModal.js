import { Sparkles, Share2, X } from "lucide-react";

export default function WrappedModal({ isOpen, onClose, weeklyWrapped, onCopyWrapped }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white relative shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            Weekly Spotlight
          </span>
          <h2 className="text-xl font-bold mt-2 tracking-tight flex items-center justify-center gap-2">
            <span>Magang Wrapped</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Potret realita perjuangan magangmu minggu ini</p>
        </div>

        <div
          className={`p-4 rounded-xl bg-gradient-to-r ${weeklyWrapped.badgeColor} text-slate-950 font-bold text-center mb-4 shadow-sm`}
        >
          <span className="text-[10px] uppercase tracking-wider block opacity-80">Gelar Mingguan:</span>
          <span className="text-base md:text-lg font-extrabold">{weeklyWrapped.personaTitle}</span>
        </div>

        <p className="text-xs text-slate-300 text-center mb-5 leading-relaxed italic">
          &ldquo;{weeklyWrapped.personaDescription}&rdquo;
        </p>

        <div className="grid grid-cols-3 gap-2 text-center mb-5">
          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
            <span className="text-lg font-bold text-white font-mono">{weeklyWrapped.totalLogs}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Hari Log</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
            <span className="text-lg font-bold text-amber-400 font-mono">
              {weeklyWrapped.totalActivities}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Aktivitas</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {weeklyWrapped.totalTasksDone}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Task Kelar</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onCopyWrapped}
            className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Salin Ringkasan untuk Status WA
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium"
          >
            Tutup Spotlight
          </button>
        </div>
      </div>
    </div>
  );
}
