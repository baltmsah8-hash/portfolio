"use client";

import { useState, useEffect } from "react";
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

  return (
    <section
      className="w-full bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 border-t border-green-500/5 relative"
      dir={isRtl ? "rtl" : "ltr"}
      id="projects"
    >
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto">

        <div className="mb-16 font-mono text-xs md:text-sm tracking-widest text-green-500/60 uppercase flex items-center gap-2">
          <span>{"//"}</span>
          <span>{t("sectionTag")}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-green-500/10 pt-12">

          {loading && <ProjectSkeleton count={2} />}

          {!loading && error && (
            <div className="col-span-full py-12 text-center font-mono text-sm text-red-400/80 border border-red-500/10 bg-red-500/[0.01] rounded-xl">
              {`// Error_Loading_Projects`}
            </div>
          )}

          {!projects && !error && (
            <div className="col-span-full py-12 text-center font-mono text-sm text-green-400/80 border border-green-500/10 bg-green-500/[0.01] rounded-xl">
              {`// No Projects Found`}
            </div>
          )}

          {!loading && !error && projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              isRtl={isRtl}
            />
          ))}
        </div>

        {!loading && !error && projects.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link
              href="/projects"
              className="flex-1 max-[75%] py-4 px-4 text-xs font-mono rounded-lg bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 hover:border-green-500/30 text-green-400 flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
            >
              <span>{t("viewProjects")}</span>
              <span className={`transition-transform duration-300 ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
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
