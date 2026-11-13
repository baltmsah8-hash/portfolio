"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Menu, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const t = useTranslations("Navbar");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const isRtl = currentLocale === "ar";

  const isAdmin = pathname.includes("/admin");

  const navItems = [
    { id: "home", label: t("home"), href: "/" },
    { id: "services", label: t("services"), href: "#services" },
    { id: "projects", label: t("projects"), href: "#projects" },
    { id: "technologies", label: t("technologies"), href: "#technologies" },
    { id: "contact", label: t("contact"), href: "#contact" },
  ];

  const toggleLanguage = () => {
    const nextLocale = isRtl ? "en" : "ar";
    const cleanedPath = pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
    const newPath = `/${nextLocale}${cleanedPath === "" ? "" : cleanedPath}`;
    router.push(newPath);
  };

  const checkActive = (itemHref: string) => {
    const currentPath = pathname;
    const localizedHref = `/${currentLocale}${itemHref === "/" ? "" : itemHref}`;
    if (itemHref === "/") {
      return currentPath === `/${currentLocale}` || currentPath === `/`;
    }
    return currentPath.startsWith(localizedHref) || currentPath.startsWith(itemHref);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-green-500/10 text-gray-200" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          <div className="flex-shrink-0">
            <Link href={`/${currentLocale}`} className="text-2xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent tracking-wider hover:opacity-90 transition-opacity font-mono">
              ABDO.
            </Link>
          </div>

          {!isAdmin && (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const isActive = checkActive(item.href);
                const finalHref = item.href === "/" ? `/${currentLocale}` : `/${currentLocale}${item.href}`;
                return (
                  <Link
                    key={item.id}
                    href={finalHref}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/5 transition-all duration-300",
                      isActive && "text-green-400 bg-green-500/10 border border-green-500/20 shadow-sm shadow-green-950/20"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-green-500/20 bg-green-950/20 hover:bg-green-500/10 hover:border-green-400/50 text-green-400 transition-all duration-300 cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-green-400" />
              <span>{isRtl ? "English" : "العربية"}</span>
            </button>

            {!isAdmin && (
              <Link href={`/${currentLocale}/profile`} className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-full group bg-gradient-to-br from-green-500 to-teal-500 text-green-400 focus:ring-4 focus:outline-none focus:ring-green-900">
                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-[#02040a] rounded-full group-hover:bg-opacity-50 group-hover:text-white font-bold">
                  {t("contact")}
                </span>
              </Link>
            )}
          </div>

          <div className="flex w-max md:hidden items-center gap-3">
            <button onClick={toggleLanguage} className="p-2 rounded-full bg-green-950/20 border border-green-500/20 text-green-400">
              <Globe className="w-4 h-4" />
            </button>

            {!isAdmin && (
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/5 focus:outline-none">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>

        </div>
      </div>

      {!isAdmin && (
        <div className={cn("md:hidden bg-[#02040a] border-b border-green-500/10 px-4 pt-2 pb-6 space-y-2 transition-all duration-300 hidden", isOpen && "block")}>
          {navItems.map((item) => {
            const isActive = checkActive(item.href);
            const finalHref = item.href === "/" ? `/${currentLocale}` : `/${currentLocale}${item.href}`;
            return (
              <Link key={item.id} href={finalHref} onClick={() => setIsOpen(false)} className={cn("block px-4 py-3 rounded-xl text-base font-medium text-gray-400 hover:text-green-400 hover:bg-green-500/5 transition-all", isActive && "text-green-400 bg-green-500/10 border-l-2 border-green-500 rounded-l-none")}>
                {item.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-green-500/10">
            <Link href={`/${currentLocale}/profile`} onClick={() => setIsOpen(false)} className="block w-full text-center py-3 px-5 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold transition-all shadow-lg shadow-green-950/30">
              {t("contact")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

