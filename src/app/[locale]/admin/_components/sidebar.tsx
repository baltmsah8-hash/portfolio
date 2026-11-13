"use client";

import React from "react";
import { LayoutDashboard, FolderPlus, FolderKanban, MessageSquare, LogOut, Terminal, X } from "lucide-react";

export type DashboardView = "projects_list" | "add_project" | "chats_list";

interface SidebarProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  onLogout: () => void;
  t: (key: string) => string;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  totalUnread: number;
  isRtl: boolean; // 🌟 ضفنا دي عشان نحدد مكانه وحركته بدقة في العربي والإنجليزي
}

export const Sidebar = ({
  currentView,
  setCurrentView,
  onLogout,
  t,
  isOpenMobile,
  setIsOpenMobile,
  totalUnread,
  isRtl,
}: SidebarProps) => {
  const handleSelectView = (view: DashboardView) => {
    setCurrentView(view);
    setIsOpenMobile(false);
  };

  // 🌟 تحديد مكان وحركة السايد بار في الموبايل بوضوح تام
  const mobilePositionClass = isRtl
    ? `right-0 ${isOpenMobile ? "translate-x-0" : "translate-x-full"}`
    : `left-0 ${isOpenMobile ? "translate-x-0" : "-translate-x-full"}`;

  return (
    <>
      {/* خلفية معتمة للموبايل تقفل السايد بار لو ضغطت بره */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`w-64 bg-[#070a13]/95 border-e border-green-500/10 backdrop-blur-xl flex flex-col justify-between p-5 flex-shrink-0 z-50 fixed md:relative top-20 md:top-0 h-[calc(100dvh-80px)] md:h-full transition-transform duration-300 ease-in-out md:translate-x-0 ${mobilePositionClass}`}
      >
        {/* القسم العلوي: الهيدر والأزرار */}
        <div className="flex-1 flex flex-col min-h-0 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-green-500/10 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-5 h-5 text-green-400" />
              <div>
                <h1 className="text-xs font-mono font-black tracking-widest text-white flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-green-500" /> {t("adminTitle")}
                </h1>
                <span className="text-[9px] font-mono text-green-400/60 uppercase">{t("superAdminRole")}</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpenMobile(false)}
              className="md:hidden p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 w-full pe-1">
            <button
              onClick={() => handleSelectView("chats_list")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all duration-300 border cursor-pointer ${
                currentView === "chats_list"
                  ? "bg-green-500 text-black border-transparent shadow-lg"
                  : "bg-transparent text-gray-400 border-transparent hover:text-green-400 hover:bg-green-500/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>{t("customerChatsBtn")}</span>
              </div>

              {totalUnread > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse ${
                    currentView === "chats_list"
                      ? "bg-black text-green-400"
                      : "bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  }`}
                >
                  {totalUnread}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectView("projects_list")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all duration-300 border cursor-pointer ${
                currentView === "projects_list"
                  ? "bg-green-500 text-black border-transparent shadow-lg shadow-green-950/20"
                  : "bg-transparent text-gray-400 border-transparent hover:text-green-400 hover:bg-green-500/5"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>{t("manageProjectsBtn")}</span>
            </button>

            <button
              onClick={() => handleSelectView("add_project")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all duration-300 border cursor-pointer ${
                currentView === "add_project"
                  ? "bg-green-500 text-black border-transparent shadow-lg shadow-green-950/20"
                  : "bg-transparent text-gray-400 border-transparent hover:text-green-400 hover:bg-green-500/5"
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>{t("addNewProjectBtn")}</span>
            </button>
          </nav>
        </div>

        {/* القسم السفلي: زرار تسجيل الخروج ظاهر وثابت في آخر الشاشة */}
        <div className="pt-4 border-t border-green-500/10 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("logoutBtn")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
