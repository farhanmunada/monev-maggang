export default function ActivityForm({
  isOpen,
  newActivity,
  isSubmittingActivity,
  onChange,
  onSubmit,
  onCancel,
}) {
  if (!isOpen) return null;

  const handleRecentHour = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const endH = `${pad(now.getHours())}:00`;
    const startH = `${pad((now.getHours() - 1 + 24) % 24)}:00`;
    onChange("time_range", `${startH} - ${endH}`);
  };

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
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />

          {/* Quick Time Presets */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[10px] text-slate-400 font-medium py-0.5 mr-0.5">Preset:</span>
            {[
              { label: "08:00 - 12:00", value: "08:00 - 12:00" },
              { label: "13:00 - 17:00", value: "13:00 - 17:00" },
              { label: "09:00 - 17:00", value: "09:00 - 17:00" },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange("time_range", p.value)}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleRecentHour}
              className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded transition-all cursor-pointer"
            >
              1 Jam Terakhir
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Judul Kegiatan (Misal: Implementasi API auth)"
            required
            value={newActivity.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>
      <textarea
        placeholder="Deskripsi kegiatan atau hasil pengerjaan..."
        rows={2}
        value={newActivity.description}
        onChange={(e) => onChange("description", e.target.value)}
        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
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
          className="px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-semibold text-xs disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {isSubmittingActivity ? "Menyimpan..." : "Simpan Kegiatan"}
        </button>
      </div>
    </form>
  );
}
