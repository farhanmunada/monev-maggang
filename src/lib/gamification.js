// Helper functions for Gamification Engine

export function calculateStreak(logs = []) {
  if (!logs || logs.length === 0) {
    return { count: 0, isActiveToday: false, message: "Mulai streak pertamamu hari ini!" };
  }

  // Ambil tanggal unik dan urutkan descending (terbaru ke terlama)
  const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
  
  // Tanggal hari ini dan kemarin dalam string lokal YYYY-MM-DD
  const now = new Date();
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatYMD(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  const hasToday = uniqueDates.includes(todayStr);
  const hasYesterday = uniqueDates.includes(yesterdayStr);

  // Jika hari ini dan kemarin tidak ada catatan sama sekali, streak putus (0)
  if (!hasToday && !hasYesterday) {
    return { count: 0, isActiveToday: false, message: "Streak terputus. Isi jurnal hari ini untuk mulai lagi!" };
  }

  // Hitung streak beruntun mundur
  let count = 0;
  let checkDate = new Date(hasToday ? now : yesterday);

  while (true) {
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
    message: hasToday 
      ? `Luar biasa! Streak ${count} hari Anda aktif hari ini.`
      : `Streak ${count} hari tersimpan! Isi jurnal hari ini agar streak tidak putus.`
  };
}

export function calculateLevelAndExp(logsCount = 0, activitiesCount = 0, learningCount = 0, doneTasksCount = 0) {
  // Formula EXP
  const expFromLogs = logsCount * 50;
  const expFromActs = activitiesCount * 15;
  const expFromLearning = learningCount * 20;
  const expFromTasks = doneTasksCount * 10;

  const totalExp = expFromLogs + expFromActs + expFromLearning + expFromTasks;

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
      fromTasks: expFromTasks
    }
  };
}

export function calculateBadges({ streakCount = 0, logsCount = 0, activitiesCount = 0, learningCount = 0, doneTasksCount = 0, attendanceRate = 100, currentLevel = 1 }) {
  const BADGES = [
    {
      id: "streak_3",
      title: "🔥 Konsisten",
      desc: "Streak 3 hari kerja berturut-turut",
      progress: Math.min(streakCount, 3),
      target: 3,
      unlocked: streakCount >= 3,
      rewardExp: 30
    },
    {
      id: "streak_7",
      title: "⚡ Dedikasi Emas",
      desc: "Streak 7 hari kerja berturut-turut",
      progress: Math.min(streakCount, 7),
      target: 7,
      unlocked: streakCount >= 7,
      rewardExp: 70
    },
    {
      id: "act_5",
      title: "🛠️ Produktif",
      desc: "Menyelesaikan 5 kegiatan magang",
      progress: Math.min(activitiesCount, 5),
      target: 5,
      unlocked: activitiesCount >= 5,
      rewardExp: 25
    },
    {
      id: "act_20",
      title: "👑 Centurion",
      desc: "Menyelesaikan 20 kegiatan magang",
      progress: Math.min(activitiesCount, 20),
      target: 20,
      unlocked: activitiesCount >= 20,
      rewardExp: 100
    },
    {
      id: "learn_3",
      title: "🧠 Reflektif",
      desc: "Mencatat 3 refleksi pembelajaran",
      progress: Math.min(learningCount, 3),
      target: 3,
      unlocked: learningCount >= 3,
      rewardExp: 40
    },
    {
      id: "task_3",
      title: "🎯 Task Slayer",
      desc: "Menyelesaikan 3 task di board catatan",
      progress: Math.min(doneTasksCount, 3),
      target: 3,
      unlocked: doneTasksCount >= 3,
      rewardExp: 30
    },
    {
      id: "level_2",
      title: "🌟 Bintang Magang",
      desc: "Berhasil naik ke Level 2 (Junior)",
      progress: Math.min(currentLevel, 2),
      target: 2,
      unlocked: currentLevel >= 2,
      rewardExp: 50
    },
    {
      id: "attend_100",
      title: "🛡️ Disiplin Penuh",
      desc: "Kehadiran 100% (minimal 3 log)",
      progress: logsCount >= 3 && attendanceRate === 100 ? 1 : 0,
      target: 1,
      unlocked: logsCount >= 3 && attendanceRate === 100,
      rewardExp: 50
    }
  ];

  return BADGES;
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

    const count = logMap[dateStr] || 0;
    heatmap.push({
      date: dateStr,
      count,
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" })
    });
  }

  return heatmap;
}
