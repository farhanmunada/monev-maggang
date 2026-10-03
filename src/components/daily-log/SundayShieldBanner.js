import { ShieldCheck } from "lucide-react";

export default function SundayShieldBanner() {
  return (
    <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-4 flex items-start gap-3 text-teal-900 text-xs shadow-2xs">
      <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">Sunday Shield Aktif</p>
        <p className="text-teal-700 mt-0.5 leading-relaxed">
          Hari Minggu adalah hari istirahat resmi. Streak tetap terlindungi hingga hari Senin. Kamu bebas mengisi atau cukup menikmati waktu istirahat.
        </p>
      </div>
    </div>
  );
}
