"use client";

import { CalendarCheck2, Clock, CheckSquare, Zap } from "lucide-react";
import Link from "next/link";

export default function BentoTelemetry({ telemetry }) {
  const attendanceRate = telemetry?.attendanceRate ?? 100;
  const presentDays = telemetry?.presentDays ?? 0;
  const totalLogs = telemetry?.totalLogs ?? 0;
  const totalHours = telemetry?.totalHoursLogged ?? 0;
  const totalActs = telemetry?.totalActivitiesCount ?? 0;
  const tasksDone = telemetry?.tasks?.done ?? 0;
  const tasksTotal = telemetry?.tasks?.total ?? 0;
  const taskRate = telemetry?.tasks?.completionRate ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* Kehadiran */}
      <Link
        href="/attendance"
        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 md:p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500">Tingkat Hadir</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {attendanceRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {presentDays} dari {totalLogs} hari kerja tercatat
          </p>
        </div>
      </Link>

      {/* Akumulasi Jam Kerja */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500">Estimasi Jam</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalHours}
            </span>
            <span className="text-xs font-semibold text-slate-500">Jam</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Waktu tercurah pada aktivitas teknis
          </p>
        </div>
      </div>

      {/* Total Kegiatan */}
      <Link
        href="/daily-log"
        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 md:p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500">Kegiatan Terisi</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalActs}
            </span>
            <span className="text-xs font-semibold text-slate-500">Item</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Rincian aktivitas dalam daily log
          </p>
        </div>
      </Link>

      {/* Task Completion Rate */}
      <Link
        href="/tasks"
        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 md:p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500">Progres Task</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {taskRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {tasksDone} dari {tasksTotal} tugas diselesaikan
          </p>
        </div>
      </Link>
    </div>
  );
}
