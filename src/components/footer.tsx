"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const t = useTranslations("Footer");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const isRtl = currentLocale === "ar";

  const currentYear = new Date().getFullYear();
  const getLocalizedHref = (hash: string) => `/${currentLocale}${hash}`;

  // فوتر مبسط لصفحات لوحة التحكم
  if (pathname.includes("/admin")) {
    return (
      <footer
        className="w-full py-4 bg-[#02040a] border-t border-green-500/5 text-center relative z-20"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <p className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
          {isRtl ? `لوحة الإدارة © ${currentYear}` : `Admin Dashboard © ${currentYear}`}
        </p>
      </footer>
    );
  }

  return (
    <footer
      className="w-full bg-[#02040a] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-green-500/10 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[320px] h-[120px] bg-green-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col gap-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-green-500/10 pb-10">
          <div className="max-w-md">
            <h2 className="text-xl sm:text-2xl md:text-3xl py-4 font-bold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-green-400">
              {t("ctaTitle")}
            </h2>
            <p className="mt-2 text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t("ctaDesc")}
            </p>
          </div>

          <Link
            href={getLocalizedHref("#contact")}
            className="group self-start sm:self-center inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500 hover:text-black font-bold font-mono text-xs sm:text-sm transition-all duration-300 shrink-0"
          >
            <span>{t("ctaButton")}</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* الشعار */}
          <div className="flex flex-col gap-2 max-w-xs">
            <Link
              href={`/${currentLocale}`}
              className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-wider font-mono w-max"
            >
              ABDO.
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed">
              {t("brandDesc")}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-gray-400">
            <Link href={getLocalizedHref("")} className="hover:text-green-400 transition-colors">
              {t("linkHome")}
            </Link>
            <Link href={getLocalizedHref("#services")} className="hover:text-green-400 transition-colors">
              {t("linkServices")}
            </Link>
            <Link href={getLocalizedHref("#projects")} className="hover:text-green-400 transition-colors">
              {t("linkProjects")}
            </Link>
            <Link href={getLocalizedHref("#technologies")} className="hover:text-green-400 transition-colors">
              {t("linkTech")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="mailto:baltmsah8@gmail.com"
              aria-label="Email"
              className="p-2.5 rounded-xl bg-[#070a13] border border-green-500/15 text-gray-400 hover:border-green-500/50 hover:text-green-400 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Mail className="w-4 h-4" />
            </a>

            <a
              href="https://github.com/baltmsah8-hash"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2.5 rounded-xl bg-[#070a13] border border-green-500/15 text-gray-400 hover:border-green-500/50 hover:text-green-400 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2.5 rounded-xl bg-[#070a13] border border-green-500/15 text-gray-400 hover:border-green-500/50 hover:text-green-400 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-green-500/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-gray-500">
          <p>© {currentYear} Abdelrhman Hany. All rights reserved.</p>
          <span
            className="text-xl text-gray-400 tracking-wide select-none"
            style={{ fontFamily: "var(--font-alex-brush), cursive" }}
          >
            Abdelrhman Hany
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
