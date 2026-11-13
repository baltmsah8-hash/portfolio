"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAlert } from "@/src/context/alert";
import { User, Mail, Phone, Calendar, LogOut, MessageSquare, Edit2, Check, X, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import ProfileSkeleton from "@/src/components/loading/profileSkeleton";

interface UserData {
    userId: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

const ProfilePage = () => {
    const t = useTranslations("Profile");
    const currentLocale = useLocale();
    const router = useRouter();
    const isRtl = currentLocale === "ar";
    const dateLocale = isRtl ? ar : enUS;
    const { showAlert } = useAlert();

    const [user, setUser] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

    const fetchProfile = async () => {
        setPageLoading(true);

        try {
            const res = await fetch(`/api/user/profile`, {
                method: "GET",
                credentials: "include",
            });

            if (res.status === 401 || res.status === 403) {
                router.push(`/${currentLocale}/auth`);
                return;
            }

            const data = await res.json();

            if (data.success && data.user) {
                setUser(data.user);
                setFormData({
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone || "",
                });
            } else {
                router.push(`/${currentLocale}/auth`);
            }
        } catch (error) {
            console.error("Failed to load profile, redirecting to login:", error);
            router.push(`/${currentLocale}/auth`);
        } finally {
            setPageLoading(false);
        }
    };

    const updateUser = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e && e.preventDefault) e.preventDefault();

        setLoading(true);
        try {

            const phoneRegex = /^(01\d{9})|(\+[1-9]\d{1,14})$/;
            if (!phoneRegex.test(formData.phone)) {
                showAlert(isRtl ? "رقم الهاتف غير صالح" : "Invalid phone number", "error");
                setLoading(false);
                setIsEditing(true);
                return;
            }

            const res = await fetch(`/api/user/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            if (res.status === 401 || res.status === 403) {
                router.push(`/${currentLocale}/auth`);
                return;
            }

            const data = await res.json();
            if (data.success) {
                setIsEditing(false);
                fetchProfile();
            } else {
                showAlert(data.error, "error");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);

        try {
            const res = await fetch(`/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();
            if (data.success) {
                router.push(`/${currentLocale}/auth`);
            } else {
                showAlert(isRtl ? "حدث خطأ اثناء تسجيل الخروج" : "Error during logout", "error");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        fetchProfile();
    }, [currentLocale, router]);


    if (pageLoading) {
        return (
            <ProfileSkeleton />
        );
    }

    if (!user) return null;

    return (
        <main className="relative min-h-screen w-full bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[300px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-3xl w-full bg-[#070a13]/40 border border-green-500/10 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-black/80 relative z-10">

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-green-500/10 pb-8 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
                            <div className="relative w-24 h-24 rounded-full bg-[#02040a] border-2 border-green-400 flex items-center justify-center text-green-400 font-mono text-3xl font-black shadow-inner">
                                {formData.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 text-black p-1.5 rounded-full border border-[#02040a] shadow-md">
                                <User className="w-3 h-3 font-bold" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
                                {formData.name}
                            </h1>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/20 text-[10px] font-mono text-green-400 uppercase">
                                <ShieldAlert className="w-3 h-3" />
                                <span>{user.role}</span>
                            </div>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/5 border border-green-500/20 text-green-400 text-xs font-mono font-bold hover:bg-green-500/10 transition-all duration-300 cursor-pointer">
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{t("editBtn")}</span>
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(false)} className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-300 cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <form onSubmit={updateUser} className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-green-500" /> {t("nameLabel")}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-xl font-mono text-sm border bg-[#02040a]/60 text-white transition-all duration-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${isEditing ? "border-green-500/30 text-white shadow-[0_0_10px_rgba(34,197,94,0.1)]" : "border-transparent text-gray-400 cursor-not-allowed opacity-80"
                                    }`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-green-500" /> {t("phoneLabel")}
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-xl font-mono text-sm border bg-[#02040a]/60 text-white transition-all duration-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${isEditing ? "border-green-500/30 text-white shadow-[0_0_10px_rgba(34,197,94,0.1)]" : "border-transparent text-gray-400 cursor-not-allowed opacity-80"
                                    }`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-green-500" /> {t("emailLabel")}
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-transparent bg-[#02040a]/40 font-mono text-sm text-gray-500 cursor-not-allowed opacity-60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-green-500" /> {t("joinLabel")}
                            </label>
                            <input
                                type="text"
                                value={`${new Date(user.createdAt).toLocaleDateString(currentLocale)} (${formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: dateLocale })})`}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-transparent bg-[#02040a]/40 font-mono text-xs text-gray-500 cursor-not-allowed opacity-60"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-green-500" /> {t("updateLabel")}
                            </label>
                            <input
                                type="text"
                                value={formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true, locale: dateLocale })}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-transparent bg-[#02040a]/40 font-mono text-sm text-gray-400 cursor-not-allowed opacity-80"
                            />
                        </div>

                    </div>

                    {isEditing && (
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 text-black font-bold font-mono text-xs hover:bg-green-400 transition-all duration-300 shadow-lg shadow-green-950/40 disabled:opacity-50 cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                <span>{loading ? t("saving") : t("saveBtn")}</span>
                            </button>
                        </div>
                    )}
                </form>

                <div className="mt-12 pt-8 border-t border-green-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <Link
                        href={`/${currentLocale}/chat`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold font-mono text-sm hover:from-transparent hover:to-transparent hover:text-green-400 border border-transparent hover:border-green-500/40 shadow-xl shadow-green-950/30 transition-all duration-300 group"
                    >
                        <MessageSquare className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                        <span>{t("chatBtn")}</span>
                    </Link>

                    <button
                        onClick={logout}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-bold font-mono text-xs transition-all duration-300 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>{t("logoutBtn")}</span>
                    </button>
                </div>

            </div>
        </main>
    );
};

export default ProfilePage;
