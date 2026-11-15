"use client";
import React from "react";

const CyberCore = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
            {/* قلب الطاقة المتحرك بدون أي مربع أو خلفية مقصوصة */}
            <div className="relative flex items-center justify-center animate-ninja-float transform-gpu">

                {/* الحلقة الخارجية المتقطعة */}
                <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-dashed border-emerald-500/20 animate-[spin_25s_linear_infinite]" />

                {/* الحلقة المتوسطة المضيئة */}
                <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-green-400/15 border-t-emerald-400/50 border-b-emerald-400/50 animate-[spin_15s_linear_infinite_reverse]" />

                {/* المعين الزجاجي الخلفي */}
                <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-3xl rotate-45 border border-emerald-500/20 bg-emerald-950/10" />

                {/* المعين الرئيسي ذو المسح الضوئي */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl rotate-45 border border-green-500/40 bg-[#070a13]/90 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.25)] overflow-hidden">
                    {/* شعاع المسح الضوئي المتحرك */}
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-green-400/25 to-transparent skew-x-12 animate-scan-sweep" />

                    {/* النجمة الرباعية المتوهجة في المنتصف */}
                    <svg
                        viewBox="0 0 24 24"
                        className="-rotate-45 w-10 h-10 sm:w-12 sm:h-12 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.85)]"
                        fill="currentColor"
                    >
                        <path d="M12 1L14.8 9.2L23 12L14.8 14.8L12 23L9.2 14.8L1 12L9.2 9.2L12 1ZM12 9.5C10.62 9.5 9.5 10.62 9.5 12C9.5 13.38 10.62 14.5 12 14.5C13.38 14.5 14.5 13.38 14.5 12C14.5 10.62 13.38 9.5 12 9.5Z" />
                    </svg>
                </div>

                {/* نقاط طاقة صغيرة تدور حول اللوجو */}
                <div className="absolute w-44 h-44 sm:w-56 sm:h-56 animate-[spin_12s_linear_infinite]">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                </div>
            </div>
        </div>
    );
};

export default CyberCore;
