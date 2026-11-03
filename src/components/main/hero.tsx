"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";

const Robot3D = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

const Hero = () => {
  const t = useTranslations("Hero");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";

  return (
    <main
      className="relative min-h-screen w-full bg-[#02040a] text-white overflow-hidden flex items-center"
      dir={isRtl ? "rtl" : "ltr"}
    >

      <div className="absolute top-1/4 left-1/4 w-[350px] h-[300px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto z-10">
        <Robot3D scene="https://prod.spline.design/I3XQDee3E3Dg2mIC/scene.splinecode" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 z-20 pointer-events-none relative w-full">
        <div
          className={`max-w-2xl flex flex-col gap-4 ${isRtl ? "text-right" : "text-left"}`}
        >

          <div className="inline-block w-max">
            <h2
              className={`text-2xl max-md:text-xl font-extrabold tracking-tight overflow-hidden whitespace-nowrap `}
            >
              {t("titleFirst")}{" "}
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {t("titleSecond")}
              </span>
            </h2>
          </div>

          <p className="text-gray-400 text-base md:text-lg leading-relaxed min-lg:max-w-lg max-w-md mt-2 pointer-events-auto whitespace-pre-line">
            {t("description")}
          </p>

          <div className="mt-4 pointer-events-auto">
            <button className="px-6 py-3 rounded-full bg-green-500/5 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 font-medium text-sm backdrop-blur-sm cursor-pointer shadow-lg shadow-green-950/20 text-green-400">
              {t("buttonText")}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-8 z-20 pointer-events-none select-none ${isRtl ? "left-8 md:left-12" : "right-8 md:right-12"}`}
      >
        <h1
          className="text-2xl md:text-3xl bg-gradient-to-r from-gray-200 via-gray-400 to-gray-500 bg-clip-text text-transparent opacity-90 tracking-wide font-medium"
          style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive" }}
        >
          Abdelrahman Hany
        </h1>
      </div>
    </main>
  );
}

export default Hero;