"use client";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "./Barcode";

interface IDCardProps {
    name?: string;
    secureId?: string;
    primaryColor?: string;
    tagline?: string;
    cardTitle?: string;
    footerText?: string;
}

export default function IDCard({
    name = "STUDENT NAME",
    secureId = "NT-XXXX-00000000",
    primaryColor = "#1e3a8a",
    tagline = "PREMIUM EDUCATION CENTER",
    cardTitle = "NOVA INSTITUTE",
    footerText = "VALID ACCESS PASS"
}: IDCardProps) {
    return (
        <div className="w-[340px] h-[215px] bg-white border border-slate-300 relative flex flex-col font-sans shadow-xl overflow-hidden select-none">

            {/* Top Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm" style={{ backgroundColor: primaryColor }}>
                        {cardTitle ? cardTitle.charAt(0) : "N"}
                    </div>
                    <div className="text-left">
                        <h2 className="text-sm font-black uppercase tracking-wider leading-none" style={{ color: primaryColor }}>{cardTitle}</h2>
                        <p className="text-[6.5px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">{tagline}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[7px] font-black px-2 py-0.5 rounded-full text-white tracking-wider uppercase" style={{ backgroundColor: primaryColor }}>
                        STUDENT PASS
                    </span>
                </div>
            </div>

            <div className="w-full h-[1px] bg-slate-200"></div>

            {/* Body Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pt-1 pb-2 text-center">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight truncate max-w-[300px]">{name}</h3>

                {/* 1D Scannable Barcode */}
                <div className="my-1 flex flex-col items-center">
                    <Barcode value={secureId} height={24} barWidth={0.9} showText={false} />
                    <span className="text-[10px] font-mono font-bold text-slate-700 tracking-widest mt-0.5">{secureId}</span>
                </div>
            </div>

            {/* Bottom Section (QR & Footer Text) */}
            <div className="px-4 pb-2 flex items-end justify-between">
                {/* 2D QR Code */}
                <div className="bg-white p-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5">
                    <QRCodeSVG value={secureId} size={36} />
                    <div className="text-left leading-none">
                        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-wider">SCAN FOR</p>
                        <p className="text-[7px] font-black text-slate-700 uppercase tracking-wider">GATE PASS</p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {footerText}
                    </span>
                </div>
            </div>

            {/* Footer Line */}
            <div className="w-full h-4 flex items-center justify-between px-3 text-[6px] font-semibold text-white uppercase tracking-wider" style={{ backgroundColor: primaryColor }}>
                <span>Official Student Identification</span>
                <span>NovaTech® System</span>
            </div>
        </div>
    );
}