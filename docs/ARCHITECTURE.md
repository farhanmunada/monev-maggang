# Arsitektur: Full-System Pixel-Glass Harmonization & Accessibility Polish

## 1. Pemecahan File (File Impact Breakdown)
1. `src/components/Navbar.js`: Layout 3-kolom seimbang. Brand di kiri, Nav menu presisi di tengah dengan whitespace lebar (`px-4 py-2 gap-2`), dan live indicator di kanan untuk simetri visual tanpa himpitan tepi.
2. `src/components/SpeedLogModal.js`: Reposisi tombol floating ke `bottom-32 md:bottom-16 right-4` agar tersusun vertikal rapi DI ATAS tombol Mode Fokus (`WalkingCompanions.js`) tanpa tumpang tindih.
3. `src/app/daily-log/page.js`: Rombak container utama dan sticky save bar ke `.glass-panel` & hairline borders.
4. `src/components/daily-log/ActivityList.js`: Kartu aktivitas semi-transparan `bg-white/70 backdrop-blur-sm`, template chips pixel badges `[+ FITUR]`, dan reduksi text-bloat.
5. `src/components/daily-log/ActivityForm.js`: Form input inline bergaya glassmorphic.
6. `src/components/daily-log/ReflectionSection.js`: Refleksi & Kendala dibungkus `.glass-panel` dengan counter karakter mono-pixel.
7. `src/components/daily-log/SundayShieldBanner.js`: Banner istirahat menggunakan glass panel beraksen sky.
8. `src/app/attendance/page.js`: Kalender, kontrol bulan, dan kartu ringkasan menggunakan `.glass-panel` dan pixel badge status.
9. `src/components/dashboard/QuickShortcuts.js`, `RecentLogsWidget.js`, `ActiveTasksWidget.js`: Kartu modular diselaraskan ke tile semi-transparan bergradasi halus.

## 2. Rincian Teknis Implementasi

### A. Centered & Accessible Navbar (`Navbar.js`)
- Container: `flex items-center justify-between` dengan pembagian `flex-1` (kiri), `flex-2 justify-center` (tengah), dan `flex-1 justify-end` (kanan).
- Item Link: Padding lebih lapang (`px-3.5 py-1.5` s/d `px-4 py-2`), font-medium, icon + text dengan kontras tinggi untuk aksesibilitas dan readability.
- Kanan: Indikator pixel live `[LIVE.SYS]` dengan pulse dot hijau menjaga visual weight tetap seimbang.

### B. Vertical Stacking Tombol Floating
- `WalkingCompanions.js` (Mode Fokus): Tetap di anchor bawah `bottom-20 md:bottom-4 right-4`.
- `SpeedLogModal.js` (Speed Log): Diberi offset vertikal aman `bottom-32 md:bottom-16 right-4` sehingga mengapung tepat di atas tombol Mode Fokus tanpa menghalangi klik maupun animasi bubble.

### C. Standardisasi Komponen Halaman ke Modern Pixel-Glass
- Hilangkan seluruh sisa `bg-white border-slate-200/90` yang tebal/kaku, ganti dengan `.glass-panel` (`bg-white/75 backdrop-blur-md border border-white/80 shadow-2xs`).
- Teks bantuan panjang diganti dengan label ringkas berformat pixel mono (`[REFLEKSI]`, `[KENDALA]`, `[PRESET]`).
