"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import ProjectCard, { ProjectItem } from "../assets/projectCard";
import ProjectSkeleton from "../loading/projectSkeleton";

const Projects = () => {
  const t = useTranslations("Projects");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setProjects(result.data.slice(0, 4));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // مراقب السكرول الآمن (يعمل مرة واحدة عند ظهور القسم)
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // تفعيل الحركة بمجرد ظهور القسم وانتهاء تحميل الـ API
  const showContent = isVisible && !loading;

  return (
    <section
      className="w-full bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 border-t border-green-500/5 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
      id="projects"
    >
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div ref={sectionRef} className="max-w-5xl mx-auto">
        {/* عنوان القسم */}
        <div
          className={`mb-16 font-mono text-xs md:text-sm tracking-widest text-green-500/60 uppercase flex items-center gap-2 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
        >
          <span>{"//"}</span>
          <span>{t("sectionTag")}</span>
        </div>

        {/* شبكة المشاريع */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-green-500/10 pt-12">
          {loading && <ProjectSkeleton count={2} />}

          {!loading && error && (
            <div className="col-span-full py-12 text-center font-mono text-sm text-red-400/80 border border-red-500/10 bg-red-500/[0.01] rounded-xl">
              {`// Error_Loading_Projects`}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="col-span-full py-12 text-center font-mono text-sm text-green-400/80 border border-green-500/10 bg-green-500/[0.01] rounded-xl">
              {`// No Projects Found`}
            </div>
          )}

          {!loading &&
            !error &&
            projects.map((project, index) => (
              <div
                key={project._id}
                style={{
                  transitionDelay: showContent ? `${index * 130}ms` : "0ms",
                }}
                className={`transition-all duration-700 ease-out ${showContent
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-10 scale-95"
                  }`}
              >
                <ProjectCard project={project} isRtl={isRtl} />
              </div>
            ))}
        </div>

        {/* زر عرض كل المشاريع */}
        {!loading && !error && projects.length > 0 && (
          <div
            style={{ transitionDelay: showContent ? "450ms" : "0ms" }}
            className={`mt-12 flex justify-center transition-all duration-700 ease-out ${showContent
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
              }`}
          >
            <Link
              href={`/${currentLocale}/projects`}
              className="group flex-1 max-w-[75%] sm:max-w-md py-4 px-6 text-xs font-mono rounded-lg bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 hover:border-green-500/30 text-green-400 flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg shadow-black/40"
            >
              <span>{t("viewProjects")}</span>
              <span
                className={`transition-transform duration-300 ${isRtl
                    ? "group-hover:-translate-x-1.5"
                    : "group-hover:translate-x-1.5"
                  }`}
              >
                {isRtl ? "←" : "→"}
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
