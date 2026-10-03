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
    <form onSubmit={onSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-xs text-slate-900">Input Kegiatan Baru</h4>
        <span className="text-[11px] text-slate-400">Waktu otomatis saat ini, klik untuk ubah</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Waktu Pelaksanaan
          </label>
          <input
            type="text"
            placeholder="Misal: 14:30 atau 14:00 - 15:30"
            value={newActivity.time_range}
            onChange={(e) => onChange("time_range", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Judul Kegiatan
          </label>
          <input
            type="text"
            placeholder="Misal: Implementasi API auth, meeting evaluasi mingguan"
            required
            value={newActivity.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Deskripsi / Hasil Pengerjaan
        </label>
        <textarea
          placeholder="Rincian kegiatan, output yang dicapai, atau catatan penting..."
          rows={2}
          value={newActivity.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none leading-relaxed"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmittingActivity}
          className="px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-semibold text-xs disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {isSubmittingActivity ? "Menyimpan..." : "Simpan Kegiatan"}
        </button>
      </div>
    </form>
  );
}
