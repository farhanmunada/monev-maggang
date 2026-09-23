"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Clock, FileText, CheckCircle2, UserCheck, UserMinus, Activity, AlertCircle, Pencil, Trash2, Sparkles, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { calculateStreak } from "@/lib/gamification";

// Format local date YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DailyLog() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [isGeneratingLearning, setIsGeneratingLearning] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [logId, setLogId] = useState(null);
  
  // Format YYYY-MM-DD untuk query database
  const queryDate = getLocalDateString(currentDate);

  // State Utama Jurnal Harian
  const [logData, setLogData] = useState({
    attendance: "Hadir",
    learning: "",
    obstacle: "",
  });

  // State Daftar Kegiatan (Aktivitas)
  const [activities, setActivities] = useState([]);

  // State Form Kegiatan Baru
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ time_range: "", title: "", description: "" });

  // State Edit Kegiatan
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editActivityForm, setEditActivityForm] = useState({ time_range: "", title: "", description: "" });
  const [isUpdatingActivity, setIsUpdatingActivity] = useState(false);

  const formattedDate = currentDate.toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Fetch data dari Supabase saat load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Cek apakah jurnal hari ini sudah ada
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

          // Fetch activities
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

        // Fetch all dates untuk hitung streak
        const { data: allDates } = await supabase
          .from("daily_logs")
          .select("date");
        if (allDates) {
          const streak = calculateStreak(allDates);
          setStreakCount(streak.count);
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

  // Helper untuk memastikan daily_log ada di database
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
    if (!newActivity.title.trim()) return toast.error("Judul kegiatan wajib diisi!");
    
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
      toast.success("Kegiatan berhasil ditambahkan! (+15 EXP ⚡)");
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
    if (!editActivityForm.title.trim()) return toast.error("Judul kegiatan wajib diisi!");

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
      toast.success("Kegiatan berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal memperbarui kegiatan:", err);
      toast.error("Gagal memperbarui kegiatan: " + err.message);
    } finally {
      setIsUpdatingActivity(false);
    }
  };

  const removeActivity = (actId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-sm">Hapus kegiatan ini?</span>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-300"
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
                toast.success("Kegiatan dihapus");
              } catch (err) {
                console.error("Gagal menghapus di database", err);
                toast.error("Gagal menghapus kegiatan: " + err.message);
              }
            }} 
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
          >
            Hapus
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleGenerateLearning = async () => {
    if (activities.length === 0) {
      return toast.error("Tambahkan kegiatan hari ini terlebih dahulu agar AI dapat menganalisis pembelajaran.");
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

      // Langsung simpan ke database
      const currentLogId = await ensureDailyLogExists();
      const { error: updateErr } = await supabase
        .from("daily_logs")
        .update({ learning: generatedLearning })
        .eq("id", currentLogId);

      if (updateErr) throw updateErr;

      toast.success("Pembelajaran berhasil digenerate & tersimpan ke database! (+20 EXP 🧠)");
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
      
      // 1. Upsert Daily Log
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

      // 2. Jika ada input kegiatan baru yang belum sempat diklik "Tambah ke Daftar", simpan juga
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

      // 3. Simpan aktivitas yang belum punya daily_log_id (jika ada)
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

      // 4. Refresh activities state dari database
      const { data: acts, error: fetchActsErr } = await supabase
        .from("activities")
        .select("*")
        .eq("daily_log_id", currentLogId)
        .order("created_at", { ascending: true });

      if (fetchActsErr) throw fetchActsErr;
      if (acts) setActivities(acts);

      toast.success("Jurnal hari ini berhasil disimpan! (+50 EXP 🔥)");
    } catch (err) {
      console.error("Error saving data:", err);
      toast.error("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center animate-pulse">Memuat data dari database...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Header Tanggal & Kehadiran */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-5 md:p-8 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <CalendarIcon className="w-64 h-64 -mr-10 -mt-10" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-primary-100 font-medium text-sm md:text-base">Jurnal Hari Ini</p>
            {streakCount > 0 && (
              <span className="bg-amber-400/25 text-amber-200 border border-amber-300/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 backdrop-blur-sm shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {streakCount} Hari Streak
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-2 md:mb-3">
            {formattedDate}
          </h1>
          <p className="text-[10px] md:text-sm bg-black/20 inline-block px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
            Sesi aktif hingga 23:59 WIB • +50 EXP jika diisi
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto mt-4 md:mt-0">
          <div className="bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 flex flex-nowrap w-full md:inline-flex md:w-auto">
            {["Hadir", "Izin", "Sakit", "Alfa"].map((status) => {
              const isActive = logData.attendance === status;
              return (
                <button
                  key={status}
                  onClick={() => setLogData(prev => ({ ...prev, attendance: status }))}
                  className={`flex-1 md:flex-none px-2 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? "bg-white text-indigo-700 shadow-md" 
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {status}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Daftar Kegiatan */}
      <section className="bg-card rounded-3xl border border-border p-5 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-5 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
            Daftar Kegiatan
          </h2>
          <button 
            onClick={() => {
              setIsAddingActivity(!isAddingActivity);
              setEditingActivityId(null);
            }}
            className="flex items-center gap-1.5 md:gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 md:px-4 py-1.5 md:py-2 rounded-xl transition-colors font-medium text-xs md:text-sm"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tambah
          </button>
        </div>

        {/* List Aktivitas */}
        <div className="space-y-4 mb-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-secondary border-2 border-dashed border-border rounded-2xl">
              Belum ada kegiatan yang ditambahkan hari ini.
            </div>
          ) : (
            activities.map((act) => (
              editingActivityId === act.id ? (
                /* Form Edit Inline */
                <form 
                  key={act.id} 
                  onSubmit={handleUpdateActivity} 
                  className="bg-primary-50/60 p-5 rounded-2xl border border-primary-200 shadow-sm animate-in fade-in"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-primary-900 flex items-center gap-1.5">
                      <Pencil className="w-4 h-4 text-primary-600" /> Edit Kegiatan
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="md:col-span-1">
                      <input 
                        type="text" 
                        placeholder="Waktu (Misal: 09:00 - 10:00)" 
                        value={editActivityForm.time_range} 
                        onChange={e => setEditActivityForm({...editActivityForm, time_range: e.target.value})}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Judul Kegiatan" 
                        required
                        value={editActivityForm.title} 
                        onChange={e => setEditActivityForm({...editActivityForm, title: e.target.value})}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <textarea 
                    placeholder="Deskripsi kegiatan..." 
                    rows={2}
                    value={editActivityForm.description} 
                    onChange={e => setEditActivityForm({...editActivityForm, description: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      className="px-3.5 py-1.5 text-xs text-secondary hover:bg-gray-200 rounded-xl transition-colors font-medium"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdatingActivity}
                      className="px-4 py-1.5 text-xs bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isUpdatingActivity ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Card Kegiatan Biasa */
                <div key={act.id} className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 border border-border rounded-2xl hover:shadow-md transition-shadow bg-background/50 relative group">
                  <div className="bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg w-fit h-fit text-xs md:text-sm font-bold whitespace-nowrap">
                    {act.time_range || "Sepanjang hari"}
                  </div>
                  <div className="flex-1 pr-16">
                    <h4 className="font-bold text-foreground text-sm md:text-base">{act.title}</h4>
                    {act.description && <p className="text-secondary text-xs md:text-sm mt-1">{act.description}</p>}
                  </div>
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                    <button 
                      type="button"
                      title="Edit kegiatan"
                      onClick={() => handleStartEdit(act)}
                      className="text-gray-400 hover:text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      title="Hapus kegiatan"
                      onClick={() => removeActivity(act.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ))
          )}
        </div>

        {/* Form Tambah Aktivitas */}
        {isAddingActivity && (
          <form onSubmit={addActivity} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-semibold mb-4 text-foreground">Kegiatan Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-1">
                <input 
                  type="text" placeholder="Waktu (Misal: 09:00 - 10:00)" 
                  value={newActivity.time_range} onChange={e => setNewActivity({...newActivity, time_range: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <input 
                  type="text" placeholder="Judul Kegiatan" required
                  value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <textarea 
              placeholder="Deskripsi kegiatan..." rows={2}
              value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddingActivity(false)} className="px-4 py-2 text-secondary hover:bg-gray-200 rounded-xl transition-colors font-medium">Batal</button>
              <button 
                type="submit" 
                disabled={isSubmittingActivity}
                className="px-5 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                {isSubmittingActivity ? "Menyimpan ke Database..." : "Simpan Kegiatan"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Pembelajaran & Kendala */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-card rounded-3xl border border-border p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 md:mb-4 gap-2">
            <label className="flex items-center gap-2 text-base md:text-lg font-bold text-foreground">
              <BookOpenIcon className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
              Pembelajaran
            </label>
            <button
              type="button"
              onClick={handleGenerateLearning}
              disabled={isGeneratingLearning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-primary-600 text-white shadow-sm hover:from-indigo-700 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Generate hasil pembelajaran dari kegiatan hari ini dengan AI"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingLearning ? "animate-spin" : ""}`} />
              {isGeneratingLearning ? "Menyusun & Menyimpan..." : "Generate AI"}
            </button>
          </div>
          <p className="text-xs md:text-sm text-secondary mb-3">Apa insight atau pelajaran baru yang Anda dapatkan hari ini?</p>
          <textarea 
            name="learning" value={logData.learning} onChange={handleLogChange}
            rows={5} placeholder="Insight atau konsep yang dipelajari hari ini..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none text-sm"
          />
          <div className="flex justify-between items-center mt-2 text-[11px] text-secondary">
            <span>Minimal 100 karakter</span>
            <span className={logData.learning.length >= 100 ? "text-green-600 font-medium" : "text-amber-600"}>
              {logData.learning.length} karakter
            </span>
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border p-5 md:p-6 shadow-sm">
          <label className="flex items-center gap-2 text-base md:text-lg font-bold text-foreground mb-2 md:mb-4">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
            Kendala
          </label>
          <p className="text-xs md:text-sm text-secondary mb-3">Apakah ada hambatan dalam menjalankan kegiatan hari ini?</p>
          <textarea 
            name="obstacle" value={logData.obstacle} onChange={handleLogChange}
            rows={5} placeholder="Kendala yang dihadapi adalah..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none text-sm"
          />
        </div>
      </section>

      {/* Tombol Simpan Akhir */}
      <div className="flex justify-end pt-2 md:pt-4 pb-6 md:pb-0">
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-foreground text-background hover:bg-gray-800 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl shadow-xl transition-transform md:hover:-translate-y-1 font-bold text-base md:text-lg disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <Save className="w-5 h-5 md:w-6 md:h-6" />
          {isSaving ? "Menyimpan..." : "Simpan Jurnal Hari Ini"}
        </button>
      </div>

    </div>
  );
}

// Custom Icons
function CalendarIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
  );
}

function BookOpenIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
  );
}
