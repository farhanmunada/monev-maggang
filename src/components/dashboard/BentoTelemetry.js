"use client";

import { CalendarCheck2, CheckSquare, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function BentoTelemetry({ telemetry }) {
  const attendanceRate = telemetry?.attendanceRate ?? 100;
  const presentDays = telemetry?.presentDays ?? 0;
  const leaveDays = telemetry?.leaveDays ?? 0;
  const sickDays = telemetry?.sickDays ?? 0;
  const totalLogs = telemetry?.totalLogs ?? 0;

  const totalActs = telemetry?.totalActivitiesCount ?? 0;
  const isLoggedToday = telemetry?.today?.isLogged;
  const todayActsCount = telemetry?.today?.activitiesCount ?? 0;

  const tasksDone = telemetry?.tasks?.done ?? 0;
  const tasksInProgress = telemetry?.tasks?.inProgress ?? 0;
  const tasksTotal = telemetry?.tasks?.total ?? 0;
  const taskRate = telemetry?.tasks?.completionRate ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Kehadiran Magang */}
      <Link
        href="/attendance"
        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Tingkat Kehadiran
              </h3>
              <p className="text-[11px] text-slate-400">Rasio presensi resmi</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {attendanceRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 font-mono">
              {presentDays} / {totalLogs} Hari Hadir
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(attendanceRate, 100)}%` }}
            />
          </div>

          {/* Breakdown pills */}
          <div className="flex items-center gap-1.5 pt-1 text-[10px] font-medium flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {presentDays} Hadir
            </span>
            {leaveDays > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                {leaveDays} Izin
              </span>
            )}
            {sickDays > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                {sickDays} Sakit
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* 2. Total Kegiatan Terisi */}
      <Link
        href="/daily-log"
        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Kegiatan Terdokumentasi
              </h3>
              <p className="text-[11px] text-slate-400">Rincian aktivitas logbook</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalActs}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Item Tercatat
            </span>
          </div>

          {/* Status hari ini */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isLoggedToday ? "bg-indigo-600 w-full" : "bg-amber-400 w-1/3"
              }`}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-500">
              Hari ini:{" "}
              <strong className={isLoggedToday ? "text-indigo-600 font-bold" : "text-amber-600 font-bold"}>
                {isLoggedToday ? `${todayActsCount} kegiatan` : "Belum diisi"}
              </strong>
            </span>
            <span className="text-[10px] text-slate-400">
              {totalLogs > 0 ? `~${Math.round((totalActs / totalLogs) * 10) / 10} / hari` : "-"}
            </span>
          </div>
        </div>
      </Link>

      {/* 3. Progres Task Kanban */}
      <Link
        href="/tasks"
        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Eksekusi Task
              </h3>
              <p className="text-[11px] text-slate-400">Papan pengerjaan kanban</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {taskRate}%
            </span>
            <span className="text-xs font-semibold text-purple-600 font-mono">
              {tasksDone} / {tasksTotal} Tuntas
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(taskRate, 100)}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[10px] font-medium flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
              {tasksDone} Selesai
            </span>
            {tasksInProgress > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                {tasksInProgress} Progress
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {tasksTotal - tasksDone - tasksInProgress} To Do
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
