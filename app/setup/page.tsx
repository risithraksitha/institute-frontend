"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ShieldCheck } from "lucide-react";

export default function SetupPage() {
    const [formData, setFormData] = useState({ institute_name: "", admin_name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strong Password Validation (Kalin illapu constraint eka)
        const pwd = formData.password;
        if (pwd.length < 8) return Swal.fire("Weak Password", "Password must be at least 8 characters long.", "warning");
        if (/(1234|9876|0000|1111|password|admin)/i.test(pwd)) return Swal.fire("Weak Password", "Do not use common sequences like 1234, 0000, or 'password'.", "warning");

        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/setup", formData);
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'System Initialized!', text: 'Super Admin created successfully. Please login.', confirmButtonColor: '#10b981' });
                router.push("/login"); // Setup eken passe login ekata yanawa
            }
        } catch (error) {
            Swal.fire("Setup Failed", "System might already be setup.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] w-full max-w-xl">
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-4"><ShieldCheck size={32} /></div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">System Startup</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">One-Time Super Admin Initialization</p>
                </div>

                <form onSubmit={handleSetup} className="space-y-6">
                    <input required type="text" placeholder="Institute Name (e.g. NovaTech Academy)" value={formData.institute_name} onChange={(e) => setFormData({ ...formData, institute_name: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition" />
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="text" placeholder="Admin Full Name" value={formData.admin_name} onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition" />
                        <input required type="email" placeholder="Admin Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition" />
                    </div>
                    <div>
                        <input required type="password" placeholder="Secure Password (Min 8 Chars, No 1234)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition" />
                        <p className="text-[10px] text-emerald-500/70 mt-2">* This account cannot be deleted. Store credentials safely.</p>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-4 text-sm uppercase transition transform hover:-translate-y-1 hover:scale-[1.02]">
                        {loading ? "Initializing..." : "Complete System Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}