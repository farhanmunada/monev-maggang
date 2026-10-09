# PRD: Modern Pixel-Glass Design System & Overhaul Kanban Tasks

## 1. Visi & Tujuan (Vision & Objectives)
1. **Konsep Desain "Modern Pixel-Glass":** Memadukan estetika *Frosted Glassmorphism* (kedalaman, translusensi, specular highlight) dengan aksen *Modern Pixelate* (pixel badges, status tags, pixel counters, retro-tech dot indicators) yang harmonis dengan karakter Walking Companions.
2. **Eliminasi Garis Tebal (Zero Thick Lines):** Menghapus seluruh border samping tebal (`border-l-4`), border ganda, atau garis gelap kaku di seluruh aplikasi. Menggantinya dengan hairline micro-border halus 1px dan specular rim cahaya kaca.
3. **UX Visual-First (Anti-Text Walls):** Menyajikan antarmuka yang langsung dipahami sekilas (scannable) melalui chip visual, ikon grafis, dan badge ringkas tanpa paragraf panjang yang melelahkan pengguna.
4. **Overhaul Total Halaman Task (`/tasks`):** Mengubah papan Kanban dari "UI Majapahit" menjadi kanban modern glassmorphic beraksen pixel yang estetik, ringan, dan interaktif.
5. **Peningkatan Aksesibilitas Navbar:** Memastikan font weight, kontras teks, touch target, dan keterbacaan menu navigasi tetap prima di segala kondisi pencahayaan dan scroll.

## 2. Cakupan Perubahan (Scope)

### A. Token Utilitas Desain Pixel-Glass (`src/app/globals.css`)
- `.pixel-badge`: Badge bergaya retro-pixel modern dengan font mono tebal, micro-border 1px, dan styling chip visual.
- `.pixel-counter`: Counter numerik digital kotak minimalis (`[02]`, `[05]`).
- Penghapusan border tebal di seluruh utilitas komponen.

### B. Overhaul Total Papan Kanban Tasks (`src/app/tasks/page.js`)
- **Kolom Kanban:** Menggunakan `glass-panel` dengan latar tembus cahaya aurora.
- **Kartu Tugas (Task Cards):**
  - Mengeliminasi `border-l-4` sepenuhnya.
  - Kartu berupa floating glass tile (`bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs hover:shadow-xs`).
  - Dilengkapi pixel status tag:
    - To Do: `[TODO]` (Slate/Gray Pixel Chip)
    - In Progress: `[WIP]` (Indigo/Blue Pixel Chip)
    - Done: `[DONE]` (Emerald Pixel Chip)
  - Interaksi drag & drop visual yang mulus dengan drop indicator glow.
- **KPI & Filter Bar:** Visual progress ring/bar dan quick search chip yang ringkas tanpa dinding teks.

### C. Pembersihan Garis Tebal di Seluruh Halaman Lainnya
- `src/app/attendance/page.js`: Memastikan sel kalender, modal, dan filter menggunakan border halus 1px tanpa garis tebal.
- `src/app/page.js` & dashboard widgets: Menjaga konsistensi hairline glass borders.

### D. Optimasi Aksesibilitas & Readability Navbar (`src/components/Navbar.js`)
- Mengoptimalkan warna teks inaktif (`text-slate-700 hover:text-slate-900`) dan aktif (`bg-slate-900 text-white`).
- Memperjelas kontras badge brand dan menu pills.

## 3. Kriteria Penerimaan (Acceptance Criteria)
1. Halaman `/tasks` tidak lagi memiliki border tebal `border-l-4` dan mengadopsi tema Modern Pixel-Glass seutuhnya.
2. Tidak ada garis tebal kaku di seluruh halaman aplikasi.
3. Tampilan visual kaya akan visual cues (chips, badge pixel, visual counters) sehingga pengguna tidak perlu membaca teks panjang.
4. Navbar menu memiliki keterbacaan (readability) dan aksesibilitas tinggi dengan interaksi scroll glassmorphic yang konsisten.
5. `npm run lint` dan `npm run build` sukses 100% tanpa error.
