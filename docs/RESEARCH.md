# Riset: Penyelarasan Pixel-Glass, Multi-Day Recapper, Speed-Log, & Reduksi Teks

## 1. Analisis Masalah Teks Berlebih (Text Bloat) di Seluruh Sistem
1. **Kondisi Saat Ini:**
   - Halaman `/ai-report`, `/daily-log`, `/notes`, dan Dashboard memiliki sub-header deskriptif panjang (2-3 baris kalimat) yang jarang dibaca pengguna.
   - Komponen formulir memiliki label instruksional yang berulang dan melelahkan mata.
2. **Solusi "Glanceable UI" (Anti-Text Walls):**
   - Mengganti kalimat penjelasan panjang dengan **Pixel Status Badges** (seperti `[AI.STUDIO]`, `[LOG.EDITOR]`, `[VAULT.NOTES]`).
   - Menyederhanakan copy menjadi 1 baris micro-copy padat dan fungsional.
   - Mengutamakan visual cues (chip, icon, progress indicator) dibanding deskripsi teks.

## 2. Riset Fitur A: AI Multi-Day Recapper (Mingguan & Periode Tgl 20)
1. **Kebutuhan Nyata Magang:**
   - Kampus dan pembimbing industri umumnya meminta **Laporan Mingguan (Weekly Summary)** atau **Laporan Bulanan Periode Cutoff (Tgl 21–20)**.
   - Generator saat ini hanya mendukung 1 hari tunggal.
2. **Desain Solusi di `/ai-report`:**
   - Mode Selector Chip:
     - `[HARI INI]`
     - `[7 HARI TERAKHIR]`
     - `[PERIODE GAJIAN / CUTOFF (21-20)]`
   - AI memproses agregasi seluruh aktivitas dari tanggal-tanggal terkait dan menghasilkan format bullet ringkas formal.

## 3. Riset Fitur D: Quick Floating Speed-Log (Catat Cepat Global)
1. **Alur Kerja Pengguna:**
   - Pengguna seringkali sedang berada di Kanban `/tasks` atau Kalender `/attendance`, lalu teringat 1 aktivitas yang ingin dicatat tanpa harus navigasi dan reload ke `/daily-log`.
2. **Desain Solusi Global:**
   - Komponen `src/components/SpeedLogModal.js` yang dipasang global di `src/app/layout.js`.
   - Floating Trigger Button `[+ SPEED LOG]` di sudut kanan bawah (posisi ergonomis di atas walking companions).
   - Form 1-klik: Preset chip aktivitas (`[STANDUP]`, `[DEV]`, `[BUGFIX]`, `[MEETING]`, `[TESTING]`) + input teks singkat + `Enter` langsung simpan ke database log hari ini.

## 4. Riset Fitur No. 4: Penyelarasan Modern Pixel-Glass di `/notes` & `/ai-report`
- `/notes`: Ubah `NotesGrid`, filter category chips, dan card notes menjadi `glass-panel` tanpa garis tebal, dengan aksen pixel badge `[KEYWORD]`, `[MEETING]`, `[SNIPPET]`.
- `/ai-report`: Panel studio kaca frosted, tombol generator glass modern, dan copy box dengan specular rim highlight.
