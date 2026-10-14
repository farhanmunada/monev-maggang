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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Kehadiran Magang */}
      <Link
        href="/attendance"
        className="brutal-card bg-white p-5 flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#a3e635] text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:-translate-y-0.5 transition-transform">
              <CalendarCheck2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-black tracking-tight">
                Tingkat Kehadiran
              </h3>
              <p className="text-[11px] font-mono text-slate-600">Rasio presensi resmi</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-black stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        <div className="space-y-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-black font-mono tracking-tight">
              {attendanceRate}%
            </span>
            <span className="text-xs font-black text-black font-mono bg-[#a3e635] px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000] rounded">
              {presentDays} / {totalLogs} HARI
            </span>
          </div>

          {/* Brutalist Progress bar */}
          <div className="w-full bg-white border-2 border-black rounded-lg h-3.5 overflow-hidden p-0.5 shadow-[2px_2px_0px_#000]">
            <div
              className="bg-[#a3e635] h-full rounded border-r border-black transition-all duration-500"
              style={{ width: `${Math.min(attendanceRate, 100)}%` }}
            />
          </div>

          {/* Breakdown pills */}
          <div className="flex items-center gap-1.5 pt-1 text-[10px] font-bold flex-wrap">
            <span className="pixel-badge bg-[#a3e635] text-black">
              {presentDays} HADIR
            </span>
            {leaveDays > 0 && (
              <span className="pixel-badge bg-[#8b5cf6] text-white">
                {leaveDays} IZIN
              </span>
            )}
            {sickDays > 0 && (
              <span className="pixel-badge bg-white text-black">
                {sickDays} SAKIT
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* 2. Total Kegiatan Terisi */}
      <Link
        href="/daily-log"
        className="brutal-card bg-white p-5 flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#8b5cf6] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:-translate-y-0.5 transition-transform">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-black tracking-tight">
                Log Kegiatan
              </h3>
              <p className="text-[11px] font-mono text-slate-600">Aktivitas & Maintenance</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-black stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        <div className="space-y-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-black font-mono tracking-tight">
              {totalActs}
            </span>
            <span className="text-xs font-black text-white font-mono bg-[#8b5cf6] px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000] rounded">
              ITEM TERCATAT
            </span>
          </div>

          {/* Status hari ini */}
          <div className="w-full bg-white border-2 border-black rounded-lg h-3.5 overflow-hidden p-0.5 shadow-[2px_2px_0px_#000]">
            <div
              className={`h-full rounded border-r border-black transition-all duration-500 ${
                isLoggedToday ? "bg-[#a3e635] w-full" : "bg-black w-1/3"
              }`}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
            <span className="font-bold text-black">
              Hari ini:{" "}
              <strong className={isLoggedToday ? "text-black font-black bg-[#a3e635] px-1 rounded border border-black" : "text-white font-black bg-black px-1 rounded"}>
                {isLoggedToday ? `${todayActsCount} kegiatan` : "Belum diisi"}
              </strong>
            </span>
            <span className="text-[10px] font-black text-slate-500">
              {totalLogs > 0 ? `~${Math.round((totalActs / totalLogs) * 10) / 10} / hari` : "-"}
            </span>
          </div>
        </div>
      </Link>

      {/* 3. Progres Task Kanban */}
      <Link
        href="/tasks"
        className="brutal-card bg-white p-5 flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#a3e635] text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:-translate-y-0.5 transition-transform">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-black tracking-tight">
                Eksekusi Task
              </h3>
              <p className="text-[11px] font-mono text-slate-600">Papan alur kerja kanban</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-black stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        <div className="space-y-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-black font-mono tracking-tight">
              {taskRate}%
            </span>
            <span className="text-xs font-black text-black font-mono bg-[#a3e635] px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000] rounded">
              {tasksDone} / {tasksTotal} DONE
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white border-2 border-black rounded-lg h-3.5 overflow-hidden p-0.5 shadow-[2px_2px_0px_#000]">
            <div
              className="bg-[#a3e635] h-full rounded border-r border-black transition-all duration-500"
              style={{ width: `${Math.min(taskRate, 100)}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[10px] font-bold flex-wrap">
            <span className="pixel-badge bg-[#a3e635] text-black">
              {tasksDone} SELESAI
            </span>
            {tasksInProgress > 0 && (
              <span className="pixel-badge bg-[#8b5cf6] text-white">
                {tasksInProgress} IN PROGRESS
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
