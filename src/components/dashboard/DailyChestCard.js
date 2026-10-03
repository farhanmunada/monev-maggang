import { Sparkles, Gift, Package, Lock, Check } from "lucide-react";

export default function DailyChestCard({
  dailyChest,
  isChestReady,
  isOpeningChest,
  isSundayToday,
  onOpenChest,
}) {
  return (
    <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between border border-slate-800">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" /> Peti Harian
          </span>
          <span className="text-[11px] text-slate-400">
            {isSundayToday ? "Bonus Minggu" : "Reset Tiap Hari"}
          </span>
        </div>

        <div className="text-center py-4">
          <div className="relative inline-block mb-3">
            <button
              type="button"
              disabled={!isChestReady || dailyChest.opened}
              onClick={isChestReady ? onOpenChest : undefined}
              className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 border ${
                dailyChest.opened
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : isChestReady
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400 cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-amber-500/10"
                  : "bg-slate-900 border-slate-800 text-slate-600"
              }`}
            >
              {dailyChest.opened ? (
                <Gift className="w-9 h-9 text-emerald-400" />
              ) : isChestReady ? (
                <Package className="w-9 h-9 text-amber-400 animate-pulse" />
              ) : (
                <Lock className="w-8 h-8 text-slate-500" />
              )}
            </button>
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            {dailyChest.opened
              ? `Hadiah Terbuka (+${dailyChest.exp} EXP)`
              : isChestReady
              ? "Peti Siap Dibuka"
              : isSundayToday
              ? "Buka Bonus Santai Minggu"
              : "Peti Terkunci"}
          </h3>

          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {dailyChest.opened
              ? `\"${dailyChest.message}\"`
              : isChestReady
              ? "Buka peti untuk mengklaim bonus EXP dan kutipan motivasi harimu."
              : "Peti otomatis terbuka setelah jurnal hari ini berhasil disimpan."}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        {dailyChest.opened ? (
          <div className="w-full py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Sudah Diklaim (+{dailyChest.exp} EXP)
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenChest}
            disabled={!isChestReady || isOpeningChest}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isChestReady
                ? "bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 cursor-pointer font-bold shadow-xs"
                : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
            }`}
          >
            {isOpeningChest ? (
              <span>Membuka Peti...</span>
            ) : isChestReady ? (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Buka Peti Sekarang
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Masih Terkunci
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
