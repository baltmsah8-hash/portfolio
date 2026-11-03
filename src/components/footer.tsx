"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const t = useTranslations("Footer");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";
  const getLocalizedHref = (hash: string) => `/${currentLocale}${hash}`;

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full bg-[#02040a] text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-green-500/5 relative"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-green-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col gap-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-green-500/10 pb-16">
          <div className="max-w-lg">
            <h2 className="pt-6 text-2xl md:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-green-500/50">
              {t("ctaTitle")}
            </h2>
            <p className="mt-4 text-gray-400 text-sm md:text-base">
              {t("ctaDesc")}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link
              href={getLocalizedHref("#contact")}
              className="group inline-flex items-center gap-2 px-6 py-4 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-black font-bold font-mono transition-all duration-300 shadow-lg shadow-green-950/20"
            >
              <span>{t("ctaButton")}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-sm">
          <div className="flex flex-col gap-4">
            <Link 
              href={`/${currentLocale}`} 
              className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-wider font-mono"
            >
              PORTFOLIO.
            </Link>
            <p className="text-gray-500 leading-relaxed text-xs">
              {t("brandDesc")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs text-green-500/60 uppercase tracking-widest">{"//"} {t("linksTitle")}</span>
            <div className="flex flex-col gap-2 font-mono text-gray-400">
              <Link href={getLocalizedHref("/")} className="hover:text-green-400 transition-colors w-max">{t("linkHome")}</Link>
              <Link href={getLocalizedHref("#services")} className="hover:text-green-400 transition-colors w-max">{t("linkServices")}</Link>
              <Link href={getLocalizedHref("#projects")} className="hover:text-green-400 transition-colors w-max">{t("linkProjects")}</Link>
              <Link href={getLocalizedHref("#technologies")} className="hover:text-green-400 transition-colors w-max">{t("linkTech")}</Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs text-green-500/60 uppercase tracking-widest">{"//"} {t("socialsTitle")}</span>
            <div className="flex gap-4 text-gray-400 mt-1">
              {/* <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-green-500/[0.02] border border-green-500/5 hover:border-green-500/30 hover:text-green-400 transition-all shadow-md">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-green-500/[0.02] border border-green-500/5 hover:border-green-500/30 hover:text-green-400 transition-all shadow-md">
                <Linkedin className="w-5 h-5" />
              </a> */}
              <a href="mailto:baltmsah8@gmail.com" className="p-3 rounded-xl bg-green-500/[0.02] border border-green-500/5 hover:border-green-500/30 hover:text-green-400 transition-all shadow-md">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-green-500/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-500">
          <div>
            © {currentYear} All rights reserved
          </div>
          <span 
            className="text-xl text-gray-400 tracking-wide font-medium ml-1 select-none"
            style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive" }}
          >
            Abdelrahman Hany
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;