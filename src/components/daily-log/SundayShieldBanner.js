import { Coffee } from "lucide-react";

export default function SundayShieldBanner() {
  return (
    <div className="border-2 border-black bg-[#ede9fe] rounded-xl p-3.5 flex items-center justify-between gap-3 text-black text-xs shadow-[3px_3px_0px_#000]">
      <div className="flex items-center gap-2.5">
        <Coffee className="w-4 h-4 stroke-[2.5] flex-shrink-0 text-[#7c3aed]" />
        <span className="font-mono font-bold">
          Hari Minggu: Libur resmi mingguan. Pengisian jurnal bersifat opsional.
        </span>
      </div>
      <span className="pixel-badge bg-[#8b5cf6] text-white">
        [OFF.SUNDAY]
      </span>
    </div>
  );
}
