"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BookOpen, Calendar, Clock, DollarSign, Plus, Trash2, User, GraduationCap, Layers } from "lucide-react";

interface ClassItem {
    id: number;
    subject: string;
    grade_batch: string;
    teacher_name: string;
    teacher_contact: string;
    schedule_time: string;
    fee_type?: "MONTHLY" | "DAILY";
    fee_amount: number;
}

const timeSlots = [
    "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM",
    "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM",
    "08:30 PM", "09:00 PM"
];

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        subject: "",
        grade_batch: "",
        teacher_name: "",
        teacher_contact: "",
        fee_type: "MONTHLY" as "MONTHLY" | "DAILY",
        schedule_day: "Every Saturday",
        start_time: "08:00 AM",
        end_time: "01:00 PM",
        schedule_time: "Every Saturday 08:00 AM - 01:00 PM",
        use_custom_schedule: false,
        fee_amount: ""
    });

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/classes");
            if (res.data.success) {
                setClasses(res.data.classes);
            }
        } catch (error) {
            console.error("Failed to load classes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.fee_amount) {
            return Swal.fire("Required Fields", "Class Name and Fee are required.", "warning");
        }

        setSubmitting(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/classes", {
                ...form,
                fee_amount: parseFloat(form.fee_amount)
            });

            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Class Scheduled!",
                    text: `${form.subject} added to active courses (${form.fee_type === 'DAILY' ? 'Daily Fee' : 'Monthly Fee'}).`,
                    confirmButtonColor: "#2563eb"
                });
                setForm({
                    subject: "",
                    grade_batch: "",
                    teacher_name: "",
                    teacher_contact: "",
                    fee_type: "MONTHLY",
                    schedule_day: "Every Saturday",
                    start_time: "08:00 AM",
                    end_time: "01:00 PM",
                    schedule_time: "Every Saturday 08:00 AM - 01:00 PM",
                    use_custom_schedule: false,
                    fee_amount: ""
                });
                fetchClasses();
            }
        } catch (error) {
            Swal.fire("Error", "Could not create class. Please check server.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClass = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: "Delete Class?",
            text: `Are you sure you want to remove "${name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, Remove"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/classes/${id}`);
                Swal.fire({ icon: "success", title: "Class Removed", timer: 1500, showConfirmButton: false });
                fetchClasses();
            } catch (error) {
                Swal.fire("Error", "Failed to delete class.", "error");
            }
        }
    };

    const totalFees = classes.reduce((acc, c) => acc + Number(c.fee_amount), 0);
    const avgFee = classes.length > 0 ? Math.round(totalFees / classes.length) : 0;

    return (
        <div className="p-8 sm:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header & Stats */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <GraduationCap className="text-blue-500 w-10 h-10" />
                    Class Scheduling & Fee Management
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Configure curriculum courses, assign instructors, define batch schedules, and establish tuition rates.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Classes</p>
                        <h3 className="text-3xl font-black text-white mt-1">{classes.length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <BookOpen size={24} />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade Batches</p>
                        <h3 className="text-3xl font-black text-emerald-400 mt-1">
                            {new Set(classes.map(c => c.grade_batch)).size}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Layers size={24} />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Tuition</p>
                        <h3 className="text-3xl font-black text-indigo-400 mt-1">
                            LKR {avgFee.toLocaleString()}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form to Add Class (5 cols) */}
                <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl h-fit">
                    <h2 className="text-xl font-black text-white tracking-tight mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-blue-400" />
                        Create Class Schedule
                    </h2>

                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class / Subject Name *</label>
                            <input
                                required
                                type="text"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="e.g. Advanced Level - Combined Mathematics"
                                className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grade / Batch *</label>
                            <input
                                required
                                type="text"
                                name="grade_batch"
                                value={form.grade_batch}
                                onChange={handleChange}
                                placeholder="e.g. 2026 A/L Revision Batch"
                                className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teacher Name *</label>
                                <input
                                    required
                                    type="text"
                                    name="teacher_name"
                                    value={form.teacher_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Dr. K. Jayawardena"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teacher Contact *</label>
                                <input
                                    required
                                    type="text"
                                    name="teacher_contact"
                                    value={form.teacher_contact}
                                    onChange={handleChange}
                                    placeholder="e.g. 077-1234567"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* Fee Billing Frequency Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Fee Billing Cycle *
                            </label>
                            <div className="grid grid-cols-2 gap-2 bg-black/30 p-1.5 rounded-xl border border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, fee_type: "MONTHLY" }))}
                                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                        form.fee_type === "MONTHLY"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Calendar size={14} />
                                    Monthly Fee
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, fee_type: "DAILY" }))}
                                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                        form.fee_type === "DAILY"
                                            ? "bg-amber-600 text-white shadow-md"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Clock size={14} />
                                    Day / Daily Fee
                                </button>
                            </div>
                        </div>

                        {/* Fee Amount (LKR) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {form.fee_type === "DAILY" ? "Daily Fee (LKR) *" : "Monthly Tuition (LKR) *"}
                                </label>
                                <span className="text-[10px] font-semibold text-slate-400">
                                    {form.fee_type === "DAILY" ? "Renewed daily at gate" : "Renewed monthly"}
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">LKR</span>
                                <input
                                    required
                                    type="number"
                                    name="fee_amount"
                                    value={form.fee_amount}
                                    onChange={handleChange}
                                    placeholder={form.fee_type === "DAILY" ? "e.g. 500" : "e.g. 4500"}
                                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3 pl-12 text-sm text-white font-bold outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* Schedule Time - Structured Dropdowns */}
                        <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Schedule Time & Day
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, use_custom_schedule: !prev.use_custom_schedule }))}
                                    className="text-[10.5px] text-blue-400 hover:text-blue-300 font-bold underline transition cursor-pointer"
                                >
                                    {form.use_custom_schedule ? "Use Dropdowns" : "Manual Input"}
                                </button>
                            </div>

                            {!form.use_custom_schedule ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Day of Week
                                        </label>
                                        <select
                                            name="schedule_day"
                                            value={form.schedule_day}
                                            onChange={(e) => {
                                                const day = e.target.value;
                                                setForm(prev => ({
                                                    ...prev,
                                                    schedule_day: day,
                                                    schedule_time: `${day} ${prev.start_time} - ${prev.end_time}`
                                                }));
                                            }}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition cursor-pointer"
                                        >
                                            <option value="Every Monday">Every Monday</option>
                                            <option value="Every Tuesday">Every Tuesday</option>
                                            <option value="Every Wednesday">Every Wednesday</option>
                                            <option value="Every Thursday">Every Thursday</option>
                                            <option value="Every Friday">Every Friday</option>
                                            <option value="Every Saturday">Every Saturday</option>
                                            <option value="Every Sunday">Every Sunday</option>
                                            <option value="Weekdays (Mon-Fri)">Weekdays (Mon - Fri)</option>
                                            <option value="Weekends (Sat-Sun)">Weekends (Sat - Sun)</option>
                                            <option value="Daily (All 7 Days)">Daily (All 7 Days)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                Start Time
                                            </label>
                                            <select
                                                name="start_time"
                                                value={form.start_time}
                                                onChange={(e) => {
                                                    const st = e.target.value;
                                                    setForm(prev => ({
                                                        ...prev,
                                                        start_time: st,
                                                        schedule_time: `${prev.schedule_day} ${st} - ${prev.end_time}`
                                                    }));
                                                }}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition cursor-pointer"
                                            >
                                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                End Time
                                            </label>
                                            <select
                                                name="end_time"
                                                value={form.end_time}
                                                onChange={(e) => {
                                                    const et = e.target.value;
                                                    setForm(prev => ({
                                                        ...prev,
                                                        end_time: et,
                                                        schedule_time: `${prev.schedule_day} ${prev.start_time} - ${et}`
                                                    }));
                                                }}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition cursor-pointer"
                                            >
                                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                                        <span className="text-slate-400 text-[11px]">Schedule:</span>
                                        <span className="font-bold text-blue-400 font-mono text-[11.5px]">{form.schedule_time}</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        required
                                        type="text"
                                        name="schedule_time"
                                        value={form.schedule_time}
                                        onChange={handleChange}
                                        placeholder="e.g. Saturdays 8:00 AM - 1:00 PM"
                                        className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? "Saving Class..." : "Schedule Course"}
                        </button>
                    </form>
                </div>

                {/* Active Courses List (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                            <BookOpen size={20} className="text-emerald-400" />
                            Active Scheduled Classes
                        </h2>
                        <span className="text-xs text-slate-400">{classes.length} Courses Offered</span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading scheduled classes...</div>
                    ) : classes.length === 0 ? (
                        <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 text-slate-400">
                            No classes scheduled yet. Add your first class using the form on the left.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {classes.map((c) => (
                                <div
                                    key={c.id}
                                    className="bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-bold text-white tracking-tight">{c.subject}</h3>
                                            <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full uppercase">
                                                {c.grade_batch}
                                            </span>
                                            {c.fee_type === "DAILY" ? (
                                                <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                                                    ☀️ Daily Pass
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                                                    📅 Monthly
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                                            <span className="flex items-center gap-1.5 text-slate-400">
                                                <User size={14} className="text-emerald-400" />
                                                <b className="text-white">{c.teacher_name}</b> ({c.teacher_contact})
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-400">
                                                <Clock size={14} className="text-blue-400" />
                                                {c.schedule_time}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-end sm:self-center">
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                                {c.fee_type === "DAILY" ? "Day Fee" : "Monthly Fee"}
                                            </span>
                                            <span className="text-lg font-black text-emerald-400">
                                                LKR {Number(c.fee_amount).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block -mt-1">
                                                {c.fee_type === "DAILY" ? "/ day" : "/ month"}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteClass(c.id, c.subject)}
                                            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                                            title="Delete Class"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
