import { Clock, Plus, Pencil, Trash2, Save } from "lucide-react";

export default function ActivityList({
  activities,
  editingActivityId,
  editActivityForm,
  isUpdatingActivity,
  onStartEdit,
  onCancelEdit,
  onUpdateActivity,
  onEditFormChange,
  onRemoveActivity,
  onToggleAdd,
  isAddingActivity,
}) {
  const handleRecentHour = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const endH = `${pad(now.getHours())}:00`;
    const startH = `${pad((now.getHours() - 1 + 24) % 24)}:00`;
    onEditFormChange("time_range", `${startH} - ${endH}`);
  };

  return (
    <div className="space-y-3 mb-5">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Daftar Aktivitas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catat rincian kegiatan spesifik beserta estimasi waktu.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleAdd}
          className="flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-xl font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {isAddingActivity ? "Tutup Form" : "Tambah Kegiatan"}
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-7 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
          Belum ada kegiatan yang dicatat. Klik &quot;Tambah Kegiatan&quot; untuk mulai mengisi.
        </div>
      ) : (
        activities.map((act) =>
          editingActivityId === act.id ? (
            <form
              key={act.id}
              onSubmit={onUpdateActivity}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-indigo-600" /> Edit Rincian Kegiatan
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder="Waktu (Misal: 09:00 - 11:30)"
                    value={editActivityForm.time_range}
                    onChange={(e) => onEditFormChange("time_range", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />

                  {/* Quick Presets */}
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
                        onClick={() => onEditFormChange("time_range", p.value)}
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
                    placeholder="Judul Kegiatan"
                    required
                    value={editActivityForm.title}
                    onChange={(e) => onEditFormChange("title", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>
              <textarea
                placeholder="Deskripsi kegiatan..."
                rows={2}
                value={editActivityForm.description}
                onChange={(e) => onEditFormChange("description", e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingActivity}
                  className="px-3 py-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isUpdatingActivity ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          ) : (
            <div
              key={act.id}
              className="flex flex-col md:flex-row gap-3 p-3.5 border border-slate-200/90 rounded-xl hover:border-slate-300 transition-all bg-white relative group"
            >
              <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md w-fit h-fit text-xs font-mono font-medium whitespace-nowrap">
                {act.time_range || "Sepanjang hari"}
              </div>
              <div className="flex-1 pr-14">
                <h4 className="font-semibold text-slate-900 text-xs md:text-sm">{act.title}</h4>
                {act.description && (
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{act.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 absolute right-3 top-3">
                <button
                  type="button"
                  onClick={() => onStartEdit(act)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit kegiatan"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveActivity(act.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Hapus kegiatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
