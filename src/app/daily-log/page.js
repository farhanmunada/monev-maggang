"use client";

import { useState, useEffect } from "react";
import { 
  Save, Plus, Clock, FileText, CheckCircle2, UserCheck, UserMinus, 
  Activity, AlertCircle, Pencil, Trash2, Sparkles, Flame, ShieldCheck, Coffee,
  BookOpen, Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { calculateStreak } from "@/lib/gamification";

function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DailyLog() {
  const [currentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [isGeneratingLearning, setIsGeneratingLearning] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ count: 0, isSunday: false, message: "" });
  const [logId, setLogId] = useState(null);
  
  const queryDate = getLocalDateString(currentDate);

  const [logData, setLogData] = useState({
    attendance: "Hadir",
    learning: "",
    obstacle: "",
  });

  const [activities, setActivities] = useState([]);

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ time_range: "", title: "", description: "" });

  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editActivityForm, setEditActivityForm] = useState({ time_range: "", title: "", description: "" });
  const [isUpdatingActivity, setIsUpdatingActivity] = useState(false);

  const formattedDate = currentDate.toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: log, error: logError } = await supabase
          .from("daily_logs")
          .select("*")
          .eq("date", queryDate)
          .maybeSingle();

        if (logError) throw logError;

        if (log) {
          setLogId(log.id);
          setLogData({
            attendance: log.attendance || "Hadir",
            learning: log.learning || "",
            obstacle: log.obstacle || "",
          });

          const { data: acts, error: actError } = await supabase
            .from("activities")
            .select("*")
            .eq("daily_log_id", log.id)
            .order("created_at", { ascending: true });

          if (actError) throw actError;
          if (acts) setActivities(acts);
        } else {
          setLogId(null);
          setActivities([]);
        }

        const { data: allDates } = await supabase
          .from("daily_logs")
          .select("date");
        if (allDates) {
          const streak = calculateStreak(allDates);
          setStreakInfo(streak);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [queryDate]);

  const handleLogChange = (e) => {
    const { name, value } = e.target;
    setLogData(prev => ({ ...prev, [name]: value }));
  };

  const ensureDailyLogExists = async () => {
    if (logId) return logId;

    const logPayload = {
      date: queryDate,
      attendance: logData.attendance || "Hadir",
      learning: logData.learning || "",
      obstacle: logData.obstacle || ""
    };

    const { data, error } = await supabase
      .from("daily_logs")
      .upsert([logPayload], { onConflict: "date" })
      .select()
      .single();

    if (error) throw error;
    setLogId(data.id);
    return data.id;
  };

  const addActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return toast.error("Judul kegiatan tidak boleh kosong.");
    
    try {
      setIsSubmittingActivity(true);
      const currentLogId = await ensureDailyLogExists();

      const activityPayload = {
        daily_log_id: currentLogId,
        time_range: newActivity.time_range,
        title: newActivity.title.trim(),
        description: newActivity.description
      };

      const { data: insertedAct, error } = await supabase
        .from("activities")
        .insert([activityPayload])
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [...prev, insertedAct]);
      setNewActivity({ time_range: "", title: "", description: "" });
      setIsAddingActivity(false);
      toast.success("Kegiatan tercatat. Bukti kerja nyata bertambah (+15 EXP).");
    } catch (err) {
      console.error("Gagal menambahkan kegiatan:", err);
      toast.error("Gagal menambahkan kegiatan: " + err.message);
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleStartEdit = (act) => {
    setEditingActivityId(act.id);
    setEditActivityForm({
      time_range: act.time_range || "",
      title: act.title || "",
      description: act.description || ""
    });
    setIsAddingActivity(false);
  };

  const handleCancelEdit = () => {
    setEditingActivityId(null);
    setEditActivityForm({ time_range: "", title: "", description: "" });
  };

  const handleUpdateActivity = async (e) => {
    if (e) e.preventDefault();
    if (!editActivityForm.title.trim()) return toast.error("Judul kegiatan wajib diisi.");

    try {
      setIsUpdatingActivity(true);
      const updatePayload = {
        time_range: editActivityForm.time_range,
        title: editActivityForm.title.trim(),
        description: editActivityForm.description
      };

      const { data, error } = await supabase
        .from("activities")
        .update(updatePayload)
        .eq("id", editingActivityId)
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => prev.map(a => a.id === editingActivityId ? (data || { ...a, ...updatePayload }) : a));
      setEditingActivityId(null);
      setEditActivityForm({ time_range: "", title: "", description: "" });
      toast.success("Kegiatan berhasil diperbarui.");
    } catch (err) {
      console.error("Gagal memperbarui kegiatan:", err);
      toast.error("Gagal memperbarui kegiatan: " + err.message);
    } finally {
      setIsUpdatingActivity(false);
    }
  };

  const removeActivity = (actId) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5">
        <span className="font-semibold text-xs text-white">Hapus kegiatan ini dari catatan?</span>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
          >
            Batal
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase.from("activities").delete().eq("id", actId);
                if (error) throw error;
                setActivities(prev => prev.filter(a => a.id !== actId));
                toast.success("Kegiatan dihapus.");
              } catch (err) {
                console.error("Gagal menghapus:", err);
                toast.error("Gagal menghapus kegiatan: " + err.message);
              }
            }} 
            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Hapus
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleGenerateLearning = async () => {
    if (activities.length === 0) {
      return toast.error("Tambahkan minimal satu kegiatan dulu sebelum minta AI merangkum.");
    }

    try {
      setIsGeneratingLearning(true);
      const res = await fetch("/api/generate-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal generate pembelajaran");
      }

      const generatedLearning = data.learning;
      setLogData(prev => ({ ...prev, learning: generatedLearning }));

      const currentLogId = await ensureDailyLogExists();
      const { error: updateErr } = await supabase
        .from("daily_logs")
        .update({ learning: generatedLearning })
        .eq("id", currentLogId);

      if (updateErr) throw updateErr;

      toast.success("Refleksi pembelajaran dirangkum rapi (+20 EXP).");
    } catch (err) {
      console.error("Gagal generate pembelajaran:", err);
      toast.error("Gagal generate pembelajaran: " + err.message);
    } finally {
      setIsGeneratingLearning(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      const logPayload = {
        date: queryDate,
        attendance: logData.attendance,
        learning: logData.learning,
        obstacle: logData.obstacle
      };

      const { data: savedLog, error: logErr } = await supabase
        .from("daily_logs")
        .upsert([logPayload], { onConflict: "date" })
        .select()
        .single();
      
      if (logErr) throw logErr;

      const currentLogId = savedLog.id;
      setLogId(currentLogId);

      if (isAddingActivity && newActivity.title.trim()) {
        const extraAct = {
          daily_log_id: currentLogId,
          time_range: newActivity.time_range,
          title: newActivity.title.trim(),
          description: newActivity.description
        };
        const { error: extraErr } = await supabase.from("activities").insert([extraAct]);
        if (extraErr) throw extraErr;
        setNewActivity({ time_range: "", title: "", description: "" });
        setIsAddingActivity(false);
      }

      const unsavedActs = activities.filter(act => !act.daily_log_id).map(act => ({
        daily_log_id: currentLogId,
        time_range: act.time_range,
        title: act.title,
        description: act.description
      }));

      if (unsavedActs.length > 0) {
        const { error: actErr } = await supabase
          .from("activities")
          .insert(unsavedActs);
        if (actErr) throw actErr;
      }

      const { data: acts, error: fetchActsErr } = await supabase
        .from("activities")
        .select("*")
        .eq("daily_log_id", currentLogId)
        .order("created_at", { ascending: true });

      if (fetchActsErr) throw fetchActsErr;
      if (acts) setActivities(acts);

      toast.success("Jurnal hari ini tersimpan aman (+50 EXP).");
    } catch (err) {
      console.error("Error saving data:", err);
      toast.error("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">Memuat jurnal...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-7 pb-10">
      
      {/* Header Tanggal & Kehadiran */}
      <div className="bg-slate-950 text-white rounded-2xl p-5 md:p-7 shadow-xs border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {currentDate.getDay() === 0 ? "Hari Istirahat Mingguan" : "Jurnal Harian"}
            </span>
            {streakInfo.count > 0 && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                currentDate.getDay() === 0 
                  ? "bg-teal-500/10 text-teal-300 border-teal-500/20" 
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}>
                {currentDate.getDay() === 0 ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-teal-400" />
                    <span>{streakInfo.count} Hari Streak (Aman)</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>{streakInfo.count} Hari Streak</span>
                  </>
                )}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            {formattedDate}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {currentDate.getDay() === 0 
              ? "Hari Minggu libur resmi. Pengisian catatan bersifat opsional." 
              : "Batas input sampai 23:59 WIB. Tuliskan apa yang kamu kerjakan hari ini."}
          </p>
        </div>

        {/* Status Kehadiran Selector */}
        <div className="w-full md:w-auto mt-2 md:mt-0">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 w-full md:w-auto">
            {["Hadir", "Izin", "Sakit", "Alfa"].map((status) => {
              const isActive = logData.attendance === status;
              return (
                <button
                  key={status}
                  onClick={() => setLogData(prev => ({ ...prev, attendance: status }))}
                  className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? "bg-white text-slate-950 shadow-xs" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Banner Khusus Hari Minggu Libur */}
      {currentDate.getDay() === 0 && (
        <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-4 flex items-start gap-3 text-teal-900 text-xs shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Sunday Shield Aktif</p>
            <p className="text-teal-700 mt-0.5 leading-relaxed">
              Hari Minggu adalah hari istirahat resmi. Streak tetap terlindungi hingga hari Senin. Kamu bebas mengisi atau cukup menikmati waktu istirahat.
            </p>
          </div>
        </div>
      )}

      {/* Daftar Kegiatan */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Daftar Aktivitas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Catat rincian kegiatan spesifik beserta estimasi waktu.</p>
          </div>
          <button 
            onClick={() => {
              setIsAddingActivity(!isAddingActivity);
              setEditingActivityId(null);
            }}
            className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-xl font-semibold text-xs shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Kegiatan
          </button>
        </div>

        {/* List Aktivitas */}
        <div className="space-y-3 mb-5">
          {activities.length === 0 ? (
            <div className="text-center py-7 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
              Belum ada kegiatan yang dicatat. Klik &quot;Tambah Kegiatan&quot; untuk mulai mengisi.
            </div>
          ) : (
            activities.map((act) => (
              editingActivityId === act.id ? (
                /* Form Edit Inline */
                <form 
                  key={act.id} 
                  onSubmit={handleUpdateActivity} 
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5 text-blue-600" /> Edit Rincian Kegiatan
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <input 
                        type="text" 
                        placeholder="Waktu (Misal: 09:00 - 11:30)" 
                        value={editActivityForm.time_range} 
                        onChange={e => setEditActivityForm({...editActivityForm, time_range: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Judul Kegiatan" 
                        required
                        value={editActivityForm.title} 
                        onChange={e => setEditActivityForm({...editActivityForm, title: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                  <textarea 
                    placeholder="Deskripsi kegiatan..." 
                    rows={2}
                    value={editActivityForm.description} 
                    onChange={e => setEditActivityForm({...editActivityForm, description: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdatingActivity}
                      className="px-3 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isUpdatingActivity ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Card Kegiatan */
                <div key={act.id} className="flex flex-col md:flex-row gap-3 p-3.5 border border-slate-200/90 rounded-xl hover:border-slate-300 transition-all bg-white relative group">
                  <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md w-fit h-fit text-xs font-mono font-medium whitespace-nowrap">
                    {act.time_range || "Sepanjang hari"}
                  </div>
                  <div className="flex-1 pr-14">
                    <h4 className="font-semibold text-slate-900 text-xs md:text-sm">{act.title}</h4>
                    {act.description && <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{act.description}</p>}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button 
                      type="button"
                      title="Edit kegiatan"
                      onClick={() => handleStartEdit(act)}
                      className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      title="Hapus kegiatan"
                      onClick={() => removeActivity(act.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            ))
          )}
        </div>

        {/* Form Tambah Aktivitas */}
        {isAddingActivity && (
          <form onSubmit={addActivity} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900">Input Kegiatan Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <input 
                  type="text" 
                  placeholder="Waktu (Misal: 08:30 - 12:00)" 
                  value={newActivity.time_range} 
                  onChange={e => setNewActivity({...newActivity, time_range: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <input 
                  type="text" 
                  placeholder="Judul Kegiatan (Misal: Implementasi API auth)" 
                  required
                  value={newActivity.title} 
                  onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
            <textarea 
              placeholder="Deskripsi kegiatan atau hasil pengerjaan..." 
              rows={2}
              value={newActivity.description} 
              onChange={e => setNewActivity({...newActivity, description: e.target.value})}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsAddingActivity(false)} 
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmittingActivity}
                className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold text-xs disabled:opacity-50 shadow-xs"
              >
                {isSubmittingActivity ? "Menyimpan..." : "Simpan Kegiatan"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Pembelajaran & Kendala */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Refleksi Pembelajaran
              </label>
              <button
                type="button"
                onClick={handleGenerateLearning}
                disabled={isGeneratingLearning}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 disabled:opacity-50 transition-all cursor-pointer"
                title="Generate refleksi pembelajaran dari daftar kegiatan dengan AI"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingLearning ? "animate-spin" : ""}`} />
                {isGeneratingLearning ? "Menyusun..." : "Rangkum AI"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Tuliskan pemahaman atau hal baru yang berhasil dipelajari hari ini.</p>
            <textarea 
              name="learning" 
              value={logData.learning} 
              onChange={handleLogChange}
              rows={5} 
              placeholder="Catat ilmu baru sebelum menguap begitu saja saat ditanya pembimbing..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none text-xs leading-relaxed"
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
            <span>Rekomendasi minimal 100 karakter</span>
            <span className={logData.learning.length >= 100 ? "text-emerald-600 font-semibold font-mono" : "text-slate-500 font-mono"}>
              {logData.learning.length} karakter
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Kendala & Hambatan
            </label>
            <p className="text-xs text-slate-500 mb-3">Ada kendala teknis atau masalah koordinasi dalam tugas hari ini?</p>
            <textarea 
              name="obstacle" 
              value={logData.obstacle} 
              onChange={handleLogChange}
              rows={5} 
              placeholder="Ceritakan tantangan atau blocker yang dihadapi hari ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none text-xs leading-relaxed"
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Kosongkan jika semua pekerjaan berjalan lancar tanpa hambatan.
          </div>
        </div>
      </section>

      {/* Tombol Simpan Akhir */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-xl shadow-xs transition-all active:scale-95 font-semibold text-sm disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Menyimpan ke Database..." : "Simpan Jurnal Hari Ini"}
        </button>
      </div>

    </div>
  );
}
