"use client";

import { User } from "lucide-react";

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen w-full bg-[#02040a] flex items-center justify-center py-24 p-4 relative overflow-hidden">
            {/* هالات الإضاءة الخلفية المتوهجة */}
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-green-500/[0.02] rounded-full blur-[140px]" />

            <div className="max-w-3xl w-full bg-[#070a13]/40 border border-green-500/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center gap-8 shadow-2xl relative z-10 animate-pulse">

                {/* الأفاتار المخصص: حواف دائرية نيون بتلف بتأثير متوهج سبيشيل */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* خط النيون الدائري الذي يلتف حول الأفاتار */}
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-green-500 border-l-2 border-b-transparent animate-spin duration-1000 shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                    {/* حلقة حماية داخلية */}
                    <div className="absolute inset-1.5 rounded-full border border-green-500/20 bg-[#02040a]" />
                    {/* أيقونة المستخدم في المنتصف */}
                    <User className="w-10 h-10 text-green-500/40 relative z-10" />
                </div>

                {/* خطوط الحقول الوهمية المتحركة (Shimmer Fields) */}
                <div className="w-48 h-5 bg-green-500/10 rounded-full font-mono text-[10px] text-green-400/40 flex items-center justify-center border border-green-500/5">
                    SYSTEM LOADING...
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                    <div className="space-y-2">
                        <div className="w-24 h-3 bg-gray-800 rounded-full" />
                        <div className="w-full h-12 bg-[#02040a]/60 border border-green-500/5 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <div className="w-24 h-3 bg-gray-800 rounded-full" />
                        <div className="w-full h-12 bg-[#02040a]/60 border border-green-500/5 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <div className="w-2c h-3 bg-gray-800 rounded-full" />
                        <div className="w-full h-12 bg-[#02040a]/40 border border-transparent rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <div className="w-28 h-3 bg-gray-800 rounded-full" />
                        <div className="w-full h-12 bg-[#02040a]/40 border border-transparent rounded-xl" />
                    </div>
                </div>

                <div className="w-full h-px bg-green-500/10 mt-6" />
                <div className="flex w-full justify-between items-center gap-4 mt-2">
                    <div className="w-44 h-11 bg-green-500/10 rounded-full border border-green-500/20" />
                    <div className="w-32 h-11 bg-red-500/5 rounded-full border border-red-500/10" />
                </div>

            </div>
        </div>
    );
};

export default ProfileSkeleton;