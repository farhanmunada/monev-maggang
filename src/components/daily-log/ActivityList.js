import { Clock, Plus, Pencil, Trash2, Save, Sparkles, X } from "lucide-react";

const QUICK_TEMPLATES = [
  "Implementasi Fitur",
  "Bug Fixing & Debugging",
  "Maintenance & Perawatan Hardware",
  "Pengecekan Hardware & Jaringan",
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="pixel-badge bg-[#8b5cf6] text-white">
            [ACTIVITIES]
          </span>
          <h2 className="text-sm md:text-base font-black uppercase text-black flex items-center gap-2 tracking-tight">
            <Clock className="w-4 h-4 stroke-[2.5]" />
            Log Aktivitas
          </h2>
          <span className="pixel-counter">
            {activities.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleAdd}
          className="brutal-btn bg-[#a3e635] hover:bg-[#84cc16] text-black text-xs px-3.5 py-1.5 rounded-xl font-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
        >
          {isAddingActivity ? (
            <>
              <X className="w-3.5 h-3.5 stroke-[3]" /> [TUTUP]
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> [+ KEGIATAN]
            </>
          )}
        </button>
      </div>

      {/* Quick Category Templates */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-0.5">
        <span className="text-[10px] font-mono font-black text-black mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-black" /> [PRESET]:
        </span>
        {QUICK_TEMPLATES.map((tpl) => (
          <button
            key={tpl}
            type="button"
            onClick={() => onSelectTemplate(tpl)}
            className="pixel-badge bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#a3e635] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-bold"
          >
            + {tpl}
          </button>
        ))}
      </div>

      {/* Activities Timeline / Cards */}
      {activities.length === 0 ? (
        <div className="text-center py-10 text-slate-500 border-2 border-dashed border-black rounded-2xl text-xs space-y-3 bg-[#fbf8f0]">
          <p className="font-mono font-black text-xs text-black">[BELUM ADA KEGIATAN TERCATAT HARI INI]</p>
          <button
            type="button"
            onClick={onToggleAdd}
            className="text-black font-black uppercase tracking-wider text-xs bg-[#a3e635] px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center gap-1 cursor-pointer"
          >
            + Catat Kegiatan Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) =>
            editingActivityId === act.id ? (
              <form
                key={act.id}
                onSubmit={onUpdateActivity}
                className="bg-[#fbf8f0] p-4 md:p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-xs text-black flex items-center gap-1.5 font-mono uppercase">
                    <Pencil className="w-3.5 h-3.5 stroke-[2.5]" /> [EDIT KEGIATAN]
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
                      Waktu
                    </label>
                    <input
                      type="text"
                      placeholder="Misal: 14:30 atau 09:00 - 11:30"
                      value={editActivityForm.time_range}
                      onChange={(e) => onEditFormChange("time_range", e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border-2 border-black bg-white font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
                      Judul Kegiatan
                    </label>
                    <input
                      type="text"
                      placeholder="Judul Kegiatan"
                      required
                      value={editActivityForm.title}
                      onChange={(e) => onEditFormChange("title", e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border-2 border-black bg-white font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1 font-mono">
                    Deskripsi / Deliverable
                  </label>
                  <textarea
                    placeholder="Deskripsi kegiatan..."
                    rows={2}
                    value={editActivityForm.description}
                    onChange={(e) => onEditFormChange("description", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border-2 border-black bg-white font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee] resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="px-3 py-1.5 text-xs text-black border-2 border-black rounded-lg font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingActivity}
                    className="px-4 py-1.5 text-xs bg-[#a3e635] text-black border-2 border-black rounded-lg font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                    {isUpdatingActivity ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={act.id}
                className="flex flex-col md:flex-row gap-3 p-3.5 md:p-4 border-2 border-black rounded-xl hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] transition-all bg-white shadow-[3px_3px_0px_0px_#000] relative group"
              >
                <div className="flex items-center gap-2 md:flex-col md:items-start flex-shrink-0">
                  <span className="pixel-badge bg-[#a3e635] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                    {act.time_range || "ALL.DAY"}
                  </span>
                </div>

                <div className="flex-1 pr-16 min-w-0">
                  <h4 className="font-black text-black text-xs md:text-sm leading-snug">
                    {act.title}
                  </h4>
                  {act.description && (
                    <p className="text-xs font-mono font-bold text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                      {act.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute right-3 top-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onStartEdit(act)}
                    className="p-1 text-black hover:bg-[#a3e635] rounded border border-transparent hover:border-black cursor-pointer transition-colors"
                    title="Edit kegiatan"
                  >
                    <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveActivity(act.id)}
                    className="p-1 text-black hover:bg-[#ff6b6b] rounded border border-transparent hover:border-black cursor-pointer transition-colors"
                    title="Hapus kegiatan"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
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
