import { Clock, Plus, Pencil, Trash2, Save, Sparkles, X } from "lucide-react";

const QUICK_TEMPLATES = [
  "Implementasi Fitur",
  "Bug Fixing & Debugging",
  "Daily Standup / Meeting",
  "Code Review",
  "Dokumentasi Teknis",
  "Riset & Pembelajaran",
];

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
  onSelectTemplate,
  isAddingActivity,
}) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Daftar Aktivitas ({activities.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasikan setiap rincian pekerjaan atau task yang kamu selesaikan.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAdd}
          className="flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          {isAddingActivity ? (
            <>
              <X className="w-3.5 h-3.5" /> Tutup Form
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Tambah Kegiatan
            </>
          )}
        </button>
      </div>

      {/* Quick Category Templates */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 pb-1">
        <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Cepat:
        </span>
        {QUICK_TEMPLATES.map((tpl) => (
          <button
            key={tpl}
            type="button"
            onClick={() => onSelectTemplate(tpl)}
            className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
          >
            + {tpl}
          </button>
        ))}
      </div>

      {/* Activities Timeline / Cards */}
      {activities.length === 0 ? (
        <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs space-y-2 bg-slate-50/40">
          <p>Belum ada kegiatan yang dicatat hari ini.</p>
          <button
            type="button"
            onClick={onToggleAdd}
            className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer underline text-xs"
          >
            Klik untuk mencatat kegiatan pertamamu
          </button>
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200/70 before:hidden md:before:block">
          {activities.map((act) =>
            editingActivityId === act.id ? (
              <form
                key={act.id}
                onSubmit={onUpdateActivity}
                className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-indigo-200 shadow-xs space-y-3 relative z-10"
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Deskripsi / Hasil Pengerjaan
                  </label>
                  <textarea
                    placeholder="Deskripsi kegiatan..."
                    rows={2}
                    value={editActivityForm.description}
                    onChange={(e) => onEditFormChange("description", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingActivity}
                    className="px-3.5 py-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isUpdatingActivity ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={act.id}
                className="flex flex-col md:flex-row gap-3 p-4 border border-slate-200/90 rounded-2xl hover:border-slate-300 transition-all bg-white relative group shadow-2xs hover:shadow-xs z-10"
              >
                <div className="flex items-center gap-2 md:flex-col md:items-start flex-shrink-0">
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap">
                    {act.time_range || "Sepanjang hari"}
                  </span>
                </div>

                <div className="flex-1 pr-16 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm leading-snug">
                    {act.title}
                  </h4>
                  {act.description && (
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                      {act.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onStartEdit(act)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit kegiatan"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveActivity(act.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus kegiatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
