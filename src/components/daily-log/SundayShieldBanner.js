import { Coffee } from "lucide-react";

export default function SundayShieldBanner() {
  return (
    <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 flex items-start gap-3 text-sky-950 text-xs shadow-2xs">
      <Coffee className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-sky-900">Hari Libur Mingguan</p>
        <p className="text-sky-700 mt-0.5 leading-relaxed">
          Hari Minggu adalah jadwal istirahat resmi. Pengisian jurnal kegiatan hari ini bersifat opsional.
        </p>
      </div>
    </div>
  );
}
