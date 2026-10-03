import { RefreshCw, Coffee, Flame, Zap, Search, Bot } from "lucide-react";

function MascotAvatarIcon({ name, className = "w-7 h-7 text-amber-600" }) {
  switch (name) {
    case "Coffee":
      return <Coffee className={className} />;
    case "Flame":
      return <Flame className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Search":
      return <Search className={className} />;
    case "Bot":
    default:
      return <Bot className={className} />;
  }
}

export default function MascotCard({ mascot, currentMascotQuote, onCycleQuote }) {
  return (
    <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <h3 className="font-bold text-sm text-slate-900">Si Maggy</h3>
          <span className="text-[11px] text-slate-400 font-medium">Teman Curhat</span>
        </div>
        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
          Realistis
        </span>
      </div>

      <div className="my-auto py-3">
        <div className="flex items-start gap-3.5">
          <button
            type="button"
            onClick={onCycleQuote}
            className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform flex-shrink-0 select-none"
            title="Klik untuk ganti pesan Si Maggy"
          >
            <MascotAvatarIcon name={mascot.avatar} />
          </button>

          <div className="relative bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-800 font-medium leading-relaxed shadow-2xs flex-1">
            <p>&ldquo;{currentMascotQuote}&rdquo;</p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Butuh perspektif lain?</span>
        <button
          type="button"
          onClick={onCycleQuote}
          className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Ganti Pesan
        </button>
      </div>
    </div>
  );
}
