"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X, ArrowUpRight } from "lucide-react";

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
      className="w-full bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 border-t border-green-500/5 relative"
      dir={isRtl ? "rtl" : "ltr"}
      id="services"
    >
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        
        <div className="mb-16 font-mono text-xs md:text-sm tracking-widest text-green-500/60 uppercase flex items-center gap-2">
          <span>{"//"}</span>
          <span>{t("sectionTag")}</span>
        </div>

        <div className="flex flex-col border-t border-green-500/10">
          {servicesData.map((service) => {
            const isOpen = activeId === service.id;

            return (
              <div
                key={service.id}
                className={`border-b border-green-500/10 transition-all duration-500 group ${
                  isOpen ? "bg-green-500/[0.02]" : "hover:bg-green-500/[0.01]"
                }`}
              >
                <button
                  onClick={() => setActiveId(isOpen ? null : service.id)}
                  className="w-full py-8 md:py-10 flex items-center justify-between cursor-pointer focus:outline-none bg-transparent border-0"
                >
                  <h3 
                    className={`text-xl sm:text-2xl md:text-4xl font-bold tracking-tight transition-colors duration-300 font-mono ${
                      isOpen ? "text-green-400" : "text-gray-400 group-hover:text-gray-200"
                    } ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    {t(service.titleKey)}
                  </h3>

                  <div className="flex-shrink-0 mx-4">
                    {isOpen ? (
                      <X className="w-5 h-5 md:w-6 md:h-6 text-green-400 transition-transform duration-300" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-hover:text-green-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 pb-8 md:pb-10" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden px-1">
                    <div className="max-w-3xl flex flex-col gap-4">
                      
                      <p className={`text-gray-400 text-sm md:text-base leading-relaxed font-sans ${isRtl ? 'text-right' : 'text-left'}`}>
                        {t(service.descKey)}
                      </p>

                      <div className={`flex flex-wrap gap-2 mt-2 ${isRtl ? 'justify-start' : 'justify-start'}`}>
                        {service.techTags.map((tag, index) => (
                          <span 
                            key={index}
                            className="text-[10px] md:text-xs font-mono px-2.5 py-1 rounded-md bg-green-500/5 border border-green-500/10 text-green-400/80"
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
}

export default Services;