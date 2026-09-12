"use client";
import Link from "next/link";
import axios from "axios";
import { LayoutDashboard, UserPlus, ScanLine, Settings, LogOut, UsersRound, GraduationCap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Check if system is setup
        axios.get("http://127.0.0.1:8000/api/check-setup").then(res => {
            const isSetup = res.data.is_setup;
            const storedUser = localStorage.getItem("user");

            if (!isSetup && pathname !== "/setup") {
                router.push("/setup"); // Setup wela nathnam setup ekata force karanawa
            } else if (isSetup && pathname === "/setup") {
                router.push("/login"); // Setup wela nam aith setup yanna ba
            } else if (isSetup) {
                if (!storedUser && pathname !== "/login") router.push("/login");
                else if (storedUser) setUser(JSON.parse(storedUser));
            }
        });
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (!isMounted) return null;
    const isAuthPage = pathname === "/login" || pathname === "/setup";

    return (
        <>
            {!isAuthPage && (
                <aside className="w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-6 shadow-2xl hidden lg:flex print:hidden">
                    <div>
                        <div className="pb-6 border-b border-white/10">
                            <h2 className="text-white font-black text-2xl tracking-tight">Institute OS</h2>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-2 inline-block">
                                {user?.role === 'admin' ? "Super Admin" : "Staff Member"}
                            </span>
                        </div>

                        <nav className="space-y-3 mt-8">
                            {/* Added Floating Hover Effects Here */}
                            <Link href="/" className="group flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:text-white"><LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" /> Dashboard</Link>
                            <Link href="/scanner" className="group flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-800 text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_20px_rgba(16,185,129,0.3)]"><ScanLine size={20} className="group-hover:rotate-12 transition-transform" /> Gate Scanner</Link>
                            <Link href="/enroll" className="group flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)]"><UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> Enroll Student</Link>

                            {user?.role === 'admin' && (
                                <>
                                    <Link href="/classes" className="group flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:text-white"><GraduationCap size={20} className="group-hover:scale-110 transition-transform text-blue-400" /> Class Scheduling</Link>
                                    <Link href="/settings" className="group flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:text-white"><Settings size={20} className="group-hover:rotate-90 transition-transform" /> System Settings</Link>
                                </>
                            )}
                        </nav>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                        <button onClick={handleLogout} className="flex items-center gap-2 justify-center w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl text-xs uppercase transition-all duration-300 hover:-translate-y-1"><LogOut size={16} /> Secure Logout</button>
                    </div>
                </aside>
            )}
            <main className="flex-1 bg-[#020617] relative overflow-y-auto">
                {children}
            </main>
        </>
    );
}