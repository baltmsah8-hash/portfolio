"use client";

import React from "react";

const RobotSkeleton = () => {
    return (
        <div className="relative flex flex-col items-center justify-end w-full h-full min-h-[550px] md:min-h-[680px] pt-16 overflow-hidden select-none pointer-events-none">
            {/* هالة إضاءة خضراء خفيفة مطابقة لخلفية الروبوت */}
            <div className="absolute top-1/3 w-72 h-72 md:w-[450px] md:h-[450px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />

            {/* هيكل الروبوت بحجم مطابق للمجسم الحقيقي */}
            <div className="relative flex flex-col items-center animate-pulse">

                {/* الرأس (بيضاوي انسيابي مثل المجسم) */}
                <div className="relative flex items-center justify-center w-24 h-28 md:w-32 md:h-36 rounded-[45%] bg-zinc-900/90 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                    {/* قناع الوجه الداكن */}
                    <div className="flex items-center justify-around w-20 h-16 md:w-28 md:h-20 rounded-[40%] bg-zinc-950 border border-zinc-800/80 px-4">
                        <span className="w-3 h-2 md:w-4 md:h-2.5 rounded-full bg-emerald-400/70 shadow-[0_0_10px_#34d399]" />
                        <span className="w-3 h-2 md:w-4 md:h-2.5 rounded-full bg-emerald-400/70 shadow-[0_0_10px_#34d399]" />
                    </div>
                </div>

                {/* الرقبة */}
                <div className="w-10 h-4 md:w-14 md:h-5 bg-zinc-800/90 border-x border-zinc-700/50" />

                {/* الجزء العلوي: الأكتاف والجذع والأذرع */}
                <div className="relative flex items-start justify-center">

                    {/* الذراع الأيسر */}
                    <div className="flex flex-col items-center mr-2 md:mr-3 -mt-1">
                        {/* مفصل الكتف */}
                        <div className="w-11 h-14 md:w-14 md:h-20 rounded-2xl bg-zinc-900/90 border border-zinc-800 rotate-6" />
                        {/* الساعد */}
                        <div className="w-9 h-24 md:w-12 md:h-32 -mt-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 -rotate-12" />
                        {/* القبضة */}
                        <div className="w-8 h-8 md:w-10 md:h-10 -mt-1 rounded-full bg-zinc-800 border border-emerald-500/20" />
                    </div>

                    {/* الجذع (الصدر العريض والخصر) */}
                    <div className="flex flex-col items-center">
                        {/* الصدر */}
                        <div className="flex flex-col items-center justify-center w-40 h-48 md:w-56 md:h-64 rounded-t-3xl rounded-b-[45px] bg-zinc-900/90 border border-emerald-500/25 shadow-[0_0_30px_rgba(16,185,129,0.1)] p-6">
                            {/* خط إضاءة خفيف في منتصف الصدر */}
                            <div className="w-16 h-1.5 rounded-full bg-emerald-500/30 mb-4" />
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-emerald-400/60" />
                            </div>
                        </div>
                        {/* الحوض */}
                        <div className="w-28 h-10 md:w-36 md:h-12 -mt-2 rounded-b-2xl bg-zinc-950 border border-zinc-800" />
                    </div>

                    {/* الذراع الأيمن */}
                    <div className="flex flex-col items-center ml-2 md:ml-3 -mt-1">
                        {/* مفصل الكتف */}
                        <div className="w-11 h-14 md:w-14 md:h-20 rounded-2xl bg-zinc-900/90 border border-zinc-800 -rotate-6" />
                        {/* الساعد */}
                        <div className="w-9 h-24 md:w-12 md:h-32 -mt-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 rotate-12" />
                        {/* القبضة */}
                        <div className="w-8 h-8 md:w-10 md:h-10 -mt-1 rounded-full bg-zinc-800 border border-emerald-500/20" />
                    </div>

                </div>

                {/* الأرجل العلوية (تمتد لأسفل الشاشة مثل الصورة) */}
                <div className="flex items-start justify-center gap-6 md:gap-10 -mt-1">
                    <div className="w-12 h-28 md:w-16 md:h-36 rounded-t-xl bg-zinc-900/90 border-x border-t border-zinc-800" />
                    <div className="w-12 h-28 md:w-16 md:h-36 rounded-t-xl bg-zinc-900/90 border-x border-t border-zinc-800" />
                </div>

            </div>
        </div>
    );
}


export default RobotSkeleton;