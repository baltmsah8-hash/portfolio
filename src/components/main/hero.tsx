"use client";
import React from 'react'
import dynamic from 'next/dynamic';

const Robot3D = dynamic(
    () => import('@splinetool/react-spline'),
    { ssr: false }
);

const Hero = () => {
  return (
    <main className="relative min-h-screen w-full bg-[#030712] text-white overflow-hidden flex flex-col items-center justify-center">
      
      {/* 1. تأثير الهالة الضوئية الملونة خلف الروبوت
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* 2. حاوية الروبوت ثلاثي الأبعاد */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        {/* 👇 حط الرابط اللي نسخته من موقع Spline بين القوسين هنا 👇 */}
      </div>

      {/* 3. الإمضاء بتاعك مكتوب في الكود فوق المجسم وبخط يدوي أنيق */}
      <div className="absolute bottom-12 right-12 z-10 pointer-events-none select-none">
        <h1 
          className="text-3xl md:text-4xl text-gray-300 opacity-80 tracking-wide"
          style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive" }}
        >
          Abdelrahman Hany
        </h1>
      </div>

      {/* 4. محتوى موقعك الأساسي (تقدر تعدله براحتك) */}
      <div className="z-20 text-center pointer-events-auto mt-[-100px]">
        <h2 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
          المستقبل يبدأ هنا
        </h2>
        <p className="mt-4 text-gray-400 text-lg max-w-md mx-auto">
          هذا النص يظهر فوق الخلفية التفاعلية ثلاثية الأبعاد بوضوح تام.
        </p>
      </div>
        <Robot3D scene="https://prod.spline.design/I3XQDee3E3Dg2mIC/scene.splinecode" />

    </main>
  );
}

export default Hero;