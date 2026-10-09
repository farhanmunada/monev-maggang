# Arsitektur: Pixel-Glass Harmony, Multi-Day AI Recapper, Speed-Log, & Glanceable UI

## 1. Pemecahan File (File Impact Breakdown)
1. `src/components/SpeedLogModal.js` *(Baru)*: Floating action button `[⚡ SPEED LOG]` dan modal glassmorphic untuk mencatat kegiatan instan dengan preset chip (`[STANDUP]`, `[DEV]`, `[BUGFIX]`, `[MEETING]`, `[TESTING]`) tanpa pindah halaman.
2. `src/app/layout.js`: Pasang komponen `SpeedLogModal` agar aktif secara global di seluruh rute.
3. `src/app/ai-report/page.js`: Tambahkan selector rentang waktu (Harian, 7 Hari / Mingguan, dan Periode Cutoff Tgl 20), integrasi multi-day aggregation, pangkas teks berlebih, dan aplikasikan `glass-panel`.
4. `src/app/notes/page.js` & `src/components/notes/NotesGrid.js`: Rombak kartu catatan ke `glass-panel` tanpa garis tebal, ganti filter dengan pixel-badges, dan reduksi teks deskripsi.
5. `src/components/daily-log/LogHeader.js` & `src/app/attendance/page.js`: Pangkas teks deskripsi panjang menjadi pixel micro-tags ringkas.

## 2. Rincian Teknis Implementasi

### A. Komponen Global `SpeedLogModal.js`
- State: `isOpen`, `timeRange` (default: jam sekarang), `title`, `preset`, `isSubmitting`.
- Preset chips:
  - `⚡ STANDUP` (Daily sync/standup meeting)
  - `💻 DEV` (Feature implementation/coding)
  - `🐞 BUGFIX` (Troubleshooting & fixing)
  - `🤝 MEETING` (Client/team discussion)
  - `🧪 TESTING` (QA & manual testing)
- Logika penyimpanan:
  1. Cari `daily_logs` untuk hari ini (`formatYMD()`). Jika belum ada, buat log baru otomatis dengan status "Hadir".
  2. Masukkan record ke tabel `activities` yang berelasi dengan `daily_log_id`.
  3. Tampilkan toast sukses dan tutup modal seketika.

### B. AI Multi-Day Recapper (`/ai-report`)
- Mode Rentang:
  - `single`: Tanggal tertentu (default)
  - `weekly`: 7 hari terakhir dari tanggal aktif
  - `period`: Rentang periode bulanan cutoff tgl 20 (tanggal 21 bulan lalu s/d 20 bulan ini)
- Agregasi: Mengumpulkan seluruh aktivitas dari tanggal-tanggal yang masuk rentang, lalu mengirimkannya ke endpoint `/api/generate-report` untuk dirangkum menjadi narasi formal gabungan.

### C. Penyelarasan `/notes` (Knowledge Vault)
- Menggunakan `glass-panel` pada setiap note card.
- Badge tipe catatan menggunakan `.pixel-badge`: `[KEYWORD]`, `[MEETING]`, `[SNIPPET]`.
- Tanpa garis tebal kaku.

### D. Reduksi Teks Ekstrem (Glanceable UI)
- Pangkas kalimat intro/sub-heading panjang di header seluruh halaman menjadi pixel tags padat.
