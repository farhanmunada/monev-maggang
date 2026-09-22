import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
  console.error("Supabase credentials are not correctly set in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertData() {
  const records = [
    {
      date: '2026-09-21',
      attendance: 'Hadir',
      obstacle: 'ada dirver pendukung yang belum terinstall',
      learning: '',
      activityTitle: 'Instaal aplikasi pendukung pekerjaan team'
    },
    {
      date: '2026-09-22',
      attendance: 'Hadir',
      obstacle: 'Prisma tidak bisa konek, dan dikembalikan menggunakan raw sql',
      learning: '',
      activityTitle: 'Penggunaan prisma, setup prisma, pemilihan arsitektur pendukung'
    }
  ];

  for (const record of records) {
    console.log(`Inserting log for ${record.date}...`);
    // 1. Insert ke daily_logs
    const { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .upsert({
        date: record.date,
        attendance: record.attendance,
        obstacle: record.obstacle,
        learning: record.learning
      }, { onConflict: 'date' })
      .select()
      .single();

    if (logError) {
      console.error("Error inserting daily_log:", logError);
      continue;
    }

    // 2. Insert ke activities
    const { error: actError } = await supabase
      .from('activities')
      .insert({
        daily_log_id: logData.id,
        time_range: 'Sepanjang hari',
        title: record.activityTitle,
        description: ''
      });

    if (actError) {
      console.error("Error inserting activity:", actError);
    } else {
      console.log(`Success: ${record.date} inserted!`);
    }
  }
}

insertData().then(() => console.log("Done."));
