"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/src/hooks/useScroll";

interface ServiceItem {
  id: string;
  titleKey: string;
  descKey: string;
  techTags: string[];
}

const Services = () => {
  const t = useTranslations("Services");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";

  const [activeId, setActiveId] = useState<string | null>("frontend");
  const { ref, isVisible } = useScrollReveal();

  const servicesData: ServiceItem[] = [
    {
      id: "frontend",
      titleKey: "frontendTitle",
      descKey: "frontendDesc",
      techTags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      id: "mobile",
      titleKey: "mobileTitle",
      descKey: "mobileDesc",
      techTags: ["React Native", "Cross-Platform", "Fluid UI"],
    },
    {
      id: "backend",
      titleKey: "backendTitle",
      descKey: "backendDesc",
      techTags: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Payment Gateways"],
    },
    {
      id: "fullstack",
      titleKey: "fullstackTitle",
      descKey: "fullstackDesc",
      techTags: ["MERN Stack", "Next.js Full-Stack", "PERN Stack", "RESTful APIs"],
    },
  ];

  return (
    <section
      className="w-full bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 border-t border-green-500/5 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
      id="services"
    >
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className="max-w-5xl mx-auto">
        {/* عنوان القسم */}
        <div
          className={`mb-16 font-mono text-xs md:text-sm tracking-widest text-green-500/60 uppercase flex items-center gap-2 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
        >
          <span>{"//"}</span>
          <span>{t("sectionTag")}</span>
        </div>

        {/* قائمة الخدمات */}
        <div className="flex flex-col border-t border-green-500/10">
          {servicesData.map((service, index) => {
            const isOpen = activeId === service.id;
            const serviceNumber = `0${index + 1}`;

            return (
              <div
                key={service.id}
                style={{ transitionDelay: `${index * 130}ms` }}
                className={`relative border-b border-green-500/10 transition-all duration-700 ease-out group overflow-hidden ${isOpen ? "bg-green-500/[0.03]" : "hover:bg-green-500/[0.015]"
                  } ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                  }`}
              >
                {/* شريط نيون جانبي يضيء عند الفتح أو الـ Hover */}
                <span
                  className={`absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-400 to-green-500 transition-all duration-500 ${isRtl ? "right-0" : "left-0"
                    } ${isOpen
                      ? "opacity-100 scale-y-100 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                      : "opacity-0 scale-y-0 group-hover:opacity-60 group-hover:scale-y-75"
                    }`}
                />

                <button
                  onClick={() => setActiveId(isOpen ? null : service.id)}
                  className="w-full py-8 md:py-10 px-3 sm:px-5 flex items-center justify-between cursor-pointer focus:outline-none bg-transparent border-0"
                >
                  <div className="flex items-baseline gap-4 sm:gap-6">
                    {/* رقم الخدمة */}
                    <span
                      className={`text-xs sm:text-sm font-mono transition-colors duration-300 ${isOpen
                          ? "text-green-400 font-bold"
                          : "text-green-500/40 group-hover:text-green-400/80"
                        }`}
                    >
                      {serviceNumber}
                    </span>

                    {/* عنوان الخدمة مع إزاحة ناعمة عند الـ Hover */}
                    <h3
                      className={`text-xl sm:text-2xl md:text-4xl font-bold tracking-tight transition-all duration-300 font-mono ${isOpen
                          ? "text-green-400"
                          : `text-gray-400 group-hover:text-gray-100 ${isRtl ? "group-hover:-translate-x-2" : "group-hover:translate-x-2"
                          }`
                        } ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {t(service.titleKey)}
                    </h3>
                  </div>

                  {/* أيقونة الفتح والإغلاق */}
                  <div
                    className={`flex-shrink-0 mx-2 p-2.5 rounded-full border transition-all duration-300 ${isOpen
                        ? "border-green-500/40 bg-green-500/10 rotate-90"
                        : "border-transparent group-hover:border-green-500/20 group-hover:bg-green-500/5"
                      }`}
                  >
                    {isOpen ? (
                      <X className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-hover:text-green-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </div>
                </button>

                {/* تفاصيل الخدمة */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isOpen
                      ? "grid-rows-[1fr] opacity-100 pb-8 md:pb-10"
                      : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="overflow-hidden px-3 sm:px-5">
                    <div
                      className={`max-w-3xl flex flex-col gap-4 ${isRtl ? "sm:pr-10" : "sm:pl-10"
                        }`}
                    >
                      <p
                        className={`text-gray-400 text-sm md:text-base leading-relaxed font-sans ${isRtl ? "text-right" : "text-left"
                          }`}
                      >
                        {t(service.descKey)}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2 justify-start">
                        {service.techTags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-[10px] md:text-xs font-mono px-3 py-1 rounded-md bg-green-500/5 border border-green-500/15 text-green-400/90 hover:border-green-400/50 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
