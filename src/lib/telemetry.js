import { formatYMD } from "./date";

/**
 * Perhitungan Streak Harian dengan Aturan 6 Hari Kerja (Senin - Sabtu)
 * Hari Minggu adalah Hari Libur Resmi (Sunday Shield).
 */
export function calculateStreak(logs = []) {
  if (!logs || logs.length === 0) {
    return {
      count: 0,
      isActiveToday: false,
      isSunday: new Date().getDay() === 0,
      message: "Mulai konsistensi jurnalmu hari ini.",
    };
  }

  const uniqueDates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
  const now = new Date();
  const isTodaySunday = now.getDay() === 0;
  const todayStr = formatYMD(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  const hasToday = uniqueDates.includes(todayStr);

  if (isTodaySunday) {
    const hasSaturday = uniqueDates.includes(yesterdayStr);
    let count = 0;
    let checkDate = new Date(hasToday ? now : yesterday);

    while (true) {
      if (checkDate.getDay() === 0 && formatYMD(checkDate) !== (hasToday ? todayStr : "")) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      const checkStr = formatYMD(checkDate);
      if (uniqueDates.includes(checkStr)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    if (count > 0 || hasSaturday || hasToday) {
      return {
        count: Math.max(count, hasSaturday ? 1 : 0),
        isActiveToday: true,
        isSunday: true,
        message: `Hari Minggu libur resmi. Presensi ${count} hari tersimpan aman sampai Senin.`,
      };
    }

    return {
      count: 0,
      isActiveToday: false,
      isSunday: true,
      message: "Hari Minggu libur. Selamat beristirahat.",
    };
  }

  const isTodayMonday = now.getDay() === 1;
  const saturday = new Date(now);
  saturday.setDate(saturday.getDate() - 2);
  const saturdayStr = formatYMD(saturday);

  const hasYesterdayOrSaturday = isTodayMonday
    ? uniqueDates.includes(yesterdayStr) || uniqueDates.includes(saturdayStr)
    : uniqueDates.includes(yesterdayStr);

  if (!hasToday && !hasYesterdayOrSaturday) {
    return {
      count: 0,
      isActiveToday: false,
      isSunday: false,
      message: "Belum ada catatan jurnal aktif hari ini.",
    };
  }

  let count = 0;
  let checkDate = new Date(
    hasToday ? now : isTodayMonday && !uniqueDates.includes(yesterdayStr) ? saturday : yesterday
  );

  while (true) {
    if (checkDate.getDay() === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    const checkStr = formatYMD(checkDate);
    if (uniqueDates.includes(checkStr)) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    count,
    isActiveToday: hasToday,
    isSunday: false,
    message: hasToday
      ? `Presensi ${count} hari konsisten tercatat.`
      : isTodayMonday && uniqueDates.includes(saturdayStr)
      ? `Presensi ${count} hari aman dari Sabtu. Isi hari ini agar terjaga.`
      : `Presensi ${count} hari bertahan aktif.`,
  };
}

/**
 * Helper to estimate hours from time_range or default to 1.5 hrs per activity
 */
export function estimateActivityHours(activities = []) {
  if (!activities || activities.length === 0) return 0;

  let totalMinutes = 0;
  activities.forEach((act) => {
    if (act.time_range && act.time_range.includes("-")) {
      const parts = act.time_range.split("-").map((s) => s.trim());
      if (parts.length === 2) {
        const [startH, startM] = parts[0].split(":").map(Number);
        const [endH, endM] = parts[1].split(":").map(Number);

        if (!isNaN(startH) && !isNaN(endH)) {
          const startTotal = startH * 60 + (isNaN(startM) ? 0 : startM);
          const endTotal = endH * 60 + (isNaN(endM) ? 0 : endM);
          const diff = endTotal - startTotal;
          if (diff > 0 && diff <= 480) {
            totalMinutes += diff;
            return;
          }
        }
      }
    }
    // Default 90 minutes per recorded activity
    totalMinutes += 90;
  });

  return Math.round((totalMinutes / 60) * 10) / 10;
}

/**
 * Calculate comprehensive professional telemetry metrics
 */
export function calculateTelemetry(logs = [], notes = []) {
  const totalLogs = logs.length;
  const presentDays = logs.filter((l) => l.attendance === "Hadir").length;
  const leaveDays = logs.filter((l) => l.attendance === "Izin").length;
  const sickDays = logs.filter((l) => l.attendance === "Sakit").length;
  const absentDays = logs.filter((l) => l.attendance === "Alfa").length;

  const attendanceRate = totalLogs > 0 ? Math.round((presentDays / totalLogs) * 100) : 100;

  let allActivities = [];
  logs.forEach((log) => {
    if (log.activities && Array.isArray(log.activities)) {
      allActivities = allActivities.concat(log.activities);
    }
  });

  const totalActivitiesCount = allActivities.length;
  const totalHoursLogged = estimateActivityHours(allActivities);

  const tasks = notes.filter((n) => n.type === "task");
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const knowledgeNotes = notes.filter((n) => n.type !== "task");
  const totalNotes = knowledgeNotes.length;

  const todayStr = formatYMD();
  const todayLog = logs.find((l) => l.date === todayStr);
  const isLoggedToday = !!todayLog;
  const todayActivitiesCount = todayLog?.activities?.length || 0;

  const streak = calculateStreak(logs);

  return {
    totalLogs,
    presentDays,
    leaveDays,
    sickDays,
    absentDays,
    attendanceRate,
    totalActivitiesCount,
    totalHoursLogged,
    tasks: {
      total: totalTasks,
      done: doneTasks,
      inProgress: inProgressTasks,
      todo: todoTasks,
      completionRate: taskCompletionRate,
    },
    totalNotes,
    today: {
      isLogged: isLoggedToday,
      status: todayLog?.attendance || null,
      activitiesCount: todayActivitiesCount,
      log: todayLog || null,
    },
    streak,
  };
}
