"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD } from "@/lib/date";
import { calculateStreak } from "@/lib/gamification";

import LogHeader from "@/components/daily-log/LogHeader";
import SundayShieldBanner from "@/components/daily-log/SundayShieldBanner";
import ActivityList from "@/components/daily-log/ActivityList";
import ActivityForm from "@/components/daily-log/ActivityForm";
import ReflectionSection from "@/components/daily-log/ReflectionSection";

export default function DailyLog() {
  const [currentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [isGeneratingLearning, setIsGeneratingLearning] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ count: 0, isSunday: false, message: "" });
  const [logId, setLogId] = useState(null);

  const queryDate = formatYMD(currentDate);

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

  const isSunday = currentDate.getDay() === 0;
  const formattedDate = currentDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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

        const { data: allDates } = await supabase.from("daily_logs").select("date");
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
    setLogData((prev) => ({ ...prev, [name]: value }));
  };

  const ensureDailyLogExists = async () => {
    if (logId) return logId;

    const logPayload = {
      date: queryDate,
      attendance: logData.attendance || "Hadir",
      learning: logData.learning || "",
      obstacle: logData.obstacle || "",
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
        description: newActivity.description,
      };

      const { data: insertedAct, error } = await supabase
        .from("activities")
        .insert([activityPayload])
        .select()
        .single();

      if (error) throw error;

      setActivities((prev) => [...prev, insertedAct]);
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
      description: act.description || "",
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
        description: editActivityForm.description,
      };

      const { data, error } = await supabase
        .from("activities")
        .update(updatePayload)
        .eq("id", editingActivityId)
        .select()
        .single();

      if (error) throw error;

      setActivities((prev) =>
        prev.map((a) => (a.id === editingActivityId ? data || { ...a, ...updatePayload } : a))
      );
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
    toast(
      (t) => (
        <div className="flex flex-col gap-2.5">
          <span className="font-semibold text-xs text-white">Hapus kegiatan ini dari catatan?</span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const { error } = await supabase.from("activities").delete().eq("id", actId);
                  if (error) throw error;
                  setActivities((prev) => prev.filter((a) => a.id !== actId));
                  toast.success("Kegiatan dihapus.");
                } catch (err) {
                  console.error("Gagal menghapus:", err);
                  toast.error("Gagal menghapus kegiatan: " + err.message);
                }
              }}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
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
        body: JSON.stringify({ activities }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate pembelajaran");

      const generatedLearning = data.learning;
      setLogData((prev) => ({ ...prev, learning: generatedLearning }));

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
        obstacle: logData.obstacle,
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
          description: newActivity.description,
        };
        const { error: extraErr } = await supabase.from("activities").insert([extraAct]);
        if (extraErr) throw extraErr;
        setNewActivity({ time_range: "", title: "", description: "" });
        setIsAddingActivity(false);
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
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
        Memuat jurnal...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-7 pb-10">
      <LogHeader
        formattedDate={formattedDate}
        attendance={logData.attendance}
        onAttendanceChange={(status) => setLogData((prev) => ({ ...prev, attendance: status }))}
        streakInfo={streakInfo}
        isSunday={isSunday}
      />

      {isSunday && <SundayShieldBanner />}

      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs">
        <ActivityList
          activities={activities}
          editingActivityId={editingActivityId}
          editActivityForm={editActivityForm}
          isUpdatingActivity={isUpdatingActivity}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onUpdateActivity={handleUpdateActivity}
          onEditFormChange={(key, val) => setEditActivityForm((prev) => ({ ...prev, [key]: val }))}
          onRemoveActivity={removeActivity}
          onToggleAdd={() => {
            setIsAddingActivity(!isAddingActivity);
            setEditingActivityId(null);
          }}
          isAddingActivity={isAddingActivity}
        />

        <ActivityForm
          isOpen={isAddingActivity}
          newActivity={newActivity}
          isSubmittingActivity={isSubmittingActivity}
          onChange={(key, val) => setNewActivity((prev) => ({ ...prev, [key]: val }))}
          onSubmit={addActivity}
          onCancel={() => setIsAddingActivity(false)}
        />
      </section>

      <ReflectionSection
        learning={logData.learning}
        obstacle={logData.obstacle}
        onChange={handleLogChange}
        onGenerateLearning={handleGenerateLearning}
        isGeneratingLearning={isGeneratingLearning}
      />

      <div className="flex justify-end pt-2">
        <button
          type="button"
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
