# Arsitektur: Highlight Tanggal 20 (Switch Periode & Gajian) pada Kalender Presensi

## 1. File Terdampak
- `src/app/attendance/page.js` (Halaman Kalender Kehadiran & Riwayat Jurnal)
- `docs/ARCHITECTURE.md` (Dokumentasi Arsitektur)

## 2. Rincian Perubahan Komponen

### A. Komputasi Sel Kalender (`calendarCells`)
- Tambahkan flag `isPayday`: `const isPayday = day === 20;`.
- Teruskan `isPayday` ke dalam objek cell yang dikembalikan.

### B. Styling & Badge Sel Kalender
- **Sel Tanggal 20 Normal (Non-Today):**
  - Border: `border-amber-300/90`
  - Background: `bg-amber-50/25`
  - Hover: `hover:border-amber-400 hover:bg-amber-50/40`
  - Indikator khusus di pojok kanan atas / header cell:
    Badge pill emas `bg-amber-100/80 text-amber-800 border border-amber-300/70` dengan ikon `Coins` dan teks `Gajian`.
- **Sel Tanggal 20 jika Bertepatan Hari Ini (`isToday`):**
  - Kombinasi: `ring-2 ring-indigo-500 border-amber-400 bg-amber-50/30`
  - Badge `Gajian` tetap muncul jelas di samping nomor hari aktif.

### C. Legenda Kalender Presensi
- Di bawah / di samping grid kalender, sediakan baris info legenda:
  - Indikator Hadir, Izin, Sakit, Alfa
  - Indikator Emas `Tanggal 20: Switch Periode & Gajian (Cutoff Bulanan)`

### D. Modal Detail Tanggal 20
- Jika `cell.dateStr` memiliki `day === 20`:
  - Sisipkan kartu notifikasi di dalam modal:
    - Ikon `Coins` / `Wallet`
    - Judul: "Switch Periode & Hari Gajian"
    - Deskripsi: "Tanggal 20 merupakan batas akhir (cutoff) pembukuan dan evaluasi presensi bulanan, serta jadwal pencairan honor/gaji magang."

## 3. Rencana Pengujian
1. Verifikasi visual kalender:
   - Tanggal 20 pada bulan yang sedang dilihat memiliki badge `Coins` + `Gajian` serta aksen hangat amber.
   - Status presensi pada tanggal 20 (jika ada log) tetap tampil rapi di bagian bawah sel.
   - Jika tanggal 20 belum ada log, tetap tampil placeholder atau catatan dengan rapi.
2. Verifikasi interaksi modal:
   - Klik tanggal 20: Muncul banner kartu informasi Switch Periode & Gajian di dalam modal.
3. Verifikasi build:
   - Jalankan `npm run lint` dan `npm run build` untuk memastikan tidak ada syntax/import error.
