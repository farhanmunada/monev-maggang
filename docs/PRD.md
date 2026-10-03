# PRD: Refaktor Modular & Clean Code Architecture InternTrack

## 1. Tujuan (Objective)
Mendekomposisi codebase monolithic (fat files) menjadi arsitektur modular yang scalable, readable, dan mudah di-maintain. Menghilangkan duplikasi kode (DRY) pada fungsi tanggal, memisahkan side-effects (Web Audio, LocalStorage), dan memecah 4 halaman utama menjadi komponen-komponen terfokus dengan Single Responsibility Principle (SRP).

## 2. Tech Stack & Perintah
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4
- **Iconography:** Lucide React
- **Backend/DB:** Supabase Client
- **Perintah Verifikasi:**
  - Build: `npm run build`
  - Lint: `npm run lint`

## 3. Lingkup Refaktor (Clean Code)

### 3.1. Utilitas Terpusat (`src/lib/`)
- `src/lib/date.js`: Menyatukan helper `formatYMD`, `getLocalDateString`, dan `formatIndonesianDate`.
- `src/lib/audio.js`: Sintesis Web Audio API mandiri (`playSfx`).
- `src/lib/storage.js`: Helper SSR-safe untuk `localStorage` (chest data, quests claimed, bonus exp).

### 3.2. Modularisasi Dashboard (`src/components/dashboard/`)
Pecah `src/app/page.js` (550+ baris) menjadi:
- `HeroCommand.js`: EXP progress bar, streak pill, level info.
- `MascotCard.js`: Interaksi Si Maggy, avatar cycle, quotes sarkas.
- `BossBattleCard.js`: Widget mingguan Lord Mager dan bar HP.
- `DailyChestCard.js`: Peti harian dan status buka/klaim.
- `QuestsBoard.js`: Papan misi interaktif dan tombol klaim EXP.
- `ActivityHeatmap.js`: Matriks konsistensi aktivitas 28 hari.
- `ActiveTasksWidget.js`: Daftar task aktif dengan check to-do.
- `RecentLogsWidget.js`: Riwayat 3 jurnal terbaru.
- `WrappedModal.js`: Modal spotlight mingguan dan salin status WA.

### 3.3. Modularisasi Daily Log (`src/components/daily-log/`)
Pecah `src/app/daily-log/page.js` (400+ baris) menjadi:
- `LogHeader.js`: Header tanggal, streak badge, selector status kehadiran.
- `SundayShieldBanner.js`: Banner khusus libur hari Minggu.
- `ActivityList.js`: Daftar aktivitas harian dengan form edit inline.
- `ActivityForm.js`: Form input aktivitas baru.
- `ReflectionSection.js`: Refleksi pembelajaran (dengan trigger rangkum AI) dan kendala.

### 3.4. Modularisasi Rekap & Absensi (`src/components/report/`)
Pecah `src/app/report/page.js` (350+ baris) menjadi:
- `AttendanceStats.js`: 4 kartu statistik kehadiran.
- `LogHistoryList.js`: Filter status, search bar, accordion riwayat aktivitas.
- `AiReportGenerator.js`: Panel generator narasi laporan magang AI.

### 3.5. Modularisasi Catatan & Kanban (`src/components/notes/`)
Pecah `src/app/notes/page.js` (300+ baris) menjadi:
- `NotesGrid.js`: Grid catatan materi, meeting, keyword.
- `KanbanBoard.js`: Kanban task (To Do, In Progress, Done).
- `NoteModal.js`: Modal dialog tambah & edit catatan.

## 4. Kriteria Sukses
1. Seluruh fungsi dan logika aplikasi tetap bekerja 100% identik tanpa regresi.
2. Tidak ada satupun file halaman (`page.js`) yang melebihi ~150 baris.
3. Tetap 100% bebas dari emoji mentah (menggunakan SVG Lucide React).
4. `npm run lint` dan `npm run build` lulus tanpa error.
