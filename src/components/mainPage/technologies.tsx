"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import technologiesData from "@/src/data/technologies.json";
import { useScrollReveal } from "@/src/hooks/useScroll";

const Technologies = () => {
  const t = useTranslations("Technologies");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="technologies"
      className="w-full bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 border-t border-green-500/5 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute bottom-10 left-10 w-[250px] h-[250px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div ref={ref} className="max-w-5xl mx-auto">
        <div
          className={`mb-16 font-mono text-xs md:text-sm tracking-widest text-green-500/60 uppercase flex items-center gap-2 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span>{"//"} {t("sectionTag")}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {technologiesData.map((tech, index) => (
            <div
              key={tech.id}
              style={{
                transitionDelay: isVisible ? `${Math.min(index * 55, 800)}ms` : "0ms",
              }}
              className={`relative group p-5 md:p-6 rounded-xl bg-green-500/[0.01] border border-green-500/10 hover:border-green-500/40 hover:bg-green-500/[0.03] hover:-translate-y-1.5 transition-all duration-500 ease-out flex flex-col items-center justify-center gap-4 text-center cursor-pointer shadow-lg shadow-black/50 ${
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-95"
              }`}
            >
              <div className="absolute inset-0 bg-green-500/0 rounded-xl opacity-0 group-hover:opacity-100 group-hover:bg-green-500/[0.03] blur-xl transition-all duration-300 -z-10" />

              <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center filter brightness-90 grayscale group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-300">
                <Image
                  src={tech.logo}
                  alt={`${tech.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain pointer-events-none transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                />
              </div>

              <span className="text-sm md:text-base font-semibold text-gray-400 group-hover:text-green-400 font-mono transition-colors duration-300 tracking-wide">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Technologies;
