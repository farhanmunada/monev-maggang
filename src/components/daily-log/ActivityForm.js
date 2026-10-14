import { Clock, Check } from "lucide-react";

export default function ActivityForm({
  isOpen,
  newActivity,
  isSubmittingActivity,
  onChange,
  onSubmit,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-[#fbf8f0] p-4 md:p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-3.5 mt-4 animate-brutal-pop"
    >
      <div className="flex justify-between items-center">
        <h4 className="font-black text-xs text-black flex items-center gap-1.5 font-mono uppercase">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> [INPUT KEGIATAN BARU]
        </h4>
        <span className="pixel-badge bg-[#ffe600] text-black">
          AUTO.TIME
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
            Waktu
          </label>
          <input
            type="text"
            placeholder="Misal: 14:30 atau 14:00 - 15:30"
            value={newActivity.time_range}
            onChange={(e) => onChange("time_range", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border-2 border-black bg-white font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
            Judul Kegiatan
          </label>
          <input
            type="text"
            placeholder="Misal: Implementasi API auth, maintenance hardware lab"
            required
            value={newActivity.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border-2 border-black bg-white font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
          Deskripsi / Deliverable
        </label>
        <textarea
          placeholder="Rincian teknis, deliverable yang dihasilkan, atau link PR/commit..."
          rows={3}
          value={newActivity.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border-2 border-black bg-white font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee] resize-none leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs text-black border-2 border-black rounded-lg font-bold hover:bg-slate-100 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmittingActivity}
          className="px-4 py-1.5 text-xs bg-[#a3e635] text-black border-2 border-black rounded-lg font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-all"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          {isSubmittingActivity ? "Menyimpan..." : "Tambahkan ke Jurnal"}
        </button>
      </div>
    </form>
  );
}
