"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useAlert } from "@/src/context/alert";

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

interface PushToggleButtonProps {
    variant?: "icon" | "sidebar";
}

export const PushToggleButton = ({ variant = "icon" }: PushToggleButtonProps) => {
    const currentLocale = useLocale();
    const isRtl = currentLocale === "ar";
    const { showAlert } = useAlert();

    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. فحص سريع لحالة الاشتراك بدون تعليق الواجهة
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            "PushManager" in window &&
            "Notification" in window
        ) {
            setIsSupported(true);
            navigator.serviceWorker
                .getRegistration("/")
                .then((reg) => (reg ? reg.pushManager.getSubscription() : null))
                .then((sub) => setIsSubscribed(!!sub))
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // 2. دالة التبديل بين التفعيل والإيقاف مباشرة
    const handleTogglePush = async () => {
        if (!isSupported || loading) return;
        setLoading(true);

        try {
            // تسجيل الملف مباشرة بدلاً من انتظار ready
                        // التحقق من وجود تسجيل قائم أولاً لتجنب تكرار التسجيل وحدوث AbortError
            let registration = await navigator.serviceWorker.getRegistration("/");
            if (!registration) {
                registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });
            }

            // التأكد من وجود Service Worker نشط
            const activeWorker =
                registration.active || registration.installing || registration.waiting;
            if (activeWorker && activeWorker.state !== "activated") {
                await new Promise<void>((resolve) => {
                    activeWorker.addEventListener("statechange", () => {
                        if (activeWorker.state === "activated") {
                            resolve();
                        }
                    });
                    // مهلة أمان 2 ثانية لكي لا يعلق الزر أبداً
                    setTimeout(resolve, 2000);
                });
            }


            if (isSubscribed) {
                const currentSub = await registration.pushManager.getSubscription();
                if (currentSub) {
                    const response = await fetch("/api/push/subscribe", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ endpoint: currentSub.endpoint }),
                    });
                    if (!response.ok) {
                        throw new Error("Failed to remove push subscription");
                    }
                    await currentSub.unsubscribe();
                }

                setIsSubscribed(false);
                showAlert(
                    isRtl ? "تم إيقاف إشعارات المتصفح" : "Browser notifications disabled",
                    "success"
                );
            } else {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    showAlert(
                        isRtl
                            ? "تم رفض الإذن. يرجى تفعيل الإشعارات من إعدادات المتصفح"
                            : "Permission denied. Please enable notifications in browser settings",
                        "error"
                    );
                    setLoading(false);
                    return;
                }

                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicKey) {
                    throw new Error("VAPID Public Key is missing in environment variables");
                }

                const newSub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey).buffer,
                });

                const res = await fetch("/api/push/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(newSub.toJSON()),
                });

                if (res.ok) {
                    setIsSubscribed(true);
                    showAlert(
                        isRtl ? "تم تفعيل إشعارات المتصفح بنجاح" : "Browser notifications enabled",
                        "success"
                    );
                } else {
                    await newSub.unsubscribe();
                    showAlert(
                        isRtl ? "فشل حفظ إعدادات الإشعارات" : "Failed to save notification settings",
                        "error"
                    );
                }
            }
        } catch (error) {
            console.error("Push toggle error:", error);
            showAlert(
                isRtl ? "حدث خطأ أثناء ضبط الإشعارات" : "Error updating notification settings",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isSupported) return null;

    if (variant === "sidebar") {
        return (
            <button
                type="button"
                onClick={handleTogglePush}
                disabled={loading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all duration-300 border cursor-pointer ${
                    isSubscribed
                        ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                        : "bg-transparent text-gray-400 border-green-500/10 hover:text-green-400 hover:bg-green-500/5"
                }`}
            >
                <div className="flex items-center gap-3">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                    ) : isSubscribed ? (
                        <Bell className="w-4 h-4 text-green-400" />
                    ) : (
                        <BellOff className="w-4 h-4 text-gray-500" />
                    )}
                    <span>
                        {isRtl
                            ? isSubscribed
                                ? "الإشعارات مفعلة"
                                : "تفعيل الإشعارات"
                            : isSubscribed
                            ? "Push Active"
                            : "Enable Push"}
                    </span>
                </div>
                <span
                    className={`w-2 h-2 rounded-full ${
                        isSubscribed ? "bg-green-400 animate-pulse" : "bg-gray-600"
                    }`}
                />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleTogglePush}
            disabled={loading}
            title={
                isRtl
                    ? isSubscribed
                        ? "إيقاف إشعارات المتصفح"
                        : "تفعيل إشعارات المتصفح"
                    : isSubscribed
                    ? "Disable Browser Notifications"
                    : "Enable Browser Notifications"
            }
            className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                isSubscribed
                    ? "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30"
                    : "bg-green-500/5 border-green-500/10 text-gray-400 hover:text-green-400 hover:bg-green-500/10"
            }`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
                <Bell className="w-4 h-4" />
            ) : (
                <BellOff className="w-4 h-4" />
            )}
        </button>
    );
};
