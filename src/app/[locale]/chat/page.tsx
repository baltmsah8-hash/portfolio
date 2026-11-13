"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useAlert } from "@/src/context/alert";
import MessagesSkeleton from "@/src/components/loading/messageSkeleton";
import { Send, MessageSquare, ArrowLeft, Pin, PinOff, Check } from "lucide-react";
import Link from "next/link";
import Pusher from "pusher-js";

interface SingleMessage {
    _id: string;
    id: string;
    sender: "user" | "admin";
    isReaded: boolean;
    content: string;
    isPinned: boolean;
    createdAt: string;
}

const normalizeMessage = (message: Partial<SingleMessage>): SingleMessage | null => {
    const id = message.id || message._id;
    if (!id || !message.sender || typeof message.content !== "string" || !message.createdAt) {
        return null;
    }

    return {
        ...message,
        _id: message._id || id,
        id,
        sender: message.sender,
        isReaded: message.isReaded ?? false,
        content: message.content,
        isPinned: message.isPinned ?? false,
        createdAt: message.createdAt,
    };
};

const appendMessage = (messages: SingleMessage[], message: SingleMessage) => {
    if (messages.some((existing) => existing.id === message.id)) return messages;
    return [...messages, message];
};

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
    const [chatId, setChatId] = useState("");

    const myRole = isAdminMode ? "admin" : "user";

    const loadChatLogs = async () => {
        try {
            const url = isAdminMode ? `/api/chat?userId=${targetCustomerId}` : `/api/chat`;
            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
            });

            if (res.status === 401) {
                router.push(`/${currentLocale}/auth?redirect=/chat`);
                return;
            }

            const data = await res.json();

            if (data.success) {
                const normalizedMessages = (data.messages || [])
                    .map((message: Partial<SingleMessage>) => normalizeMessage(message))
                    .filter((message: SingleMessage | null): message is SingleMessage => message !== null);
                setMessages(normalizedMessages);
                // تعيين chatId دائمًا حتى لو الشات فارغ تمامًا
                if (isAdminMode && targetCustomerId) {
                    setChatId(targetCustomerId);
                } else if (data.userId) {
                    setChatId(data.userId);
                }
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
                method: "PATCH",
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
                showAlert(isRtl ? "تم تحديث حالة التثبيت" : "Pin protocol updated successfully.", "success");
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
                const message = normalizeMessage(data.message);
                if (!message) {
                    showAlert("The server returned an invalid message.", "error");
                    return;
                }
                setMessages((prev) => appendMessage(prev, message));
                setInputMessage("");
            } else {
                console.log(data.error)
                showAlert(data.error || "Transmission block. Message not sent.", "error");
            }
        } catch {
            showAlert("Transmission block. Message not sent.", "error");
        }
    };

    const triggerMarkAsRead = async () => {
        try {
            await fetch("/api/chat/mark-read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(isAdminMode ? { userId: targetCustomerId } : {}),
            });
        } catch (err) {
            console.error("Failed to mark message as read:", err);
        }
    };

    useEffect(() => {
        if (!chatId) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusher.subscribe(`chat-${chatId}`);

        channel.bind("new-message", (data: { sender: "user" | "admin"; message: Partial<SingleMessage> }) => {
            if (!data?.message) return;

            const normalizedMessage = normalizeMessage(data.message);
            if (!normalizedMessage) return;

            const isFromOtherParty = normalizedMessage.sender !== myRole;

            setMessages((prev) => appendMessage(prev, normalizedMessage));

            if (isFromOtherParty && document.visibilityState === "visible") {
                triggerMarkAsRead();
            }
        });

        channel.bind("messages-read", (data: { readBy: "user" | "admin" }) => {
            if (data.readBy !== myRole) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.sender === myRole ? { ...msg, isReaded: true } : msg
                    )
                );
            }
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`chat-${chatId}`);
            pusher.disconnect();
        };
    }, [chatId, myRole]);

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
        <main
            dir={isRtl ? "rtl" : "ltr"}
            className="relative min-h-screen w-full bg-[#02040a] text-white py-26 px-4 lg:px-8 flex items-center justify-center overflow-hidden"
        >
            <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <section className="max-w-4xl w-full h-[82vh] bg-[#070a13]/40 border border-green-500/10 backdrop-blur-xl rounded-[2.5rem] flex flex-col shadow-2xl shadow-black/80 overflow-hidden relative z-10">

                <div className="px-6 py-4 border-b border-green-500/10 bg-[#070a13]/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/5 border border-green-500/20 flex items-center justify-center text-green-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h2 className="text-xs sm:text-sm font-mono font-bold uppercase text-white tracking-wide">
                            {isAdminMode ? t("adminTitle") : t("userTitle")}
                        </h2>
                    </div>

                    <Link
                        href={isAdminMode ? `/${currentLocale}/admin` : `/${currentLocale}/profile`}
                        className="p-2.5 rounded-full bg-green-500/5 border border-green-500/10 text-green-400 hover:bg-green-500/10 transition-all duration-300"
                    >
                        <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                </div>

                {chatLoading ? (
                    <MessagesSkeleton />
                ) : (
                    <div
                        ref={messagesRef}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0 custom-scrollbar"
                    >
                        {messages.length === 0 ? (
                            <p className="h-full flex items-center justify-center text-xs font-mono text-gray-500">
                                {t("noMessages") || "No messages yet. Start the conversation."}
                            </p>
                        ) : (
                            messages.map((msg) => {
                                const isMe = isAdminMode ? msg.sender === "admin" : msg.sender === "user";

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-center gap-2 w-full group animate-in fade-in duration-200 ${isMe ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        {isAdminMode && (
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePin(msg._id, msg.isPinned)}
                                                title={msg.isPinned ? "Unpin message" : "Pin message"}
                                                className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${isMe ? "order-first" : "order-last"
                                                    } ${msg.isPinned
                                                        ? "opacity-100 bg-green-500/20 border-green-500 text-green-400"
                                                        : "opacity-0 group-hover:opacity-100 bg-gray-900/60 border-gray-800 text-gray-400 hover:text-green-400"
                                                    }`}
                                            >
                                                {msg.isPinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                                            </button>
                                        )}

                                        <div
                                            className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-xl break-words whitespace-pre-line flex flex-col gap-1.5 min-w-[75px] relative ${isMe
                                                ? `bg-green-500 text-black font-semibold ${isRtl ? "rounded-bl-none" : "rounded-br-none"
                                                }`
                                                : `bg-[#070a13]/80 border border-green-500/10 text-gray-200 ${isRtl ? "rounded-br-none" : "rounded-bl-none"
                                                }`
                                                } ${msg.isPinned ? "ring-1 ring-green-400/50" : ""}`}
                                        >
                                            {!isAdminMode && msg.isPinned && (
                                                <span className="flex items-center gap-1 text-[10px] font-mono text-green-400">
                                                    <Pin className="w-2.5 h-2.5" /> Pinned
                                                </span>
                                            )}

                                            <span>{msg.content}</span>

                                            <div
                                                className={`flex items-center gap-1 text-[9px] self-end font-mono select-none ${isMe ? "text-black/60" : "text-gray-500"
                                                    }`}
                                            >
                                                <time>
                                                    {new Date(msg.createdAt).toLocaleTimeString(currentLocale, {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </time>

                                                {isMe && (
                                                    <span className="inline-flex items-center">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                        {msg.isReaded && (
                                                            <Check className="w-3 h-3 stroke-[3] -ms-2 text-emerald-950" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-green-500/10 bg-[#070a13]/60 flex items-center gap-3 shrink-0"
                >
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={t("placeholder")}
                        className="w-full px-5 py-3.5 rounded-xl font-mono text-xs sm:text-sm bg-[#02040a]/80 border border-green-500/10 text-white focus:outline-none focus:border-green-500/40 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="p-3.5 rounded-xl bg-green-500 text-black hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer shrink-0"
                    >
                        <Send className={`w-4 h-4 ${isRtl ? "-rotate-90" : ""}`} />
                    </button>
                </form>
            </section>
        </main>
    );

};

export default ChatPage;
