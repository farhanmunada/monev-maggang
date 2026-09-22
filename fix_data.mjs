import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials missing!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixData() {
  console.log("Memulai perbaikan data...");

  // 1. Data untuk tanggal 21 Sept
  const date21 = '2026-09-21';
  const { data: log21, error: err21 } = await supabase
    .from('daily_logs')
    .update({ learning: 'Instaal aplikasi pendukung pekerjaan team' })
    .eq('date', date21)
    .select()
    .single();

  if (log21) {
    // Hapus semua activity lama untuk tanggal 21
    await supabase.from('activities').delete().eq('daily_log_id', log21.id);
    
    // Insert activity yang benar
    await supabase.from('activities').insert([
      { daily_log_id: log21.id, time_range: '', title: 'Install aplikasi Navicat', description: 'Other - Selesai' },
      { daily_log_id: log21.id, time_range: '', title: 'Install aplikasi VNC Server', description: 'Other - Selesai' },
      { daily_log_id: log21.id, time_range: '', title: 'Setup IP address', description: 'Other - Selesai' },
    ]);
    console.log("Data 21 Sept berhasil diperbaiki!");
  } else {
    console.log("Gagal mencari log tanggal 21", err21);
  }

  // 2. Data untuk tanggal 22 Sept
  const date22 = '2026-09-22';
  const { data: log22, error: err22 } = await supabase
    .from('daily_logs')
    .update({ learning: 'Penggunaan prisma, setup prisma, pemilihan arsitektur pendukung' })
    .eq('date', date22)
    .select()
    .single();

  if (log22) {
    // Hapus semua activity lama untuk tanggal 22
    await supabase.from('activities').delete().eq('daily_log_id', log22.id);
    
    // Insert activity yang benar
    await supabase.from('activities').insert([
      { daily_log_id: log22.id, time_range: '7:00', title: 'setup database sistem', description: 'Coding / Development - Selesai' },
      { daily_log_id: log22.id, time_range: '', title: 'Develop backend sistem', description: 'Coding / Development - Selesai' },
    ]);
    console.log("Data 22 Sept berhasil diperbaiki!");
  } else {
    console.log("Gagal mencari log tanggal 22", err22);
  }
}

fixData().then(() => console.log("Proses selesai."));
