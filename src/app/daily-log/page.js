"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Save, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD, formatIndonesianDate } from "@/lib/date";

import LogHeader from "@/components/daily-log/LogHeader";
import SundayShieldBanner from "@/components/daily-log/SundayShieldBanner";
import ActivityList from "@/components/daily-log/ActivityList";
import ActivityForm from "@/components/daily-log/ActivityForm";
import ReflectionSection from "@/components/daily-log/ReflectionSection";

function DailyLogContent() {
  const searchParams = useSearchParams();
  const initialDate = searchParams?.get("date") || formatYMD();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [isGeneratingLearning, setIsGeneratingLearning] = useState(false);
  const [logId, setLogId] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

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

  // Date utilities
  const shiftDate = (dateStr, days) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return formatYMD(date);
  };

  const handlePrevDay = () => setSelectedDate((prev) => shiftDate(prev, -1));
  const handleNextDay = () => setSelectedDate((prev) => shiftDate(prev, 1));
  const handleToday = () => setSelectedDate(formatYMD());

  const [yearNum, monthNum, dayNum] = selectedDate.split("-").map(Number);
  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  const isSunday = dateObj.getDay() === 0;
  const isToday = selectedDate === formatYMD();
  const formattedDate = formatIndonesianDate(selectedDate);

  const getCurrentTimeStr = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  // Fetch log & activities for selectedDate
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: log, error: logError } = await supabase
          .from("daily_logs")
          .select("*")
          .eq("date", selectedDate)
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
          setActivities(acts || []);
        } else {
          setLogId(null);
          setLogData({
            attendance: "Hadir",
            learning: "",
            obstacle: "",
          });
          setActivities([]);
        }

        setIsAddingActivity(false);
        setEditingActivityId(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Gagal memuat catatan jurnal.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleLogChange = (e) => {
    const { name, value } = e.target;
    setLogData((prev) => ({ ...prev, [name]: value }));
  };

  const ensureDailyLogExists = async () => {
    if (logId) return logId;

    const logPayload = {
      date: selectedDate,
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
        time_range: newActivity.time_range || getCurrentTimeStr(),
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
      setNewActivity({ time_range: getCurrentTimeStr(), title: "", description: "" });
      setIsAddingActivity(false);
      toast.success("Kegiatan berhasil dicatat.");
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
          <span className="font-semibold text-xs text-slate-900">Hapus kegiatan ini dari catatan?</span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200 cursor-pointer"
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

  const handleSelectTemplate = (tpl) => {
    setNewActivity({
      time_range: getCurrentTimeStr(),
      title: tpl,
      description: "",
    });
    setIsAddingActivity(true);
    setEditingActivityId(null);
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
      toast.success("Refleksi pembelajaran berhasil dirangkum AI.");
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
        date: selectedDate,
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
          time_range: newActivity.time_range || getCurrentTimeStr(),
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

      const now = new Date();
      setLastSavedAt(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      toast.success("Jurnal tersimpan ke database.");
    } catch (err) {
      console.error("Error saving data:", err);
      toast.error("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span>Memuat jurnal {formattedDate}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-7 pb-12">
      {/* Header & Date Navigation */}
      <LogHeader
        selectedDate={selectedDate}
        formattedDate={formattedDate}
        attendance={logData.attendance}
        onAttendanceChange={(status) => setLogData((prev) => ({ ...prev, attendance: status }))}
        isSunday={isSunday}
        isToday={isToday}
        hasExistingLog={!!logId}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        onDateChange={(newDate) => setSelectedDate(newDate)}
      />

      {isSunday && <SundayShieldBanner />}

      {/* Activities Timeline & Form */}
      <section className="glass-panel rounded-3xl p-5 md:p-6">
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
          onSelectTemplate={handleSelectTemplate}
          onToggleAdd={() => {
            const nextState = !isAddingActivity;
            setIsAddingActivity(nextState);
            setEditingActivityId(null);
            if (nextState) {
              setNewActivity({
                time_range: getCurrentTimeStr(),
                title: "",
                description: "",
              });
            }
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

      {/* Reflections & Obstacles */}
      <ReflectionSection
        learning={logData.learning}
        obstacle={logData.obstacle}
        onChange={handleLogChange}
        onGenerateLearning={handleGenerateLearning}
        isGeneratingLearning={isGeneratingLearning}
      />

      {/* Floating / Sticky Save Bar */}
      <div className="sticky bottom-6 z-20 flex items-center justify-between glass-panel p-3.5 md:p-4 rounded-2xl shadow-lg">
        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
          {lastSavedAt ? (
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold font-mono">
              <Check className="w-4 h-4" /> Tersimpan hari ini pukul {lastSavedAt} WIB
            </span>
          ) : (
            <span>Pastikan klik simpan setelah mencatat kegiatan atau refleksi.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 font-semibold text-xs disabled:opacity-60 cursor-pointer ml-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan ke Database...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Jurnal ({selectedDate})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DailyLogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
          Memuat jurnal...
        </div>
      }
    >
      <DailyLogContent />
    </Suspense>
  );
}
