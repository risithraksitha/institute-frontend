"use client";

import React from "react";

// Standard Code 128 (Subset B) encoding patterns (ISO/IEC 15417)
const CODE128_PATTERNS = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

const START_B = 104;
const STOP = 106;

interface BarcodeProps {
    value: string;
    height?: number;
    barWidth?: number;
    showText?: boolean;
    className?: string;
}

export default function Barcode({
    value,
    height = 28,
    barWidth = 1.15,
    showText = true,
    className = ""
}: BarcodeProps) {
    const text = value || "NT-0000-00000000";

    // Build Code 128B symbols
    const codes: number[] = [START_B];
    let checksum = START_B;

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i) - 32;
        const validCode = code >= 0 && code <= 95 ? code : 0;
        codes.push(validCode);
        checksum += validCode * (i + 1);
    }

    codes.push(checksum % 103);
    codes.push(STOP);

    // Render bars
    const bars: React.ReactNode[] = [];
    let currentX = 5; // Left quiet zone

    codes.forEach((codeIdx, cIdx) => {
        const pattern = CODE128_PATTERNS[codeIdx] || CODE128_PATTERNS[0];
        for (let p = 0; p < pattern.length; p++) {
            const width = parseInt(pattern[p], 10) * barWidth;
            const isBar = p % 2 === 0;
            if (isBar) {
                bars.push(
                    <rect
                        key={`${cIdx}-${p}`}
                        x={currentX}
                        y={0}
                        width={width}
                        height={height}
                        fill="#000000"
                    />
                );
            }
            currentX += width;
        }
    });

    const totalWidth = currentX + 5; // Right quiet zone
    const totalHeight = showText ? height + 12 : height;

    return (
        <div className={`inline-flex flex-col items-center select-none ${className}`}>
            <svg
                width={totalWidth}
                height={totalHeight}
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                className="overflow-visible"
                style={{ maxWidth: "100%", height: "auto" }}
            >
                {bars}
                {showText && (
                    <text
                        x={totalWidth / 2}
                        y={height + 10}
                        textAnchor="middle"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#334155"
                        letterSpacing="0.08em"
                    >
                        {text}
                    </text>
                )}
            </svg>
        </div>
    );
}
