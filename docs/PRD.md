# PRD: Highlight Tanggal 20 (Switch Periode & Gajian) pada Kalender Presensi

## 1. Latar Belakang & Tujuan (Objective)
Pengguna magang memiliki siklus evaluasi bulanan dan pencairan uang saku/gaji yang jatuh tempo pada **tanggal 20 setiap bulannya**. Tanggal ini sekaligus menandai "switch periode" (pergantian siklus laporan dan presensi magang).
Tujuan dari pembaruan ini adalah:
- Memberikan penanda visual yang estetik, intuitif, dan menonjol pada sel tanggal 20 di Kalender Presensi (`/attendance`).
- Menyediakan badge khusus penanda "Switch Periode & Gajian" di dalam sel kalender.
- Memberikan informasi kontekstual pada modal detail saat tanggal 20 diklik (banner perayaan pencairan gaji & penutupan siklus periode).
- Menyediakan penjelas/legenda ringkas di bawah kalender untuk kejelasan informasi.

## 2. Cakupan Fitur (Scope)
1. **Highlight Sel Kalender Tanggal 20 (`src/app/attendance/page.js`):**
   - Menambahkan properti identifikasi `isPeriodSwitch` / `isPayday` pada generator sel tanggal 20.
   - Penataan visual sel tanggal 20:
     - Badge khusus di sudut sel: Ikon koin/dompet (`Coins` / `Wallet`) dengan teks "Gajian" atau "Cutoff".
     - Aksen border bernuansa emas/amber hangat (`border-amber-300 bg-amber-50/20`) yang tetap menyatu dengan tema Warm Slate & Porcelain.
     - Tetap mendukung status presensi harian (Hadir, Izin, Sakit, Alfa) tanpa tumpang tindih tata letak.
2. **Keterangan & Banner Detail Modal:**
   - Saat tanggal 20 diklik, modal rincian kegiatan menyertakan kartu informasi highlight: *"🎉 Switch Periode & Hari Gajian — Tanggal cut-off evaluasi magang dan pencairan honor/uang saku bulanan."*
3. **Legenda Kalender Presensi:**
   - Menambahkan penanda pada legenda status di halaman kalender presensi agar pengguna dan evaluator langsung memahami arti penanda tanggal 20.

## 3. Desain Visual & Pengalaman Pengguna (UI/UX)
- **Palet Warna:** Warm Amber (`#F59E0B`, `bg-amber-50`, `border-amber-200/90`, `text-amber-700`) untuk aksen gajian, dipadukan dengan palet dasar putih `#FFFFFF` dan `#F8FAFC`.
- **Ikon:** Lucide React (`Coins` atau `Wallet`) tanpa emoji statis tidak konsisten.
- **Responsivitas:** Tampilan di layar kecil (mobile) menggunakan badge ringkas atau dot indikator emas, sedangkan desktop menampilkan badge lengkap.

## 4. Kriteria Penerimaan (Acceptance Criteria)
1. Sel tanggal 20 di setiap bulan pada kalender `/attendance` memiliki aksen visual highlight yang jelas dan membedakannya dari tanggal biasa.
2. Jika tanggal 20 jatuh pada hari ini, highlight tanggal 20 dan penanda "Hari Ini" berpadu rapi tanpa tabrakan layout.
3. Modal detail tanggal 20 menampilkan kartu informasi status switch periode & gajian.
4. Kode memenuhi standar linting dan build (`npm run lint` & `npm run build` sukses).
