"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useAlert } from "@/src/context/alert";
import MessagesSkeleton from "@/src/components/loading/messageSkeleton";
import { Send, MessageSquare, ArrowLeft, Pin, Check } from "lucide-react";
import Link from "next/link";

interface SingleMessage {
    _id: string;
    sender: "user" | "admin";
    isReaded: boolean;
    content: string;
    isPinned: boolean;
    createdAt: string;
}

const ChatPage = () => {
    const t = useTranslations("Chat");
    const currentLocale = useLocale();
    const isRtl = currentLocale === "ar";
    const { showAlert } = useAlert();
    const searchParams = useSearchParams();
    const router = useRouter();

    const targetCustomerId = searchParams.get("userId");
    const isAdminMode = !!targetCustomerId;

    const messagesRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<SingleMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [chatLoading, setChatLoading] = useState(true);

    const loadChatLogs = async () => {
        try {
            const url = isAdminMode ? `/api/chat?userId=${targetCustomerId}` : `/api/chat`;
            const res = await fetch(url, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();

            if (data.success) {
                setMessages(data.messages || []);

            } else if (res.status === 401) {
                router.push(`/${currentLocale}/auth`);
            }
        } catch (error) {
            console.error("Failed to sync chat matrix:", error);
        } finally {
            setChatLoading(false);
        }
    };

    const handleTogglePin = async (messageId: string, currentPinStatus: boolean) => {
        if (!isAdminMode || !targetCustomerId) return;
        try {
            const res = await fetch(`/api/chat/pin`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    userId: targetCustomerId,
                    messageId,
                    pinStatus: !currentPinStatus
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessages((prev) => prev.map((msg) => msg._id === messageId ? { ...msg, isPinned: !currentPinStatus } : msg));
                showAlert(isRtl ? "تم تثبيت الرساله" : "Pin protocol updated successfully.", "success");
            } else {
                showAlert(data.error || "Failed to update pin protocol.", "error");
            }
        } catch {
            showAlert("Critical failure during pin sequence.", "error");
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const url = isAdminMode ? `/api/chat/admin` : `/api/chat/user`;
        const payload = isAdminMode ? { content: inputMessage, userId: targetCustomerId } : { content: inputMessage };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                credentials: "include"
            });
            const data = await res.json();
            console.log(data)

            if (data.success && data.message) {
                setMessages((prev) => [...prev, data.message]);
                setInputMessage("");
            } else {
                console.log(data.error)
                showAlert(data.error || "Transmission block. Message not sent.", "error");
            }
        } catch {
            showAlert("Transmission block. Message not sent.", "error");
        }
    };

    useEffect(() => {
        loadChatLogs();
    }, [isAdminMode, targetCustomerId, currentLocale, router]);

        const scrollToBottom = () => {
        if (messagesRef.current) {
            messagesRef.current.scrollTo({
                top: messagesRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <main className="relative min-h-screen w-full bg-[#02040a] text-white py-24 px-4 lg:px-8 flex items-center justify-center overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
            <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl w-full h-[82vh] bg-[#070a13]/40 border border-green-500/10 backdrop-blur-xl rounded-[2.5rem] p-0 flex flex-col shadow-2xl shadow-black/80 overflow-hidden relative z-10">

                <div className="px-6 py-4 border-b border-green-500/10 bg-[#070a13]/60 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/5 border border-green-500/20 flex items-center justify-center text-green-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xs sm:text-sm font-mono font-bold uppercase text-white tracking-wide">
                                {isAdminMode ? t("adminTitle") : t("userTitle")}
                            </h2>
                        </div>
                    </div>
                    <Link href={isAdminMode ? `/${currentLocale}/dashboard` : `/${currentLocale}/profile`} className="p-2.5 rounded-full bg-green-500/5 border border-green-500/10 text-green-400 hover:bg-green-500/10 transition-all duration-300">
                        <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                </div>

                {chatLoading ? (
                    <MessagesSkeleton />
                ) : (
                    <div 
                    ref={messagesRef} 
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0 custom-scrollbar">
                        {messages.map((msg) => {
                            const isMe = isAdminMode ? msg.sender === "admin" : msg.sender === "user";

                            return (
                                <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} w-full group animate-in fade-in duration-200`}>

                                    <div className="flex items-center gap-2 max-w-[85%] sm:max-w-[75%] relative">
                                        {isAdminMode && (
                                            <button
                                                onClick={() => handleTogglePin(msg._id, msg.isPinned)}
                                                className={`p-1.5 rounded-lg border transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer 
                                                    ${msg.isPinned ? "bg-green-500/20 border-green-500 text-green-400" : "bg-gray-900/60 border-gray-800 text-gray-400 hover:text-green-400"}`}
                                            >
                                                <Pin className="w-3 h-3" />
                                            </button>
                                        )}

                                        <div className={`px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-xl break-words whitespace-pre-line flex flex-col gap-1.5 min-w-[70px] 
                                        ${isMe ? `bg-green-500 text-black font-semibold 
                                        ${isRtl ? "rounded-bl-none" : "rounded-br-none"}` :
                                                `bg-[#070a13]/80 border border-green-500/10 text-gray-200 
                                        ${isRtl ? "rounded-br-none" : "rounded-bl-none"}`
                                            } ${msg.isPinned ? "ring-1 ring-green-400/40" : ""}`}>

                                            <span>{msg.content}</span>

                                            <div className={`flex items-center gap-1 text-[9px] self-end font-mono select-none ${isMe ? "text-black/60" : "text-gray-500"}`}>
                                                <span>{new Date(msg.createdAt).toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit', hour12: true })}</span>

                                                {isMe && (
                                                    <div className="flex items-center">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                        {msg.isReaded && <Check className="w-3 h-3 stroke-[3] -ms-2 text-emerald-900" />}
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="p-4 border-t border-green-500/10 bg-[#070a13]/60 flex items-center gap-3 flex-shrink-0">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={t("placeholder")}
                        className="w-full px-5 py-3.5 rounded-xl font-mono text-xs sm:text-sm bg-[#02040a]/80 border border-green-500/10 text-white focus:outline-none focus:border-green-500/40"
                    />
                    <button type="submit" className="p-3.5 rounded-xl bg-green-500 text-black hover:bg-green-400 transition-all duration-300 cursor-pointer">
                        <Send className={`w-4 h-4 ${isRtl ? "-rotate-90" : ""}`} />
                    </button>
                </form>

            </div>
        </main>
    );
};

export default ChatPage;
