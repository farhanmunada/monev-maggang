"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Save, Check, Loader2, Sparkles, Wand2, X, AlertCircle, Plus } from "lucide-react";
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

  // Pabrik Log AI States
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [isApplyingDraft, setIsApplyingDraft] = useState(false);
  const [draftRole, setDraftRole] = useState("Software Engineer / IT Developer Magang");
  const [draftTopic, setDraftTopic] = useState("");
  const [draftPreview, setDraftPreview] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("monev_user_role");
      if (savedRole) setDraftRole(savedRole);
    }
  }, []);

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

  const handleSwitchToHadir = async () => {
    try {
      setIsSaving(true);
      const logPayload = {
        date: selectedDate,
        attendance: "Hadir",
        learning: logData.learning,
        obstacle: "",
      };

      const { data: savedLog, error: logErr } = await supabase
        .from("daily_logs")
        .upsert([logPayload], { onConflict: "date" })
        .select()
        .single();

      if (logErr) throw logErr;

      setLogId(savedLog.id);
      setLogData((prev) => ({ ...prev, attendance: "Hadir", obstacle: "" }));
      toast.success("Status presensi diubah menjadi Hadir. Silakan isi kegiatan harian.");
    } catch (err) {
      console.error("Gagal mengubah status:", err);
      toast.error("Gagal mengubah status: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDraft = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsDraftingAI(true);
      const res = await fetch("/api/generate-daily-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: draftRole, topic: draftTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate draft AI");

      if (typeof window !== "undefined") {
        localStorage.setItem("monev_user_role", draftRole);
      }

      const acts = data.activities || [];
      setDraftPreview({
        activities: acts,
        learning: data.learning || "",
        obstacle: data.obstacle || "",
        selectedIndices: acts.map((_, i) => i),
        applyLearning: !logData.learning.trim(),
        applyObstacle: !logData.obstacle.trim(),
      });
      toast.success("Draft AI selesai dibuat! Silakan tinjau sebelum ditambahkan.");
    } catch (err) {
      console.error("Gagal generate draft:", err);
      toast.error("Gagal generate draft: " + err.message);
    } finally {
      setIsDraftingAI(false);
    }
  };

  const handleApplyDraft = async () => {
    if (!draftPreview) return;
    try {
      setIsApplyingDraft(true);
      const currentLogId = await ensureDailyLogExists();

      // Filter aktivitas yang dicentang user
      const chosenActs = draftPreview.activities.filter((_, idx) =>
        draftPreview.selectedIndices.includes(idx)
      );

      // Simpan aktivitas baru (APPEND KE DAFTAR TANPA HAPUS AKTIVITAS SEBELUMNYA)
      let newlyInserted = [];
      if (chosenActs.length > 0) {
        const payload = chosenActs.map((act) => ({
          daily_log_id: currentLogId,
          time_range: act.time_range,
          title: act.title,
          description: act.description,
        }));

        const { data: inserted, error: actErr } = await supabase
          .from("activities")
          .insert(payload)
          .select();

        if (actErr) throw actErr;
        newlyInserted = inserted || [];
        setActivities((prev) => [...prev, ...newlyInserted]);
      }

      // Update refleksi dan kendala hanya jika dicentang oleh user
      const updates = {};
      if (draftPreview.applyLearning && draftPreview.learning) {
        updates.learning = draftPreview.learning;
      }
      if (draftPreview.applyObstacle && draftPreview.obstacle) {
        updates.obstacle = draftPreview.obstacle;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase
          .from("daily_logs")
          .update(updates)
          .eq("id", currentLogId);

        if (updateErr) throw updateErr;

        setLogData((prev) => ({
          ...prev,
          ...updates,
        }));
      }

      setIsDraftModalOpen(false);
      setDraftPreview(null);
      setLastSavedAt(getCurrentTimeStr());
      toast.success(`⚡ ${newlyInserted.length} Kegiatan draft berhasil ditambahkan ke jurnal!`);
    } catch (err) {
      console.error("Gagal menerapkan draft:", err);
      toast.error("Gagal menerapkan draft: " + err.message);
    } finally {
      setIsApplyingDraft(false);
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
    <div className="space-y-6 md:space-y-7 pb-28 md:pb-16">
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

      {/* Notice jika berstatus Izin / Sakit */}
      {(logData.attendance === "Izin" || logData.attendance === "Sakit") && (
        <div className="brutal-card bg-white p-4 md:p-5 border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-brutal-pop">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shrink-0 ${
              logData.attendance === "Izin" ? "bg-[#8b5cf6] text-white" : "bg-white text-black"
            }`}>
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`pixel-badge ${
                  logData.attendance === "Izin" ? "bg-[#8b5cf6] text-white" : "bg-white text-black"
                }`}>
                  STATUS: {logData.attendance.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-slate-700 font-bold">Tercatat di Presensi</span>
              </div>
              <p className="text-xs font-bold text-black leading-relaxed">
                Alasan: &ldquo;{logData.obstacle || "Tidak ada rincian alasan tertulis"}&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 font-bold">
                *Pengisian rincian aktivitas kantor tidak diwajibkan saat berstatus izin/sakit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwitchToHadir}
            disabled={isSaving}
            className="brutal-btn bg-[#a3e635] hover:bg-[#84cc16] text-black text-xs px-4 py-2 rounded-xl font-black shrink-0 cursor-pointer"
          >
            Ubah ke Hadir & Isi Log
          </button>
        </div>
      )}

      {/* Top AI Draft Generator Banner */}
      {logData.attendance === "Hadir" && (
        <div className="brutal-card bg-white p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-black font-mono">Pabrik Log Harian AI</span>
                <span className="pixel-badge bg-[#a3e635] text-black font-black text-[9px]">OTOMATIS</span>
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-600 mt-0.5">
                Generate 4 blok aktivitas kantor harian (08:30 - 17:00), refleksi, dan kendala dalam 1 klik
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDraftModalOpen(true)}
            className="brutal-btn bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs px-5 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Wand2 className="w-4 h-4 stroke-[2.5]" />
            <span>Generate Draft Seharian</span>
          </button>
        </div>
      )}

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

      {/* Reflections & Obstacles with Bottom Spacing Buffer */}
      <div className="pb-8">
        <ReflectionSection
          learning={logData.learning}
          obstacle={logData.obstacle}
          onChange={handleLogChange}
          onGenerateLearning={handleGenerateLearning}
          isGeneratingLearning={isGeneratingLearning}
        />
      </div>

      {/* Floating / Sticky Save Bar with Distinct Top Margin & Safe Bottom Nav Offset */}
      <div className="sticky bottom-20 md:bottom-6 z-30 mt-8 mb-4 flex items-center justify-between brutal-card bg-white p-3.5 md:p-4 rounded-2xl shadow-[5px_5px_0px_#000]">
        <div className="text-xs text-black font-mono font-bold hidden sm:flex items-center gap-2">
          {lastSavedAt ? (
            <span className="flex items-center gap-1.5 text-black bg-[#a3e635] px-2.5 py-1 rounded border border-black shadow-[1.5px_1.5px_0px_#000]">
              <Check className="w-4 h-4 stroke-[3]" /> Tersimpan hari ini pukul {lastSavedAt} WIB
            </span>
          ) : (
            <span className="text-black font-mono text-[11px] font-black">[STATUS: SIAP SIMPAN KE DATABASE]</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="brutal-btn bg-[#a3e635] hover:bg-[#8ee01a] text-black w-full sm:w-auto px-7 py-3 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer ml-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Menyimpan ke Database...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Jurnal ({selectedDate})</span>
            </>
          )}
        </button>
      </div>

      {/* Modal Pabrik Log AI */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-[8px_8px_0px_0px_#000] flex flex-col overflow-hidden border-[3px] border-black animate-brutal-pop max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b-2 border-black flex items-center justify-between bg-[#8b5cf6] text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="pixel-badge bg-black text-[#a3e635] border border-black shadow-[1.5px_1.5px_0px_#000]">
                  {draftPreview ? "REVIEW.DRAFT" : "AUTO.DRAFT"}
                </span>
                <h3 className="text-sm font-black uppercase text-white font-mono">
                  {draftPreview ? "Tinjau Draft Sebelum Masuk Jurnal" : "Pabrik Draft Harian AI"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDraftModalOpen(false);
                  setDraftPreview(null);
                }}
                className="text-white hover:bg-black p-1 rounded-lg border-2 border-black transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Content: Form or Review */}
            {!draftPreview ? (
              <form onSubmit={handleGenerateDraft} className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1.5 font-mono">
                    Posisi / Role Magang:
                  </label>
                  <input
                    type="text"
                    value={draftRole}
                    onChange={(e) => setDraftRole(e.target.value)}
                    placeholder="Contoh: Frontend Developer, Network Support..."
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#faf5ff]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1.5 font-mono">
                    Fokus Spesifik Hari Ini (Opsional):
                  </label>
                  <input
                    type="text"
                    value={draftTopic}
                    onChange={(e) => setDraftTopic(e.target.value)}
                    placeholder="Kosongkan jika ingin AI merancang aktivitas umum kantor"
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#faf5ff]"
                  />
                </div>

                <div className="bg-[#a3e635] border-2 border-black p-3 rounded-xl text-[11px] font-mono text-black leading-snug shadow-[2px_2px_0px_#000]">
                  <p className="font-black mb-1">[JAMINAN KEAMANAN DATA]:</p>
                  <p className="font-bold">
                    Aktivitas draft akan <u>ditinjau terlebih dahulu</u> dan <u>ditambahkan (+ Append)</u> ke daftar. Aktivitas yang sudah Anda tulis sebelumnya <strong>tidak akan pernah dihapus</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isDraftingAI}
                  className="w-full py-3 rounded-xl bg-[#a3e635] hover:bg-[#8ee01a] text-black font-black uppercase tracking-wider text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDraftingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                      <span>AI Sedang Merancang Draft...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      <span>Rancang Draft Kegiatan (Pratinjau)</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="bg-[#a3e635] text-black border-2 border-black p-3 rounded-xl text-xs font-mono font-bold shadow-[2px_2px_0px_#000]">
                  [CATATAN]: Centang aktivitas yang ingin dimasukkan. Aktivitas terpilih akan DITAMBAHKAN ke jurnal Anda tanpa menghapus kegiatan yang sudah ada.
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase font-mono text-black">
                      Pilih Kegiatan Draft ({draftPreview.selectedIndices.length}/{draftPreview.activities.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (draftPreview.selectedIndices.length === draftPreview.activities.length) {
                          setDraftPreview((prev) => ({ ...prev, selectedIndices: [] }));
                        } else {
                          setDraftPreview((prev) => ({
                            ...prev,
                            selectedIndices: prev.activities.map((_, i) => i),
                          }));
                        }
                      }}
                      className="pixel-badge bg-white text-black border border-black text-[10px] cursor-pointer"
                    >
                      {draftPreview.selectedIndices.length === draftPreview.activities.length
                        ? "Batal Semua"
                        : "Pilih Semua"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {draftPreview.activities.map((act, idx) => {
                      const isChecked = draftPreview.selectedIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setDraftPreview((prev) => ({
                              ...prev,
                              selectedIndices: isChecked
                                ? prev.selectedIndices.filter((i) => i !== idx)
                                : [...prev.selectedIndices, idx],
                            }));
                          }}
                          className={`p-3 rounded-xl border-2 border-black cursor-pointer transition-all ${
                            isChecked
                              ? "bg-white shadow-[3px_3px_0px_#000]"
                              : "bg-slate-100 opacity-60 border-dashed"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 accent-[#8b5cf6] cursor-pointer"
                            />
                            <span className="font-mono text-[10px] bg-[#8b5cf6] text-white border border-black px-1.5 py-0.5 rounded font-black">
                              {act.time_range}
                            </span>
                            <span className="font-black text-xs text-black">{act.title}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-700 mt-1 pl-6 font-bold leading-relaxed">
                            {act.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Refleksi & Kendala Options */}
                <div className="space-y-2 pt-2 border-t-2 border-black">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border-2 border-black bg-white cursor-pointer shadow-[2px_2px_0px_#000]">
                    <input
                      type="checkbox"
                      checked={draftPreview.applyLearning}
                      onChange={(e) =>
                        setDraftPreview((prev) => ({ ...prev, applyLearning: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#8b5cf6] mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-black font-mono text-black">
                        Terapkan Refleksi Pembelajaran AI
                      </span>
                      {logData.learning.trim() && (
                        <span className="block text-[10px] text-amber-800 font-mono font-black mt-0.5">
                          *Refleksi Anda saat ini akan ditimpa jika opsi ini dicentang.
                        </span>
                      )}
                      <p className="text-[11px] font-mono text-slate-700 mt-1 italic font-bold">
                        &ldquo;{draftPreview.learning}&rdquo;
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border-2 border-black bg-white cursor-pointer shadow-[2px_2px_0px_#000]">
                    <input
                      type="checkbox"
                      checked={draftPreview.applyObstacle}
                      onChange={(e) =>
                        setDraftPreview((prev) => ({ ...prev, applyObstacle: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#8b5cf6] mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-black font-mono text-black">
                        Terapkan Keterangan Kendala AI
                      </span>
                      <p className="text-[11px] font-mono text-slate-700 mt-1 italic font-bold">
                        &ldquo;{draftPreview.obstacle}&rdquo;
                      </p>
                    </div>
                  </label>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDraftPreview(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black font-mono font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    ← Rancang Ulang
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyDraft}
                    disabled={isApplyingDraft || draftPreview.selectedIndices.length === 0}
                    className="flex-2 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#8ee01a] text-black font-mono font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isApplyingDraft ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                        <span>Menambahkan ke Jurnal...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Tambahkan ({draftPreview.selectedIndices.length}) ke Jurnal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
