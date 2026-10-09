# PRD: Modern Pixel-Glass Harmony, AI Multi-Day Recapper, Speed-Log, & Text Reduction

## 1. Tujuan (Objectives)
1. **Reduksi Teks Ekstrem (Glanceable UI):** Memangkas seluruh teks panjang dan penjelasan bertele-tele di seluruh halaman (`/`, `/daily-log`, `/ai-report`, `/notes`, `/attendance`), menggantikannya dengan visual pixel chips, counter kotak, dan micro-copy 1-baris.
2. **AI Multi-Day Recapper (`/ai-report`):** Menambahkan kemampuan perangkuman AI untuk rentang waktu: **Single Day**, **7 Hari Terakhir (Mingguan)**, dan **Periode Cutoff Tanggal 20 (Bulanan)** dalam 1-klik.
3. **Quick Floating Speed-Log (Global):** Menghadirkan tombol mini melayang `[+ SPEED LOG]` dan modal kilat untuk mencatat aktivitas harian seketika dari halaman mana pun tanpa navigasi rute.
4. **Harmonisasi Modern Pixel-Glass di `/notes` & `/ai-report`:** Menerapkan `.glass-panel`, border hairline kaca, dan aksen pixel tags tanpa garis tebal pada modul Notes dan AI Studio.

## 2. Spesifikasi Fitur (Scope)

### A. Quick Floating Speed-Log (`src/components/SpeedLogModal.js`)
- **Trigger:** Tombol melayang kaca di kanan bawah (`fixed bottom-20 right-5 z-30`):
  Tampilan pixel badge: `[⚡ SPEED LOG]`.
- **Modal Dialog:**
  - Glassmorphic popup (`bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl p-5`).
  - Shortcut preset chips 1-klik:
    `[⚡ STANDUP]`, `[💻 DEV]`, `[🐞 BUGFIX]`, `[🤝 MEETING]`, `[🧪 TESTING]`.
  - Input ringkas judul aktivitas (tekan Enter langsung submit ke daily log hari ini).
  - Feedback toast instan.

### B. AI Multi-Day Recapper (`src/app/ai-report/page.js`)
- **Range Mode Selector:**
  - `[HARI TERTENTU]`
  - `[7 HARI (PEKAN INI)]`
  - `[PERIODE GAJIAN (TGL 21 - 20)]`
- **Output:** AI merangkum seluruh aktivitas dalam rentang terpilih menjadi poin formal siap serah (kegiatan gabungan, refleksi kumulatif, kendala utama) dengan tombol copy 1-klik.

### C. Penyelarasan Modern Pixel-Glass di `/notes` (`src/app/notes/page.js` & komponen)
- Filter kategori menggunakan pixel tags: `[ALL]`, `[KEYWORD]`, `[MEETING]`, `[SNIPPET]`.
- Kartu catatan menggunakan `.glass-panel` tanpa garis tebal.
- Tampilan visual-first dengan ikon tipe dokumen.

### D. Eliminasi Text Bloat di Seluruh Halaman
- Pangkas sub-judul paragraf di `/daily-log`, `/attendance`, `/ai-report`, `/notes`, dan `/`.
- Ganti dengan tag pixel ringkas (`[SYS.WORKSPACE]`, `[DAILY.LOG]`, `[AI.STUDIO]`, `[KNOWLEDGE.VAULT]`).

## 3. Kriteria Penerimaan (Acceptance Criteria)
1. Terdapat tombol Speed-Log global yang bisa mencatat aktivitas ke Supabase dari halaman mana pun.
2. `/ai-report` mampu merangkum multi-hari (Mingguan & Periode Tgl 20).
3. Halaman `/notes` dan `/ai-report` tampil seragam dengan gaya Modern Pixel-Glass.
4. Tidak ada dinding teks penjelasan panjang di header halaman aplikasi.
5. `npm run lint` dan `npm run build` sukses 100%.
