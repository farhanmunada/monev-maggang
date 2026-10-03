export default function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-0.5">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-slate-900 font-mono">{value}</p>
      </div>
    </div>
  );
}
