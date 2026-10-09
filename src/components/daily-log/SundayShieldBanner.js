import { Coffee } from "lucide-react";

export default function SundayShieldBanner() {
  return (
    <div className="glass-panel border-sky-200/80 bg-sky-50/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-sky-950 text-xs">
      <div className="flex items-center gap-2.5">
        <Coffee className="w-4 h-4 text-sky-600 flex-shrink-0" />
        <span className="font-semibold text-slate-800">
          Hari Minggu: Libur resmi mingguan. Pengisian jurnal bersifat opsional.
        </span>
      </div>
      <span className="pixel-badge border-sky-300 text-sky-800 bg-sky-100/80">
        [OFF.SUNDAY]
      </span>
    </div>
  );
}
