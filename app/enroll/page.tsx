"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import IDCard from "@/components/IDCard";
import Link from "next/link";
import { Calendar, Clock, DollarSign, GraduationCap, User } from "lucide-react";

interface ClassItem {
    id: number;
    subject: string;
    grade_batch?: string;
    teacher_name?: string;
    teacher_contact?: string;
    schedule_time?: string;
    fee_type?: "MONTHLY" | "DAILY";
    fee_amount: number | string;
}

export default function EnrollPage() {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        parent_mobile: "",
        email: "",
        parent_email: "",
        classes: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const [classList, setClassList] = useState<ClassItem[]>([]);
    const [classesLoading, setClassesLoading] = useState(true);
    const [generatedCard, setGeneratedCard] = useState<any>(null);
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        // Fetch Institute Settings for Dynamic ID Card
        axios.get("http://127.0.0.1:8000/api/settings")
            .then((res) => {
                if (res.data?.settings) {
                    setSettings(res.data.settings);
                }
            })
            .catch((err) => console.error("Settings load error:", err));

        // Fetch Dynamic Active Classes - ONLY show real scheduled classes
        axios.get("http://127.0.0.1:8000/api/classes")
            .then((res) => {
                if (res.data?.classes && Array.isArray(res.data.classes)) {
                    setClassList(res.data.classes);
                } else {
                    setClassList([]);
                }
            })
            .catch((err) => {
                console.error("Classes load error:", err);
                setClassList([]);
            })
            .finally(() => setClassesLoading(false));
    }, []);

    // Calculate live daily & monthly fee totals
    const selectedClasses = classList.filter(c => formData.classes.includes(c.subject));
    const monthlySelected = selectedClasses.filter(c => (c.fee_type || "MONTHLY") === "MONTHLY");
    const dailySelected = selectedClasses.filter(c => c.fee_type === "DAILY");

    const totalMonthlyTuition = monthlySelected.reduce((acc, curr) => acc + Number(curr.fee_amount || 0), 0);
    const totalDailyTuition = dailySelected.reduce((acc, curr) => acc + Number(curr.fee_amount || 0), 0);
    const totalTuition = totalMonthlyTuition + totalDailyTuition;

    const handleClassToggle = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            classes: prev.classes.includes(subject)
                ? prev.classes.filter(c => c !== subject)
                : [...prev.classes, subject]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (!/^\d{10}$/.test(formData.mobile)) return Swal.fire("Invalid Input", "Student mobile must be exactly 10 digits.", "warning");
        if (!/^\d{10}$/.test(formData.parent_mobile)) return Swal.fire("Invalid Input", "Parent mobile must be exactly 10 digits.", "warning");
        if (classList.length === 0) return Swal.fire("No Classes Available", "Please add scheduled classes in Class Management before enrolling students.", "warning");
        if (formData.classes.length === 0) return Swal.fire("Required", "Please select at least one class.", "warning");

        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/students", formData);
            if (response.data.success) {
                setGeneratedCard(response.data.student);
                const sEmailStatus = response.data.email_1 === 'sent' ? '✅ Gate Pass QR Dispatched' : response.data.email_1;
                const pEmailStatus = formData.parent_email 
                    ? (response.data.email_2 === 'sent' ? '✅ Enrolled Copy Dispatched' : response.data.email_2)
                    : '⚪ Not provided (Optional)';

                Swal.fire({
                    icon: 'success',
                    title: 'Enrolled Successfully!',
                    html: `
                        <div style="text-align: left; font-size: 13px; line-height: 1.6; padding: 4px;">
                            <p style="margin:0 0 6px 0;"><b>Student ID Generated:</b> <span style="font-family:monospace; color:#2563eb; font-weight:700;">${response.data.student.secure_barcode}</span></p>
                            <p style="margin:0 0 10px 0;"><b>Enrolled Tuition:</b> <span style="font-weight:800; color:#0f172a;">${
                                totalMonthlyTuition > 0 && totalDailyTuition > 0
                                    ? `LKR ${totalMonthlyTuition.toLocaleString()}/mo + LKR ${totalDailyTuition.toLocaleString()}/day`
                                    : totalDailyTuition > 0
                                    ? `LKR ${totalDailyTuition.toLocaleString()} / day pass`
                                    : `LKR ${totalMonthlyTuition.toLocaleString()} / month`
                            }</span></p>
                            
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-top:8px;">
                                <p style="margin:0 0 6px 0;"><b>Student Email (Compulsory):</b><br><span style="color:#334155;">${formData.email}</span><br><small style="color:#059669; font-weight:700;">${sEmailStatus}</small></p>
                                <p style="margin:8px 0 0 0;"><b>Parent Email (Optional):</b><br><span style="color:#334155;">${formData.parent_email || "None"}</span><br><small style="color:#059669; font-weight:700;">${pEmailStatus}</small></p>
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#2563eb',
                    confirmButtonText: 'View ID Card'
                });
                setFormData({ name: "", mobile: "", parent_mobile: "", email: "", parent_email: "", classes: [] });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Registration Failed', text: 'Please check backend connection and inputs.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
            {/* Enrollment Form */}
            <div className="flex-[1.5] bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl print:hidden">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Register Student</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Fill student credentials & select enrolled batches</p>
                    </div>
                    <Link
                        href="/classes"
                        className="text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                    >
                        <GraduationCap className="w-4 h-4" />
                        Manage Classes
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 1. Full Name */}
                    <input
                        required
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500 transition"
                    />

                    {/* 2. Student & Parent Mobile (10 Digits) */}
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            required
                            type="text"
                            placeholder="Student Mobile (10 Digits)"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500 transition"
                        />
                        <input
                            required
                            type="text"
                            placeholder="Parent Mobile (10 Digits)"
                            value={formData.parent_mobile}
                            onChange={(e) => setFormData({ ...formData, parent_mobile: e.target.value })}
                            className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    {/* 3. Student Email (Compulsory) & Parent Email (Optional) */}
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            required
                            type="email"
                            placeholder="Student Email (Compulsory)"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500 transition"
                        />
                        <input
                            type="email"
                            placeholder="Parent Email (Optional)"
                            value={formData.parent_email}
                            onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                            className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    {/* 4. Schedule Classes (Dynamically Loaded with Teacher & Fee) */}
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Select Enrolled Classes & Batches
                            </h3>
                            <span className="text-[11px] font-semibold text-slate-400">
                                {formData.classes.length} selected
                            </span>
                        </div>

                        {classesLoading ? (
                            <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                                Loading scheduled classes and fee structures...
                            </div>
                        ) : classList.length === 0 ? (
                            <div className="p-6 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                                <GraduationCap className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-80" />
                                <p className="font-bold text-sm text-white">No Scheduled Classes Found</p>
                                <p className="text-xs text-slate-400 mt-1 mb-3">Please schedule your courses in Class Management before enrolling students.</p>
                                <Link href="/classes" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg">
                                    + Open Class Scheduling
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {classList.map((cls) => {
                                    const isSelected = formData.classes.includes(cls.subject);
                                    return (
                                        <div
                                            key={cls.id}
                                            onClick={() => handleClassToggle(cls.subject)}
                                            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                                isSelected
                                                    ? "bg-blue-500/15 border-blue-500/50 text-white shadow-sm"
                                                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}} // Handled by container click
                                                    className="w-4 h-4 rounded text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 pointer-events-none"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-bold text-white truncate">
                                                            {cls.subject}
                                                        </span>
                                                        {cls.grade_batch && (
                                                            <span className="text-[10px] font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                                                                {cls.grade_batch}
                                                            </span>
                                                        )}
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                                                            cls.fee_type === 'DAILY'
                                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                        }`}>
                                                            {cls.fee_type === 'DAILY' ? '☀️ Daily Pass' : '📅 Monthly'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                                                        {cls.teacher_name && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3 h-3 text-slate-500" />
                                                                {cls.teacher_name} {cls.teacher_contact && cls.teacher_contact !== 'N/A' ? `• 📞 ${cls.teacher_contact}` : ''}
                                                            </span>
                                                        )}
                                                        {cls.schedule_time && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-slate-500" />
                                                                {cls.schedule_time}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <div className="text-sm font-black text-emerald-400">
                                                    LKR {Number(cls.fee_amount || 0).toLocaleString()}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {cls.fee_type === 'DAILY' ? '/ day' : '/ month'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Live Total Fee Calculation Display */}
                        <div className="mt-3 pt-3 border-t border-white/10 bg-white/5 p-3.5 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-slate-200 block">Tuition Summary</span>
                                    <span className="text-[10px] text-slate-400">{selectedClasses.length} subjects selected</span>
                                </div>
                                <div className="text-right space-y-0.5">
                                    {totalMonthlyTuition > 0 && (
                                        <div className="text-xs font-semibold text-slate-300">
                                            Monthly: <span className="font-black text-emerald-400">LKR {totalMonthlyTuition.toLocaleString()}</span> <span className="text-[10px] text-slate-400">/mo</span>
                                        </div>
                                    )}
                                    {totalDailyTuition > 0 && (
                                        <div className="text-xs font-semibold text-slate-300">
                                            Daily Pass: <span className="font-black text-amber-400">LKR {totalDailyTuition.toLocaleString()}</span> <span className="text-[10px] text-slate-400">/day</span>
                                        </div>
                                    )}
                                    {totalMonthlyTuition === 0 && totalDailyTuition === 0 && (
                                        <span className="text-sm font-black text-white">LKR 0</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 text-sm uppercase tracking-wider transition disabled:opacity-50"
                    >
                        {loading ? "Processing Enrollment & QR Pass..." : "Submit & Generate Card"}
                    </button>
                </form>
            </div>

            {/* 6. Live ID Card Preview & Print */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 print:hidden">
                    Live ID Preview
                </h3>
                <div id="printable-card" className="shadow-2xl rounded-lg">
                    <IDCard
                        name={generatedCard?.name || formData.name || "STUDENT NAME"}
                        secureId={generatedCard?.secure_barcode || "NT-XXXX-00000000"}
                        cardTitle={settings?.card_title || settings?.name || "NOVA INSTITUTE"}
                        primaryColor={settings?.card_primary_color || "#1e3a8a"}
                        tagline={settings?.card_tagline || "Premium Education Center"}
                        footerText={settings?.card_footer_text || "Valid Access Pass"}
                    />
                </div>
                {generatedCard && (
                    <button
                        onClick={() => window.print()}
                        className="mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg text-sm uppercase tracking-wider transition print:hidden"
                    >
                        Print ID Card
                    </button>
                )}
            </div>
        </div>
    );
}