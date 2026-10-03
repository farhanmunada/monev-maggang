# Arsitektur: Refaktor Modular & Clean Code

## 1. Desain Arsitektur Baru
```
src/
├── app/
│   ├── page.js                  <-- Slim Page Orchestrator (~100 baris)
│   ├── daily-log/page.js        <-- Slim Page Orchestrator (~80 baris)
│   ├── report/page.js           <-- Slim Page Orchestrator (~80 baris)
│   └── notes/page.js            <-- Slim Page Orchestrator (~70 baris)
├── components/
│   ├── Sidebar.js
│   ├── BottomNav.js
│   ├── dashboard/
│   │   ├── HeroCommand.js
│   │   ├── MascotCard.js
│   │   ├── BossBattleCard.js
│   │   ├── DailyChestCard.js
│   │   ├── QuestsBoard.js
│   │   ├── ActivityHeatmap.js
│   │   ├── ActiveTasksWidget.js
│   │   ├── RecentLogsWidget.js
│   │   └── WrappedModal.js
│   ├── daily-log/
│   │   ├── LogHeader.js
│   │   ├── SundayShieldBanner.js
│   │   ├── ActivityList.js
│   │   ├── ActivityForm.js
│   │   └── ReflectionSection.js
│   ├── report/
│   │   ├── AttendanceStats.js
│   │   ├── LogHistoryList.js
│   │   └── AiReportGenerator.js
│   └── notes/
│       ├── NotesGrid.js
│       ├── KanbanBoard.js
│       └── NoteModal.js
└── lib/
    ├── supabase.js
    ├── date.js                  <-- Single Source of Truth penanggalan
    ├── audio.js                 <-- Web Audio API synthesizer
    ├── storage.js               <-- SSR-safe LocalStorage helper
    └── gamification.js          <-- Gamification Engine
```

## 2. Tahapan Pengerjaan Bertahap (Incremental Slices)

1. **Slice 1: Ekstraksi Utility Dasar**
   - Buat `src/lib/date.js`
   - Buat `src/lib/audio.js`
   - Buat `src/lib/storage.js`
   - Refactor `src/lib/gamification.js` untuk menggunakan `src/lib/date.js`

2. **Slice 2: Modularisasi Dashboard**
   - Buat modul `src/components/dashboard/*`
   - Sederhanakan `src/app/page.js`

3. **Slice 3: Modularisasi Daily Log**
   - Buat modul `src/components/daily-log/*`
   - Sederhanakan `src/app/daily-log/page.js`

4. **Slice 4: Modularisasi Report & Absensi**
   - Buat modul `src/components/report/*`
   - Sederhanakan `src/app/report/page.js`

5. **Slice 5: Modularisasi Notes & Kanban**
   - Buat modul `src/components/notes/*`
   - Sederhanakan `src/app/notes/page.js`

6. **Slice 6: Verifikasi & Audit Kualitas**
   - `npm run lint`
   - `npm run build`
   - Commit atomik konvensional
