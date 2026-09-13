"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Users, ShieldCheck, UserPlus, GraduationCap, Calendar, Clock, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total_students: 0, today_enrollments: 0, total_staff: 0, recent: [] });
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    axios.get("http://127.0.0.1:8000/api/dashboard")
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(err => {
        console.warn("Dashboard stats error:", err);
      });

    axios.get("http://127.0.0.1:8000/api/classes")
      .then(res => {
        if (res.data?.classes && Array.isArray(res.data.classes)) {
          setClasses(res.data.classes);
        }
      })
      .catch(err => {
        console.warn("Dashboard classes error:", err);
      });
  }, []);

  return (
    <div className="p-8 sm:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Real-time institute telemetry, class schedules, and gate attendance overview.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* Total Students */}
        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition group-hover:scale-110 text-slate-300">
            <Users size={64} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Students</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">{stats.total_students}</h2>
        </div>

        {/* Enrolled Today */}
        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition group-hover:scale-110 text-blue-400">
            <UserPlus size={64} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Enrolled Today</p>
          <h2 className="text-4xl sm:text-5xl font-black text-blue-400">{stats.today_enrollments}</h2>
        </div>

        {/* Class Schedule Tab Shortcut */}
        <Link
          href="/classes"
          className="bg-gradient-to-br from-blue-600 to-indigo-900 p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] block"
        >
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition group-hover:scale-110 text-white">
            <GraduationCap size={64} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2">Class Schedule</p>
            <ArrowRight size={14} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white">{classes.length}</h2>
          <p className="text-[11px] text-blue-200/80 font-medium mt-1">Active Scheduled Classes &rarr;</p>
        </Link>

        {/* Active Staff Members */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-900 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition group-hover:scale-110 text-white">
            <ShieldCheck size={64} />
          </div>
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-2">Active Staff Members</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">{stats.total_staff}</h2>
        </div>
      </div>

      {/* Two Column Grid: Recent Registrations & Class Timetable Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Enrolled Students */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus size={18} className="text-blue-400" />
              Recently Enrolled Students
            </h3>
            <Link href="/enroll" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition">
              + Enroll New
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recent.slice(0, 5).map((student: any) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.secure_barcode}</p>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold uppercase">Enrolled</span>
              </div>
            ))}
            {stats.recent.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No students registered yet.</p>}
          </div>
        </div>

        {/* Scheduled Classes Overview */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap size={18} className="text-emerald-400" />
              Active Class Schedule
            </h3>
            <Link href="/classes" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
              View All Tabs &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {classes.slice(0, 5).map((c: any) => (
              <div key={c.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{c.subject}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      c.fee_type === 'DAILY'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {c.fee_type === 'DAILY' ? 'Daily' : 'Monthly'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-300 font-medium">{c.teacher_name}</span>
                    {c.schedule_time && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={11} className="text-blue-400" />
                        {c.schedule_time}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-black text-emerald-400">
                    LKR {Number(c.fee_amount || 0).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400 block -mt-0.5">
                    {c.fee_type === 'DAILY' ? '/day' : '/mo'}
                  </span>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-sm">
                No classes scheduled yet.{" "}
                <Link href="/classes" className="text-blue-400 underline font-bold">
                  Schedule your first class
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}