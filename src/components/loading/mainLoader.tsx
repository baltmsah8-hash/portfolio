"use client";

import React, { useState, useEffect } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
    subsets: ["latin"],
    weight: ["700", "900"],
});

const MainLoader = () => {
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        const hasLoadedBefore = sessionStorage.getItem("intro_shown");
        if (hasLoadedBefore) {
            setShouldRender(false);
            return;
        }

        document.body.style.overflow = "hidden";

        const duration = 3800;
        const startTime = performance.now();
        let animationFrameId: number;

        const updateProgress = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const rawRatio = Math.min(elapsed / duration, 1);

            const easedRatio = 1 - Math.pow(1 - rawRatio, 2.2);
            const currentPercent = Math.round(easedRatio * 100);

            setProgress(currentPercent);

            if (rawRatio < 1) {
                animationFrameId = requestAnimationFrame(updateProgress);
            } else {
                sessionStorage.setItem("intro_shown", "true");
                setTimeout(() => {
                    setIsExiting(true);
                    document.body.style.overflow = "unset";
                }, 300);

                setTimeout(() => {
                    setShouldRender(false);
                }, 1050);
            }
        };

        animationFrameId = requestAnimationFrame(updateProgress);

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            dir="ltr"
            className={`fixed inset-0 z-[7000] bg-[#02040a] flex flex-col items-center justify-center transition-all duration-700 ease-in-out select-none ${isExiting
                    ? "opacity-0 scale-105 pointer-events-none"
                    : "opacity-100 scale-100"
                }`}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.09)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

            <div className="relative z-10 flex flex-col items-center px-6">
                <div className="relative mb-8 animate-ninja-float flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full bg-green-400/20 blur-xl animate-pulse" />

                    <div className="relative w-20 h-20 rounded-2xl rotate-45 border border-green-500/40 bg-[#070a13]/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.3)] overflow-hidden">
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-green-300/35 to-transparent skew-x-12 animate-scan-sweep" />

                        <svg
                            viewBox="0 0 24 24"
                            className="-rotate-45 w-9 h-9 text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.95)]"
                            fill="currentColor"
                        >
                            <path d="M12 1L14.8 9.2L23 12L14.8 14.8L12 23L9.2 14.8L1 12L9.2 9.2L12 1ZM12 9.5C10.62 9.5 9.5 10.62 9.5 12C9.5 13.38 10.62 14.5 12 14.5C13.38 14.5 14.5 13.38 14.5 12C14.5 10.62 13.38 9.5 12 9.5Z" />
                        </svg>
                    </div>
                </div>

                <h1
                    className={`${orbitron.className} text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.15em] uppercase text-center bg-gradient-to-r from-emerald-400 via-white to-green-400 bg-clip-text text-transparent animate-text-shimmer drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]`}
                >
                    ABDELRHMAN <span className="text-green-400">HANY</span>
                </h1>

                <p className="mt-2.5 text-[10px] sm:text-xs font-mono tracking-[0.35em] text-emerald-400/70 uppercase">
                    FULL-STACK ARCHITECT
                </p>

                <div className="w-72 sm:w-96 mt-9">
                    <div className="flex justify-between items-center text-[11px] font-mono mb-2">
                        <span className="text-gray-400 tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                            {progress < 100 ? "INITIALIZING_SYSTEM" : "SYSTEM_READY"}
                        </span>
                        <span className="text-green-400 font-bold tracking-wider">
                            {progress}%
                        </span>
                    </div>

                    <div className="relative h-3.5 w-full bg-[#070a13] border border-green-500/30 rounded-md p-[3px] shadow-[0_0_20px_rgba(16,185,129,0.18)] overflow-hidden">
                        <div
                            className="relative h-full rounded-sm bg-gradient-to-r from-emerald-700 via-green-400 to-teal-300 shadow-[0_0_15px_rgba(52,211,153,0.95)] overflow-hidden"
                            style={{ width: `${progress}%` }}
                        >
                            <div
                                className="absolute inset-0 opacity-35"
                                style={{
                                    backgroundImage:
                                        "repeating-linear-gradient(90deg, transparent, transparent 8px, #02040a 8px, #02040a 11px)",
                                }}
                            />
                            <div className="absolute inset-0 w-1/3 bg-white/40 blur-[2px] animate-scan-sweep" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLoader;
