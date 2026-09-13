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
        // Load user immediately from localStorage to show tabs without network delay
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {}
        }

        // Check if system is setup with safe error handling
        axios.get("http://127.0.0.1:8000/api/check-setup")
            .then(res => {
                const isSetup = res.data?.is_setup;
                const currentUser = localStorage.getItem("user");

                if (!isSetup && pathname !== "/setup") {
                    router.push("/setup");
                } else if (isSetup && pathname === "/setup") {
                    router.push("/login");
                } else if (isSetup) {
                    if (!currentUser && pathname !== "/login") {
                        router.push("/login");
                    } else if (currentUser) {
                        try {
                            setUser(JSON.parse(currentUser));
                        } catch (e) {}
                    }
                }
            })
            .catch(err => {
                console.warn("Setup verification skipped due to network:", err);
                const currentUser = localStorage.getItem("user");
                if (currentUser) {
                    try {
                        setUser(JSON.parse(currentUser));
                    } catch (e) {}
                }
            });
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (!isMounted) return null;
    const isAuthPage = pathname === "/login" || pathname === "/setup";

    const navItems = [
        {
            href: "/",
            label: "Dashboard",
            icon: LayoutDashboard,
            activeStyle: "bg-white/15 text-white shadow-lg shadow-black/30 border border-white/20",
            idleStyle: "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
        },
        {
            href: "/classes",
            label: "Class Schedule",
            icon: GraduationCap,
            activeStyle: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] border border-blue-400/40",
            idleStyle: "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
        },
        {
            href: "/scanner",
            label: "Gate Scanner",
            icon: ScanLine,
            activeStyle: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)] border border-emerald-400/40",
            idleStyle: "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
        },
        {
            href: "/enroll",
            label: "Enroll Student",
            icon: UserPlus,
            activeStyle: "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] border border-indigo-400/40",
            idleStyle: "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
        },
    ];

    return (
        <>
            {!isAuthPage && (
                <>
                    {/* Desktop Sidebar Navigation */}
                    <aside className="w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-6 shadow-2xl hidden lg:flex print:hidden flex-shrink-0">
                        <div>
                            <div className="pb-6 border-b border-white/10">
                                <h2 className="text-white font-black text-2xl tracking-tight">Institute OS</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                                        {user?.role === 'admin' ? "Super Admin" : "Staff Member"}
                                    </span>
                                    {user?.name && (
                                        <span className="text-[10.5px] text-slate-400 font-semibold truncate max-w-[130px]">
                                            {user.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <nav className="space-y-2.5 mt-8">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`group flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                                                isActive ? item.activeStyle : item.idleStyle
                                            }`}
                                        >
                                            <Icon size={19} className={`transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                            <span>{item.label}</span>
                                            {isActive && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                                            )}
                                        </Link>
                                    );
                                })}

                                {user?.role === 'admin' && (
                                    <Link
                                        href="/settings"
                                        className={`group flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                                            pathname === "/settings"
                                                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_10px_20px_rgba(245,158,11,0.3)] border border-amber-400/40"
                                                : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                                        }`}
                                    >
                                        <Settings size={19} className="group-hover:rotate-90 transition-transform" />
                                        <span>System Settings</span>
                                        {pathname === "/settings" && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                                        )}
                                    </Link>
                                )}
                            </nav>
                        </div>
                        <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                            <button onClick={handleLogout} className="flex items-center gap-2 justify-center w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl text-xs uppercase transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                                <LogOut size={16} /> Secure Logout
                            </button>
                        </div>
                    </aside>

                    {/* Mobile & Tablet Bottom Navigation Bar Tabs */}
                    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-3 py-2 flex items-center justify-around print:hidden shadow-2xl">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all ${
                                        isActive
                                            ? "text-blue-400 bg-blue-500/15 font-black scale-105"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label === "Class Schedule" ? "Schedule" : item.label}</span>
                                </Link>
                            );
                        })}
                        {user?.role === 'admin' && (
                            <Link
                                href="/settings"
                                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all ${
                                    pathname === "/settings"
                                        ? "text-amber-400 bg-amber-500/15 font-black scale-105"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </Link>
                        )}
                    </nav>
                </>
            )}
            <main className="flex-1 bg-[#020617] relative overflow-y-auto pb-20 lg:pb-0">
                {children}
            </main>
        </>
    );
}