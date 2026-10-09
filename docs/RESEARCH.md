# Riset: Transformasi Layout Next-Gen & Highlight Periode Presensi

## 1. Analisis Masalah UI/UX Sebelumnya
1. **Sidebar Konvensional Membatasi Kanvas:**
   - Sidebar statis 72px/288px di sisi kiri memotong ruang horizontal layar desktop.
   - Mengurangi fleksibilitas layout Bento Grid yang membutuhkan ruang lebar bebas hambatan.
2. **Kontras Ekstrem Gelap (Dark Cards Fatigue):**
   - Elemen `bg-slate-950` dan `bg-slate-900` pada hero dashboard, boss card, dan modal terasa terlalu berat dan kontras negatif terhadap latar terang.
   - User menginginkan tampilan bersih tanpa dekorasi hitam pekat (*anti-black decorative*).
3. **Penyatuan Fitur yang Tidak Kohesif (Coupled Routes):**
   - Absensi dan Generator AI disatukan di `/report` sehingga alur kerja membingungkan.
   - Task Kanban dan Catatan disatukan di `/notes`, padahal memiliki mental model berbeda (eksekusi vs dokumentasi).
4. **Gamifikasi Berlebihan (Clutter):**
   - Lord Mager, chest reward, level, dan exp quest mendistraksi dari produktivitas kerja nyata.
5. **Kebutuhan Delight Menggemaskan:**
   - User menyukai elemen karakter ambient yang hidup dan berjalan-jalan secara alami di layar tanpa sistem poin/EXP.

## 2. Riset Fitur Baru: Highlight Tanggal 20 (Switch Periode & Gajian)
1. **Konteks Kebutuhan Pengguna:**
   - Halaman target: `/attendance` (`src/app/attendance/page.js`).
   - Setiap tanggal 20 merupakan hari penting:
     - **Switch Periode:** Cutoff / pergantian siklus evaluasi bulanan magang (misal periode 21 bulan lalu hingga 20 bulan ini).
     - **Gajian (Payday):** Tanggal pencairan uang saku / gaji magang peserta.
   - Pengguna meminta penanda visual (highlight) yang jelas di kalender bulanan agar langsung terlihat saat membuka halaman kehadiran.

2. **Analisis Teknis Implementasi Kalender Saat Ini:**
   - File: `src/app/attendance/page.js`.
   - Grid sel kalender di-generate melalui useMemo `calendarCells`.
   - Setiap sel memiliki properti `day`, `dateStr`, `isSunday`, `log`.
   - Kondisi tanggal 20: `const isPayday = day === 20;`.
   - Styling sel saat ini:
     - Normal: `border-slate-200/80 bg-white hover:border-slate-300`
     - Hari Ini: `ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50/20`
   - Kebutuhan Styling Tanggal 20:
     - Badge khusus: Pill emas/amber dengan icon Lucide `Coins` atau label "💰 Gajian" / "Switch Periode".
     - Border/Background aksen halus: `border-amber-300/80 bg-gradient-to-b from-amber-50/40 to-white ring-1 ring-amber-400/40` yang harmonis dengan palet *Warm Slate & Porcelain*.
     - Integrasi dengan Hari Ini: Jika tanggal 20 bertepatan dengan hari ini, ring indigo tetap aktif dengan aksen badge gajian tetap mencolok.
     - Modal Detail: Ketika sel tanggal 20 diklik, modal menampilkan banner info khusus: status penutupan siklus evaluasi magang & hari pencairan gaji.
     - Legenda / Status Bar: Menambahkan indikator keterangan kalender di bawah header/grid agar pengguna langsung memahami arti highlight tanggal 20.
