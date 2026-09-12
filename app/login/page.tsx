"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/login", formData);
            if (res.data.success) {
                // User data eka browser eke save karanawa
                localStorage.setItem("user", JSON.stringify(res.data.user));
                Swal.fire({ icon: 'success', title: 'Login Successful', timer: 1500, showConfirmButton: false });
                router.push("/"); // Dashboard ekata yanawa
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Invalid Email or Password!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Institute OS</h2>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2">Authorized Access Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email Address</label>
                        <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500" placeholder="admin@novatech.lk" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Password</label>
                        <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500" placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 text-sm uppercase transition">
                        {loading ? "Authenticating..." : "Secure Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}