"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Sidebar, DashboardView } from "./_components/sidebar";
import ChatsList from "./_components/chatsList";
import { ProjectsList } from "./_components/projectsList";
import { AddProject } from "./_components/addProject";
import { useAlert } from "@/src/context/alert";
import { MessageSquare } from "lucide-react";

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard = () => {
  const t = useTranslations("Dashboard");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";
  const router = useRouter();
  const { showAlert } = useAlert();

  const [currentView, setCurrentView] = useState<DashboardView>("chats_list");
  const [bootSequence, setBootSequence] = useState(true);
  const [fadeBoot, setFadeBoot] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // 🌟 States مشتركة للعملاء وإجمالي الرسائل غير المقروءة
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fadeTimeout = setTimeout(() => setFadeBoot(true), 2400);
    const bootTimeout = setTimeout(() => setBootSequence(false), 2900);
    return () => { clearTimeout(fadeTimeout); clearTimeout(bootTimeout); };
  }, []);

  // 🌟 جلب العملاء والعداد الإجمالي مرة واحدة هنا
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });

        if (res.status === 401 || res.status === 403) {
          router.push(`/${currentLocale}/auth`);
          return;
        }

        const data = await res.json();

        if (res.ok && data.success && data.data) {
          const customersOnly = data.data.filter((user: UserData) => user.role !== "admin");
          setUsers(customersOnly);

          const unreadSum = data.unReadedMessages?.[0]?.totalSum || 0;
          setTotalUnread(unreadSum);
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, currentLocale]);


  const logout = async () => {

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
    }
  };

  if (bootSequence) {
    return (
      <div className={`fixed inset-0 z-50 bg-[#02040a] flex flex-col items-center justify-center font-mono p-4 transition-opacity duration-500 ${fadeBoot ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-green-500/10 rounded-full blur-[100px]" />
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black py-6 mb-4 text-center uppercase bg-gradient-to-r from-white via-green-400 to-emerald-500 bg-clip-text text-transparent animate-pulse">
          {isRtl ? "مرحباً عبد الرحمن" : "Welcome, Abdelrahman"}
        </h1>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span className="tracking-widest uppercase">INITIALIZING_SYSTEM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#02040a] text-white flex pt-20 h-[calc(100vh-45px)] overflow-hidden select-none relative" dir={isRtl ? "rtl" : "ltr"}>

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={logout}
        t={t}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        totalUnread={totalUnread}
        isRtl={isRtl}
      />

      {/* الزر العائم للموبايل مع عداد الرسائل */}
      <button onClick={() => { setCurrentView("chats_list"); setIsOpenMobile(!isOpenMobile); }} className="md:hidden fixed bottom-16 left-6 z-40 p-4 rounded-full bg-green-500 text-black hover:bg-green-400 font-bold shadow-xl cursor-pointer">
        <MessageSquare className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-black flex items-center justify-center animate-bounce">
            {totalUnread}
          </span>
        )}
      </button>

      <main className="flex-1 h-full overflow-y-auto p-6 md:p-10 relative z-10 custom-scrollbar">
        <div className="mb-8 pb-4 border-b border-green-500/5">
          <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight uppercase text-white">
            {currentView === "chats_list" && t("chatControlLogs")}
            {currentView === "projects_list" && t("projectRepository")}
            {currentView === "add_project" && t("deployProjectCode")}
          </h2>
        </div>

        <div className="w-full">
          {currentView === "chats_list" && (
            <ChatsList
              currentLocale={currentLocale}
              router={router}
              users={users}
              loading={usersLoading}
            />
          )}
          {currentView === "projects_list" && <ProjectsList t={t} showAlert={showAlert} isRtl={isRtl} />}
          {currentView === "add_project" && <AddProject t={t} showAlert={showAlert} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;