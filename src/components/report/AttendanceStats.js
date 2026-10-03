export default function AttendanceStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <p className="text-xs text-slate-500 mb-1 font-medium">Hadir</p>
        <p className="text-xl md:text-2xl font-bold text-emerald-600 font-mono">
          {stats.hadir} <span className="text-xs font-normal text-slate-400">Hari</span>
        </p>
      </div>
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <p className="text-xs text-slate-500 mb-1 font-medium">Izin</p>
        <p className="text-xl md:text-2xl font-bold text-blue-600 font-mono">
          {stats.izin} <span className="text-xs font-normal text-slate-400">Hari</span>
        </p>
      </div>
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <p className="text-xs text-slate-500 mb-1 font-medium">Sakit</p>
        <p className="text-xl md:text-2xl font-bold text-amber-600 font-mono">
          {stats.sakit} <span className="text-xs font-normal text-slate-400">Hari</span>
        </p>
      </div>
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <p className="text-xs text-slate-500 mb-1 font-medium">Alfa</p>
        <p className="text-xl md:text-2xl font-bold text-rose-600 font-mono">
          {stats.alfa} <span className="text-xs font-normal text-slate-400">Hari</span>
        </p>
      </div>
    </div>
  );
}
