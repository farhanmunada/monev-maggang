"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Ambil data log dan join dengan tabel activities untuk mendapatkan kegiatan pertama sebagai title
        const { data, error } = await supabase
          .from("daily_logs")
          .select(`
            *,
            activities ( title )
          `)
          .order("date", { ascending: false });

        if (error) throw error;
        
        // Format data untuk history list
        const formattedLogs = data.map(log => ({
          id: log.id,
          date: log.date,
          attendance: log.attendance,
          // Ambil judul aktivitas pertama jika ada, jika tidak kosong
          title: log.activities && log.activities.length > 0 ? log.activities[0].title + (log.activities.length > 1 ? " & kegiatan lainnya" : "") : "-"
        }));

        setLogs(formattedLogs);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(search.toLowerCase()) || 
    log.attendance.toLowerCase().includes(search.toLowerCase()) ||
    log.date.includes(search)
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-1 md:mb-2">
          Riwayat Jurnal
        </h1>
        <p className="text-sm md:text-base text-secondary">Lihat kembali catatan aktivitas magang Anda sebelumnya dari database.</p>
      </header>

      {/* Pencarian */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-secondary" />
        </div>
        <input 
          type="text" 
          placeholder="Cari berdasarkan kata kunci atau status kehadiran..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-shadow"
        />
      </div>

      {/* Daftar Riwayat */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse"></div>
          ))
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-secondary bg-card border border-border rounded-2xl">
            Tidak ada riwayat yang ditemukan.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  log.attendance === "Hadir" ? "bg-green-100 text-green-700" :
                  log.attendance === "Izin" ? "bg-blue-100 text-blue-700" :
                  log.attendance === "Sakit" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary-600 transition-colors">
                    {log.title !== "-" ? log.title : `Status: ${log.attendance}`}
                  </h3>
                  <p className="text-sm text-secondary">
                    {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • <span className="font-medium">{log.attendance}</span>
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary-600 group-hover:translate-x-1 transition-transform" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
