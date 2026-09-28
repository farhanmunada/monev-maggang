// Helper functions for Gamification Engine

// Format local date YYYY-MM-DD
export function formatYMD(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Perhitungan Streak Harian dengan Aturan 6 Hari Kerja (Senin - Sabtu)
 * Hari Minggu adalah Hari Libur Resmi (Sunday Shield).
 * Streak tidak boleh putus di hari Minggu jika hari Sabtu terisi.
 */
export function calculateStreak(logs = []) {
  if (!logs || logs.length === 0) {
    return { 
      count: 0, 
      isActiveToday: false, 
      isSunday: new Date().getDay() === 0,
      message: "Mulai streak pertamamu hari ini!" 
    };
  }

  // Ambil tanggal unik dan urutkan descending (terbaru ke terlama)
  const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
  
  const now = new Date();
  const isTodaySunday = now.getDay() === 0; // 0 = Minggu
  const todayStr = formatYMD(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  const hasToday = uniqueDates.includes(todayStr);

  // Jika hari ini Hari Minggu (Hari Libur Resmi):
  if (isTodaySunday) {
    // Cek apakah hari Sabtu (kemarin) atau hari ini diisi
    const hasSaturday = uniqueDates.includes(yesterdayStr);
    
    // Hitung streak mundur dari Sabtu (atau hari ini jika ada log di hari Minggu)
    let count = 0;
    let checkDate = new Date(hasToday ? now : yesterday);

    while (true) {
      // Jika checkDate jatuh pada hari Minggu dan bukan titik awal, lewati
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
        isActiveToday: true, // Dianggap aman di hari Minggu
        isSunday: true,
        message: `Hari Minggu Libur! Streak ${count} hari Anda aman terlindungi hingga Senin 🏖️`
      };
    }

    return {
      count: 0,
      isActiveToday: false,
      isSunday: true,
      message: "Hari Minggu libur. Siapkan semangatmu untuk mulai streak baru di hari Senin!"
    };
  }

  // Jika hari ini Senin (1): hari kerja sebelumnya adalah Sabtu (2 hari lalu)
  const isTodayMonday = now.getDay() === 1;
  const saturday = new Date(now);
  saturday.setDate(saturday.getDate() - 2);
  const saturdayStr = formatYMD(saturday);

  const hasYesterdayOrSaturday = isTodayMonday 
    ? (uniqueDates.includes(yesterdayStr) || uniqueDates.includes(saturdayStr))
    : uniqueDates.includes(yesterdayStr);

  // Jika hari ini dan hari kerja sebelumnya tidak ada catatan, streak putus (0)
  if (!hasToday && !hasYesterdayOrSaturday) {
    return { 
      count: 0, 
      isActiveToday: false, 
      isSunday: false,
      message: "Streak terputus. Isi jurnal hari ini untuk mulai lagi!" 
    };
  }

  // Hitung streak beruntun mundur dengan melewati Hari Minggu
  let count = 0;
  let checkDate = new Date(hasToday ? now : (isTodayMonday && !uniqueDates.includes(yesterdayStr) ? saturday : yesterday));

  while (true) {
    // Lewati hari Minggu (day 0) saat menghitung mundur hari kerja
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
      ? `Luar biasa! Streak ${count} hari Anda aktif hari ini.`
      : isTodayMonday && uniqueDates.includes(saturdayStr)
        ? `Streak ${count} hari tersimpan dari hari Sabtu! Isi jurnal hari ini agar bertambah.`
        : `Streak ${count} hari tersimpan! Isi jurnal hari ini agar streak tidak putus.`
  };
}

export function calculateLevelAndExp(logsCount = 0, activitiesCount = 0, learningCount = 0, doneTasksCount = 0, bonusExp = 0) {
  // Formula EXP
  const expFromLogs = logsCount * 50;
  const expFromActs = activitiesCount * 15;
  const expFromLearning = learningCount * 20;
  const expFromTasks = doneTasksCount * 10;

  const totalExp = expFromLogs + expFromActs + expFromLearning + expFromTasks + bonusExp;

  const LEVELS = [
    { level: 1, title: "Trainee Intern", minExp: 0, maxExp: 150, color: "from-blue-500 to-cyan-500", badgeColor: "bg-blue-100 text-blue-700" },
    { level: 2, title: "Junior Apprentice", minExp: 150, maxExp: 400, color: "from-indigo-600 to-purple-600", badgeColor: "bg-indigo-100 text-indigo-700" },
    { level: 3, title: "Skilled Specialist", minExp: 400, maxExp: 800, color: "from-purple-600 to-pink-600", badgeColor: "bg-purple-100 text-purple-700" },
    { level: 4, title: "Senior Apprentice", minExp: 800, maxExp: 1400, color: "from-amber-500 to-orange-600", badgeColor: "bg-amber-100 text-amber-700" },
    { level: 5, title: "Master Intern", minExp: 1400, maxExp: 2500, color: "from-emerald-500 to-teal-600", badgeColor: "bg-emerald-100 text-emerald-700" },
  ];

  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVELS[i].minExp) {
      currentLevel = LEVELS[i];
      break;
    }
  }

  const expInLevel = totalExp - currentLevel.minExp;
  const levelSpan = currentLevel.maxExp - currentLevel.minExp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((expInLevel / levelSpan) * 100)));

  return {
    totalExp,
    currentLevel: currentLevel.level,
    title: currentLevel.title,
    minExp: currentLevel.minExp,
    maxExp: currentLevel.maxExp,
    progressPercent,
    color: currentLevel.color,
    badgeColor: currentLevel.badgeColor,
    expBreakdown: {
      fromLogs: expFromLogs,
      fromActs: expFromActs,
      fromLearning: expFromLearning,
      fromTasks: expFromTasks,
      fromBonus: bonusExp
    }
  };
}

/**
 * Papan Misi Interaktif (Interactive Quests)
 * Berisi misi harian & mingguan dengan tombol klaim
 */
export function getInteractiveQuests({
  todayLog = null,
  todayActivitiesCount = 0,
  doneTasksTodayCount = 0,
  weekLogsCount = 0,
  claimedQuestIds = []
}) {
  const hasLoggedToday = !!todayLog;
  const hasLearningToday = !!(todayLog && todayLog.learning && todayLog.learning.trim().length > 15);

  const QUESTS = [
    {
      id: "quest_daily_log",
      type: "daily",
      title: "Catat Jurnal Hari Ini",
      desc: "Isi dan simpan jurnal kegiatan magang hari ini",
      rewardExp: 30,
      icon: "📝",
      current: hasLoggedToday ? 1 : 0,
      target: 1,
      isCompleted: hasLoggedToday,
      isClaimed: claimedQuestIds.includes("quest_daily_log")
    },
    {
      id: "quest_daily_acts",
      type: "daily",
      title: "Eksekusi 2 Kegiatan",
      desc: "Tambahkan minimal 2 aktivitas pada jurnal hari ini",
      rewardExp: 25,
      icon: "⚡",
      current: Math.min(todayActivitiesCount, 2),
      target: 2,
      isCompleted: todayActivitiesCount >= 2,
      isClaimed: claimedQuestIds.includes("quest_daily_acts")
    },
    {
      id: "quest_daily_learning",
      type: "daily",
      title: "Refleksi Pembelajaran",
      desc: "Tuliskan ilmu/pengalaman baru di form refleksi hari ini",
      rewardExp: 20,
      icon: "🧠",
      current: hasLearningToday ? 1 : 0,
      target: 1,
      isCompleted: hasLearningToday,
      isClaimed: claimedQuestIds.includes("quest_daily_learning")
    },
    {
      id: "quest_daily_task",
      type: "daily",
      title: "Tuntaskan Task Magang",
      desc: "Selesaikan minimal 1 task di board catatan",
      rewardExp: 25,
      icon: "🎯",
      current: Math.min(doneTasksTodayCount, 1),
      target: 1,
      isCompleted: doneTasksTodayCount >= 1,
      isClaimed: claimedQuestIds.includes("quest_daily_task")
    },
    {
      id: "quest_week_consistency",
      type: "weekly",
      title: "Pejuang 5 Hari Kerja",
      desc: "Mengisi jurnal minimal 5 hari kerja minggu ini (Senin–Sabtu)",
      rewardExp: 75,
      icon: "🔥",
      current: Math.min(weekLogsCount, 5),
      target: 5,
      isCompleted: weekLogsCount >= 5,
      isClaimed: claimedQuestIds.includes("quest_week_consistency")
    }
  ];

  return QUESTS;
}

export function generateHeatmap(logs = [], daysCount = 28) {
  const now = new Date();
  const heatmap = [];

  // Peta tanggal ke jumlah log/kegiatan
  const logMap = {};
  logs.forEach(l => {
    const actCount = l.activities ? l.activities.length : 1;
    logMap[l.date] = (logMap[l.date] || 0) + actCount;
  });

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const isSunday = d.getDay() === 0;

    const count = logMap[dateStr] || 0;
    heatmap.push({
      date: dateStr,
      count,
      isSunday,
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" })
    });
  }

  return heatmap;
}

