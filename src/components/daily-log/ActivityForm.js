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
      <h4 className="font-bold text-xs text-slate-900">Input Kegiatan Baru</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Waktu (Misal: 08:30 - 12:00)"
            value={newActivity.time_range}
            onChange={(e) => onChange("time_range", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Judul Kegiatan (Misal: Implementasi API auth)"
            required
            value={newActivity.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>
      <textarea
        placeholder="Deskripsi kegiatan atau hasil pengerjaan..."
        rows={2}
        value={newActivity.description}
        onChange={(e) => onChange("description", e.target.value)}
        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
      />
      <div className="flex justify-end gap-2">
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
          className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold text-xs disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {isSubmittingActivity ? "Menyimpan..." : "Simpan Kegiatan"}
        </button>
      </div>
    </form>
  );
}
