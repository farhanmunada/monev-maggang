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
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Waktu Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: 14:30 atau 09:00 - 11:30"
                    value={editActivityForm.time_range}
                    onChange={(e) => onEditFormChange("time_range", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Judul Kegiatan
                  </label>
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
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  placeholder="Deskripsi kegiatan..."
                  rows={2}
                  value={editActivityForm.description}
                  onChange={(e) => onEditFormChange("description", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
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
