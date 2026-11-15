"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import RobotSkeleton from "../loading/robotSkeleton";
import CyberCore from "../assets/logo_mobile&tablat";

const Robot3D = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <RobotSkeleton />,
});

const Hero = () => {
  const t = useTranslations("Hero");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <section
      className="relative min-h-screen w-full bg-[#02040a] text-white overflow-x-clip flex items-center justify-center py-24 lg:py-0"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transform-gpu" />

      {isDesktop && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 pointer-events-auto">
          <Robot3D scene="/robot/scene.splinecode" />
        </div>
      )}

      <div className="container mx-auto px-6 md:px-12 lg:px-20 z-20 pointer-events-none relative w-full flex flex-col items-center lg:items-start">
        {isDesktop === false && (
          <div className="w-64 h-64 sm:w-72 sm:h-72 mb-6 flex items-center justify-center">
            <CyberCore />
          </div>
        )}

        <div
          className={`max-w-2xl flex flex-col gap-4 items-center text-center lg:items-start ${
            isRtl ? "lg:text-right" : "lg:text-left"
          }`}
        >
          <div className="inline-block max-w-full">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {t("titleFirst")}{" "}
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {t("titleSecond")}
              </span>
            </h1>
          </div>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-md lg:max-w-lg mt-1 pointer-events-auto whitespace-pre-line drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
            {t("description")}
          </p>

          <div className="mt-4 pointer-events-auto">
            <Link
              href={`/${currentLocale}/projects`}
              className="inline-block px-7 py-3 rounded-full bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 font-medium text-sm lg:backdrop-blur-sm cursor-pointer shadow-lg shadow-green-950/20 text-green-400"
            >
              {t("buttonText")}
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-6 z-20 pointer-events-none select-none ${
          isRtl ? "left-6 md:left-12" : "right-6 md:right-12"
        }`}
      >
        <p
          className="text-xl md:text-3xl bg-gradient-to-r from-gray-200 via-gray-400 to-gray-500 bg-clip-text text-transparent opacity-90 tracking-wide font-medium"
          style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive" }}
        >
          Abdelrhman Hany
        </p>
      </div>
    </section>
  );
};

export default Hero;
