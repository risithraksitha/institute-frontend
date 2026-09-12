"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import IDCard from "@/components/IDCard";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [staffData, setStaffData] = useState({ name: "", email: "", password: "" });
    const [formData, setFormData] = useState({
        smtp_host: "smtp.gmail.com",
        smtp_port: "587",
        smtp_username: "",
        smtp_password: "",
        template_welcome: "Welcome {name}! Your secure ID is {barcode}.",
        template_scan_in: "Dear Parent, {name} scanned in at {time}. Status: {status}.",
        card_title: "NOVA INSTITUTE",
        card_primary_color: "#1e3a8a",
        card_tagline: "Premium Education Center",
        card_footer_text: "Valid Access Pass"
    });

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/settings").then((res) => {
            if (res.data?.settings) {
                setFormData(prev => ({
                    ...prev,
                    ...res.data.settings,
                    card_title: res.data.settings.card_title || res.data.settings.name || prev.card_title
                }));
            }
        }).catch(err => console.error("Error loading settings:", err));
    }, []);

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleStaffChange = (e: any) => setStaffData({ ...staffData, [e.target.name]: e.target.value });

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/settings", formData);
            Swal.fire({
                icon: "success",
                title: "Settings Saved!",
                text: "System configurations and ID card styling updated.",
                confirmButtonColor: "#2563eb"
            });
        } catch (error) {
            Swal.fire("Error", "Failed to save settings.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/api/staff", staffData);
            Swal.fire({
                icon: "success",
                title: "Staff Added!",
                text: "Staff member created and access email dispatched.",
                confirmButtonColor: "#10b981"
            });
            setStaffData({ name: "", email: "", password: "" });
        } catch (error) {
            Swal.fire("Error", "Could not add staff member.", "error");
        }
    };

    return (
        <div className="p-8 sm:p-10 max-w-7xl mx-auto flex flex-col xl:flex-row gap-10">
            <div className="flex-1 space-y-10">
                {/* Settings Form */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-6">System Configuration</h2>
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        {/* ID Card Customization */}
                        <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">
                                Dynamic ID Card Customization
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Institute Title / Name on Card *
                                    </label>
                                    <input
                                        type="text"
                                        name="card_title"
                                        value={formData.card_title || ""}
                                        onChange={handleChange}
                                        placeholder="Institute Name on Card (e.g. SAKYA, NOVA INSTITUTE)"
                                        className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 font-bold uppercase transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Theme Primary Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="card_primary_color"
                                            value={formData.card_primary_color || "#1e3a8a"}
                                            onChange={handleChange}
                                            className="w-14 h-11 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-slate-300 font-bold">
                                            {formData.card_primary_color}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Card Tagline
                                    </label>
                                    <input
                                        type="text"
                                        name="card_tagline"
                                        value={formData.card_tagline || ""}
                                        onChange={handleChange}
                                        placeholder="Tagline (e.g. Higher Education Centre)"
                                        className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Card Footer Badge Text
                                    </label>
                                    <input
                                        type="text"
                                        name="card_footer_text"
                                        value={formData.card_footer_text || ""}
                                        onChange={handleChange}
                                        placeholder="Footer Text (e.g. Valid Access Pass)"
                                        className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SMTP Email Setup */}
                        <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">
                                Official SMTP Email Setup
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    name="smtp_username"
                                    value={formData.smtp_username || ""}
                                    onChange={handleChange}
                                    placeholder="SMTP Username (e.g. gmail address)"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 transition"
                                />
                                <input
                                    type="password"
                                    name="smtp_password"
                                    value={formData.smtp_password || ""}
                                    onChange={handleChange}
                                    placeholder="Google App Password (16 chars)"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 transition"
                                />
                            </div>
                        </div>

                        {/* Custom Text Templates */}
                        <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">Custom Text Templates</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Welcome Text</label>
                                    <textarea name="template_welcome" value={formData.template_welcome || ""} onChange={handleChange} className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none h-16" placeholder="Welcome Email"></textarea>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Scan-In Parent Alert Template</label>
                                    <textarea name="template_scan_in" value={formData.template_scan_in || ""} onChange={handleChange} className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none h-16" placeholder="Scan In Email"></textarea>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg text-sm uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Saving Settings..." : "Save Configurations"}
                        </button>
                    </form>
                </div>

                {/* Add Staff Section */}
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-6">Create Staff Account</h2>
                    <form onSubmit={handleAddStaff} className="space-y-4">
                        <input required type="text" name="name" value={staffData.name} onChange={handleStaffChange} placeholder="Staff Name" className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
                        <input required type="email" name="email" value={staffData.email} onChange={handleStaffChange} placeholder="Staff Email" className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
                        <input required type="password" name="password" value={staffData.password} onChange={handleStaffChange} placeholder="Password" className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg text-sm uppercase tracking-wider transition cursor-pointer">Add Staff Member</button>
                    </form>
                </div>
            </div>

            {/* Live ID Card Preview */}
            <div className="flex flex-col items-center justify-start pt-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Live ID Card Preview</h3>
                <div className="sticky top-10 shadow-2xl rounded-lg">
                    <IDCard
                        name="SAMPLE STUDENT"
                        secureId="NT-7834-60715164"
                        cardTitle={formData.card_title || "NOVA INSTITUTE"}
                        primaryColor={formData.card_primary_color || "#1e3a8a"}
                        tagline={formData.card_tagline || "Higher Education Centre"}
                        footerText={formData.card_footer_text || "Valid Access Pass"}
                    />
                    <p className="text-[11px] text-slate-400 text-center mt-4">
                        Preview updates live as you type the institute name.
                    </p>
                </div>
            </div>
        </div>
    );
}
