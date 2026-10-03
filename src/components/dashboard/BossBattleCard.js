import { Skull, Swords } from "lucide-react";

export default function BossBattleCard({ boss }) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-7 shadow-xs border border-slate-800 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
            {boss.isDefeated ? (
              <Skull className="w-5 h-5 text-emerald-400" />
            ) : (
              <Swords className="w-5 h-5 text-purple-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                Weekly Boss Battle
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Reset Tiap Senin</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              {boss.bossName} <span className="text-xs text-slate-400 font-normal">({boss.subtitle})</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Boss HP:</span>
          <span
            className={`text-sm font-black px-3 py-1 rounded-lg border font-mono ${
              boss.isDefeated
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {boss.currentHp} / {boss.maxHp} HP
          </span>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              boss.isDefeated
                ? "bg-emerald-500"
                : boss.currentHp < 40
                ? "bg-amber-500"
                : "bg-indigo-500"
            }`}
            style={{ width: `${Math.max(4, 100 - boss.progressPercent)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="md:col-span-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-slate-300 italic">
          &ldquo;{boss.bossQuote}&rdquo;
        </div>
        <div className="flex items-center justify-around bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
          <span>
            Log: <strong className="text-slate-200 font-mono">-20 HP</strong>
          </span>
          <span>•</span>
          <span>
            Aktivitas: <strong className="text-slate-200 font-mono">-8 HP</strong>
          </span>
          <span>•</span>
          <span>
            Task: <strong className="text-slate-200 font-mono">-15 HP</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
