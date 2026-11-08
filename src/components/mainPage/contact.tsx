"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

const Contact = () => {
  const t = useTranslations("Contact");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";

  return (
    <section 
      id="contact" 
      className="w-full bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[70vh] border-t border-green-500/5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-green-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full bg-[#070a13]/40 border border-green-500/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 text-center flex flex-col items-center gap-8 shadow-2xl shadow-black/80 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/5 border border-green-500/20 text-xs font-mono text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {t("availability")}
        </div>

        <h2 className="pt-6 text-2xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight leading-normal max-w-2xl bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent uppercase">
          {t("title")}
        </h2>

        <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
          {t("description")}
        </p>

        <div className="mt-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-green-500 text-black font-bold font-mono text-sm hover:bg-transparent hover:text-green-400 border border-transparent hover:border-green-500/40 shadow-xl shadow-green-950/30 transition-all duration-300 group"
          >
            <span>{t("buttonText")}</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-8 w-full border-t border-green-500/5 pt-8">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono font-semibold">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[10px]">💻</div>
            <span>Abdelrahman Hany</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Contact;