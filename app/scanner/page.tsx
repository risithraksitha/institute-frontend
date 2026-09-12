"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function ScannerPage() {
    const [scannedId, setScannedId] = useState("");
    const [cameraStatus, setCameraStatus] = useState<"starting" | "running" | "error">("starting");
    const [errorMessage, setErrorMessage] = useState("");
    const [retryTrigger, setRetryTrigger] = useState(0);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessingRef = useRef(false);

    const safePause = () => {
        try {
            if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
                scannerRef.current.pause(true);
            }
        } catch (err) {
            console.warn("Scanner pause suppressed:", err);
        }
    };

    const safeResume = () => {
        try {
            if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.PAUSED) {
                scannerRef.current.resume();
            }
        } catch (err) {
            console.warn("Scanner resume suppressed:", err);
        }
    };

    const playBeep = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const audioCtx = new AudioContextClass();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz beep
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
        } catch {
            // Audio permission ignored
        }
    };

    const processScan = async (barcode: string) => {
        setScannedId(barcode);
        try {
            const now = new Date();
            const clientTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            const clientDate = now.toISOString().split('T')[0];

            const response = await axios.post("http://127.0.0.1:8000/api/scan", { 
                barcode,
                client_time: clientTime,
                client_date: clientDate
            });
            const { 
                student, 
                attendance, 
                payment, 
                is_paid, 
                current_month, 
                enrolled_classes, 
                total_fee,
                billing_cycle,
                due_period,
                due_amount,
                payment_month_param,
                period_type_param
            } = response.data;

            const finalAmount = Number(due_amount !== undefined ? due_amount : (payment?.amount || total_fee || 0));
            const activeBillingCycle = billing_cycle || 'MONTHLY';
            const activePeriodName = due_period || (activeBillingCycle === 'DAILY' ? 'Today' : current_month);
            const activeMonthParam = payment_month_param || current_month;
            const activePeriodType = period_type_param || activeBillingCycle;

            const isNewCheckIn = attendance?.status === 'MARKED';
            const currentTimeDisplay = attendance?.current_scan_time || attendance?.time || clientTime;
            const firstCheckInDisplay = attendance?.first_scan_time || attendance?.time || currentTimeDisplay;

            const attendanceBadge = isNewCheckIn
                ? `<div style="background:#ecfdf5; border:1px solid #6ee7b7; padding:12px 14px; border-radius:12px; margin-top:12px; color:#065f46; font-size:13px; font-weight:700; text-align:center;">
                    ✅ Gate Check-In Recorded: TODAY at ${currentTimeDisplay}
                   </div>`
                : `<div style="background:#eff6ff; border:1px solid #93c5fd; padding:12px 14px; border-radius:12px; margin-top:12px; color:#1e40af; font-size:13px; font-weight:700; text-align:center;">
                    <div>ℹ️ Gate Clearance Verified: TODAY at ${currentTimeDisplay}</div>
                    <div style="font-size:11px; font-weight:600; color:#3b82f6; margin-top:3px;">
                        Initial gate entry logged today at ${firstCheckInDisplay}
                    </div>
                   </div>`;

            // Itemized Enrolled Classes Breakdown
            const classesList: any[] = enrolled_classes && Array.isArray(enrolled_classes) && enrolled_classes.length > 0 
                ? enrolled_classes 
                : [];

            let classesHtml = '';
            if (classesList.length > 0) {
                const itemsHtml = classesList.map((c: any) => {
                    const isDaily = (c.fee_type || '').toUpperCase() === 'DAILY';
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; font-size:12px; border-bottom:1px dashed #e2e8f0; padding-bottom:6px;">
                            <div>
                                <div style="font-weight:700; color:#1e293b;">${c.subject}</div>
                                <div style="font-size:10.5px; color:#64748b; margin-top:2px;">
                                    ${c.grade_batch ? `<span style="background:#e2e8f0; padding:1px 5px; border-radius:4px; font-weight:600; margin-right:4px;">${c.grade_batch}</span>` : ''}
                                    <span style="background:${isDaily ? '#fef3c7' : '#e0e7ff'}; color:${isDaily ? '#92400e' : '#3730a3'}; border:1px solid ${isDaily ? '#fde68a' : '#c7d2fe'}; padding:1px 5px; border-radius:4px; font-weight:700; font-size:9.5px; margin-right:4px;">
                                        ${isDaily ? '☀️ Daily Pass' : '📅 Monthly'}
                                    </span>
                                    👨‍🏫 ${c.teacher_name || 'Faculty Staff'} ${c.teacher_contact && c.teacher_contact !== 'N/A' ? `• 📞 ${c.teacher_contact}` : ''} ${c.schedule_time ? `• 🕒 ${c.schedule_time}` : ''}
                                </div>
                            </div>
                            <div style="font-weight:800; color:#0f172a; white-space:nowrap; margin-left:10px; text-align:right;">
                                LKR ${Number(c.fee_amount || 0).toLocaleString()}
                                <div style="font-size:10px; color:#64748b; font-weight:600;">${isDaily ? '/ day' : '/ month'}</div>
                            </div>
                        </div>
                    `;
                }).join('');

                const dailyClasses = classesList.filter((c: any) => (c.fee_type || '').toUpperCase() === 'DAILY');
                const monthlyClasses = classesList.filter((c: any) => (c.fee_type || '').toUpperCase() !== 'DAILY');
                const sumDaily = dailyClasses.reduce((acc: number, c: any) => acc + Number(c.fee_amount || 0), 0);
                const sumMonthly = monthlyClasses.reduce((acc: number, c: any) => acc + Number(c.fee_amount || 0), 0);

                classesHtml = `
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px 12px; margin:12px 0; text-align:left;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:10.5px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">
                                Enrolled Classes (${classesList.length})
                            </span>
                            <span style="font-size:10.5px; font-weight:700; color:#2563eb; background:#eff6ff; padding:1px 6px; border-radius:4px;">
                                ${activeBillingCycle === 'DAILY' ? '☀️ Daily Billing' : activeBillingCycle === 'MIXED' ? '🔀 Hybrid Billing' : '📅 Monthly Billing'}
                            </span>
                        </div>
                        ${itemsHtml}
                        <div style="margin-top:8px; font-size:12px; font-weight:800; color:#0f172a; border-top:1px solid #e2e8f0; padding-top:6px; display:flex; justify-content:space-between;">
                            <span>Fee Schedule:</span>
                            <span style="color:#2563eb;">
                                ${sumMonthly > 0 ? `LKR ${sumMonthly.toLocaleString()}/mo ` : ''}
                                ${sumDaily > 0 ? `${sumMonthly > 0 ? '+ ' : ''}LKR ${sumDaily.toLocaleString()}/day` : ''}
                            </span>
                        </div>
                    </div>
                `;
            } else if (student.classes) {
                classesHtml = `
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px 12px; margin:12px 0; text-align:left;">
                        <div style="font-size:10.5px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Enrolled Classes</div>
                        <p style="font-size:12px; color:#334155; margin:0 0 6px 0; font-weight:600;">${student.classes}</p>
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:800; color:#0f172a;">
                            <span>Total Fee:</span>
                            <span style="color:#2563eb;">LKR ${finalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                `;
            }

            if (is_paid) {
                // Payment is settled
                const paidHeadline = activeBillingCycle === 'DAILY'
                    ? `✓ TODAY'S PASS PAID — ${activePeriodName}`
                    : activeBillingCycle === 'MIXED'
                    ? `✓ ALL ACTIVE PASSES PAID`
                    : `✓ FEES PAID — ${activePeriodName}`;

                const paidSubtext = activeBillingCycle === 'DAILY'
                    ? `Daily access pass is verified and active for today.`
                    : `Tuition fee is fully settled (LKR ${finalAmount.toLocaleString()}).`;

                await Swal.fire({
                    icon: 'success',
                    title: 'ACCESS GRANTED',
                    html: `
                        <div style="text-align: left; padding: 4px;">
                            <h3 style="font-weight:900; font-size:22px; color:#0f172a; margin:0 0 4px 0;">${student.name}</h3>
                            <p style="font-size:12px; font-weight:700; font-family:monospace; color:#64748b; margin:0 0 10px 0;">ID: ${student.secure_barcode}</p>
                            ${attendanceBadge}
                            ${classesHtml}
                            <div style="background:#f0fdf4; border:2px solid #22c55e; padding:14px; border-radius:14px; margin-top:12px; text-align:center;">
                                <h4 style="color:#15803d; font-weight:900; font-size:15px; margin:0;">${paidHeadline}</h4>
                                <p style="color:#166534; font-size:12px; margin:4px 0 0 0; font-weight:600;">${paidSubtext}</p>
                                <div style="font-size:11px; color:#15803d; font-weight:700; margin-top:6px; opacity:0.85;">
                                    Gate Clearance Logged: ${currentTimeDisplay}
                                </div>
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'Next Student / Continue'
                });
            } else {
                // Payment is UNPAID / DUE
                const dueHeadline = activeBillingCycle === 'DAILY'
                    ? `⚠ TODAY'S DAY FEE DUE`
                    : `⚠ TUITION UNPAID — ${activePeriodName}`;

                const dueNote = activeBillingCycle === 'DAILY'
                    ? `Daily pass renews every day. Student must pay for today's class.`
                    : `Monthly pass renews each calendar month.`;

                const buttonLabel = activeBillingCycle === 'DAILY'
                    ? `💳 Collect Today's Pass (LKR ${finalAmount.toLocaleString()}) & Mark Paid`
                    : `💳 Collect LKR ${finalAmount.toLocaleString()} & Mark Paid`;

                const result = await Swal.fire({
                    icon: 'warning',
                    title: activeBillingCycle === 'DAILY' ? "TODAY'S DAY PASS DUE" : ("FEES DUE FOR " + activePeriodName.toUpperCase()),
                    html: `
                        <div style="text-align: left; padding: 4px;">
                            <h3 style="font-weight:900; font-size:22px; color:#0f172a; margin:0 0 4px 0;">${student.name}</h3>
                            <p style="font-size:12px; font-weight:700; font-family:monospace; color:#64748b; margin:0 0 10px 0;">ID: ${student.secure_barcode}</p>
                            ${attendanceBadge}
                            ${classesHtml}
                            <div style="background:#fef2f2; border:2px solid #ef4444; padding:14px; border-radius:14px; margin-top:12px; text-align:center;">
                                <h4 style="color:#b91c1c; font-weight:900; font-size:16px; margin:0;">${dueHeadline}</h4>
                                <p style="color:#991b1b; font-size:15px; margin:6px 0 2px 0; font-weight:900;">Amount Due: LKR ${finalAmount.toLocaleString()}</p>
                                <p style="color:#7f1d1d; font-size:11px; margin:2px 0 0 0; font-weight:500;">${dueNote}</p>
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: buttonLabel,
                    confirmButtonColor: '#2563eb',
                    cancelButtonText: 'Allow Entry (Without Payment)',
                    cancelButtonColor: '#64748b'
                });

                if (result.isConfirmed) {
                    try {
                        await axios.post("http://127.0.0.1:8000/api/payments/pay", {
                            student_id: student.id,
                            month: activeMonthParam,
                            amount: finalAmount,
                            period_type: activePeriodType
                        });
                        await Swal.fire({
                            icon: 'success',
                            title: 'Payment Recorded!',
                            html: `<p style="font-size:14px; font-weight:700; color:#047857;">LKR ${finalAmount.toLocaleString()} marked as PAID for ${activePeriodName}.<br><span style="font-size:12px; color:#64748b; font-weight:normal;">Payment status renewed successfully.</span></p>`,
                            timer: 2200,
                            showConfirmButton: false
                        });
                    } catch (payErr) {
                        await Swal.fire({ icon: 'error', title: 'Payment Error', text: 'Could not record payment. Please check server.' });
                    }
                }
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Invalid ID Card or Student not found.';
            await Swal.fire({ icon: 'warning', title: 'Not Found', text: msg, confirmButtonColor: '#f59e0b' });
        } finally {
            safeResume();
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 1200);
        }
    };

    const onScanSuccess = useCallback((decodedText: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        playBeep();
        safePause();
        processScan(decodedText);
    }, []);

    useEffect(() => {
        let isCancelled = false;
        let activeScanner: Html5Qrcode | null = null;

        const initCamera = async () => {
            const container = document.getElementById("reader");
            if (!container) return;

            // Clear any lingering video elements to guarantee only one single camera
            container.innerHTML = "";

            setCameraStatus("starting");
            setErrorMessage("");

            const scanner = new Html5Qrcode("reader", {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39
                ],
                verbose: false
            });
            activeScanner = scanner;
            scannerRef.current = scanner;

            const scanConfig = { fps: 10, qrbox: { width: 260, height: 260 } };

            try {
                // Try back camera first; if on PC or laptop webcam, fallback to user facing
                try {
                    await scanner.start(
                        { facingMode: "environment" },
                        scanConfig,
                        onScanSuccess,
                        () => {}
                    );
                } catch {
                    if (isCancelled) return;
                    await scanner.start(
                        { facingMode: "user" },
                        scanConfig,
                        onScanSuccess,
                        () => {}
                    );
                }

                if (isCancelled) {
                    if (scanner.isScanning) {
                        await scanner.stop();
                    }
                    scanner.clear();
                    return;
                }

                setCameraStatus("running");
            } catch (err: any) {
                if (isCancelled) return;
                console.error("Camera startup error:", err);
                setCameraStatus("error");
                setErrorMessage(err?.message || "Could not access camera. Please allow camera permissions in your browser.");
            }
        };

        initCamera();

        return () => {
            isCancelled = true;
            if (activeScanner) {
                if (activeScanner.isScanning) {
                    activeScanner.stop().then(() => {
                        try { activeScanner?.clear(); } catch {}
                    }).catch(() => {});
                } else {
                    try { activeScanner.clear(); } catch {}
                }
            }
            scannerRef.current = null;
        };
    }, [onScanSuccess, retryTrigger]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const barcode = scannedId.trim();
        if (!barcode || isProcessingRef.current) return;
        isProcessingRef.current = true;
        safePause();
        processScan(barcode);
        setScannedId("");
    };

    return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Gate Scanner</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Hold Barcode or QR Code to camera</p>

                {/* Single Scanner Window */}
                <div className="relative w-full rounded-2xl overflow-hidden border-4 border-slate-900 bg-slate-950 shadow-inner min-h-[320px] flex items-center justify-center">
                    <div id="reader" className="w-full"></div>

                    {cameraStatus === "starting" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 z-10">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-semibold">Opening Camera...</p>
                            <p className="text-xs text-slate-400 mt-1">Please allow camera permissions if prompted</p>
                        </div>
                    )}

                    {cameraStatus === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 z-10">
                            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm font-bold text-rose-400">Camera Access Error</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">{errorMessage}</p>
                            <button
                                type="button"
                                onClick={() => setRetryTrigger(prev => prev + 1)}
                                className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow"
                            >
                                Allow Access & Retry
                            </button>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                {cameraStatus === "running" && (
                    <div className="flex items-center justify-center mt-3 mb-2 px-2 text-xs">
                        <span className="flex items-center gap-2 text-emerald-600 font-semibold">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Scanner Active (Point Barcode or QR Code)
                        </span>
                    </div>
                )}

                {/* Manual Fallback */}
                <div className="mt-6 w-full pt-6 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Manual Entry Fallback</p>
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input required type="text" placeholder="Enter NT- ID..." value={scannedId} onChange={(e) => setScannedId(e.target.value)} className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm outline-none focus:bg-white focus:border-blue-400 font-mono transition-all text-slate-800" />
                        <button type="submit" className="bg-slate-900 hover:bg-black text-white font-bold px-6 rounded-xl shadow-md transition-all text-sm">Verify</button>
                    </form>
                </div>
            </div>
        </div>
    );
}