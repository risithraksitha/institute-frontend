"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Users, ShieldCheck, UserPlus, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total_students: 0, today_enrollments: 0, total_staff: 0, recent: [] });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    axios.get("http://127.0.0.1:8000/api/dashboard").then(res => {
      setStats(res.data);
    });
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">Welcome back, {user?.name || "Admin"}</h1>
        <p className="text-slate-400 mt-2 text-sm">Here is the real-time data for your institute.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition group-hover:scale-110"><Users size={80} /></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Students</p>
          <h2 className="text-5xl font-black text-white">{stats.total_students}</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition group-hover:scale-110"><UserPlus size={80} /></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Enrolled Today</p>
          <h2 className="text-5xl font-black text-blue-400">{stats.today_enrollments}</h2>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-900 p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition group-hover:scale-110"><ShieldCheck size={80} /></div>
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-2">Active Staff Members</p>
          <h2 className="text-5xl font-black text-white">{stats.total_staff}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Recently Enrolled Students</h3>
          <div className="space-y-4">
            {stats.recent.map((student: any) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-white">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{student.secure_barcode}</p>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold uppercase">Enrolled</span>
              </div>
            ))}
            {stats.recent.length === 0 && <p className="text-sm text-slate-500">No students registered yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}