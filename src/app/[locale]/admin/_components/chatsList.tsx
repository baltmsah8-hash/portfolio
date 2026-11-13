"use client";

import React, { useState } from "react";
import ChatsListSkeleton from "@/src/components/loading/chatListSkeleton";
import type { UserData } from "../page";
import { Mail, Phone, Calendar, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ChatsListProps {
    currentLocale: string;
    router: { push: (href: string) => void };
    users: (UserData & { unreadCount?: number })[]; // تأمين وجود الحقل اختيارياً في الـ Type
    loading: boolean;
}

const ChatsList = ({ currentLocale, router, users, loading }: ChatsListProps) => {
    const isRtl = currentLocale === "ar";
    const dateLocale = isRtl ? ar : enUS;
    const [searchQuery, setSearchQuery] = useState("");

    const handleOpenChat = async (customerId: string) => {
        try {
            const res = await fetch(`/api/admin/chat/read`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/${currentLocale}/chat?userId=${customerId}`);
            }
        } catch (error) {
            console.error("Failed to execute read sequence:", error);
            router.push(`/${currentLocale}/chat?userId=${customerId}`);
        }
    };

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase().trim();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.phone && user.phone.includes(query))
        );
    });

    if (loading) {
        return (
            <div className="w-full space-y-4">
                <div className="w-full h-12 bg-gray-800/20 border border-green-500/5 rounded-xl animate-pulse" />
                <ChatsListSkeleton />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">

            {/* شريط البحث الفوري */}
            <div className="relative w-full z-10">
                <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-500">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRtl ? "ابحث عن عميل بالاسم، البريد الإلكتروني، أو الهاتف..." : "Search customer by name, email, or phone number..."}
                    className="w-full px-5 py-3.5 ps-11 rounded-xl font-mono text-xs sm:text-sm bg-[#070a13]/40 border border-green-500/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/40"
                />
            </div>

            {/* عرض كروت العملاء */}
            <div className="w-full space-y-5 custom-scrollbar py-6">
                {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 font-mono text-xs border border-dashed border-gray-800 rounded-2xl uppercase tracking-wider">
                        {searchQuery ? "NO_MATCHING_PROTOCOL_FOUND" : "NO_ACTIVE_CUSTOMERS_FOUND"}
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleOpenChat(user._id)}
                            className="w-full bg-[#070a13]/40 border border-green-500/10 hover:border-green-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 shadow-xl shadow-black/40 relative"
                        >
                            {/* 🌟 الإضافة الوحيدة: بادج عدد الرسائل غير المقروءة فوق الكارت */}
                            {user.unreadCount && user.unreadCount > 0 ? (
                                <span 
                                    className={`absolute -top-2.5 z-20 px-2.5 py-0.5 rounded-full bg-green-500 text-black font-mono text-[11px] font-black shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse ${
                                        isRtl ? "left-4" : "right-4"
                                    }`}
                                >
                                    {user.unreadCount}
                                </span>
                            ) : null}

                            {/* جهة البيانات والأفاتار */}
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-full bg-[#02040a] border border-green-500/20 group-hover:border-green-400 transition-colors flex items-center justify-center text-green-400 font-mono font-bold text-lg shadow-inner">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <h3 className="font-mono font-bold text-sm text-white group-hover:text-green-400 transition-colors truncate">
                                        {user.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-gray-400">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-green-500/50" /> {user.email}</span>
                                        {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-green-500/50" /> {user.phone}</span>}
                                        <span className="flex items-center gap-1 text-gray-500"><Calendar className="w-3 h-3 text-green-500/30" /> {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* جهة مؤشر المزامنة على اليمين */}
                            <div className="flex items-center justify-end flex-shrink-0 self-end sm:self-center">
                                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest px-2.5 py-1 rounded-md bg-gray-950/40 border border-gray-900">
                                    SECURE_LINK
                                </span>
                            </div>

                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default ChatsList;
