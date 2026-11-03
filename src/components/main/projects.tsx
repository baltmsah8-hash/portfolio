"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ProjectCard, { ProjectItem } from "../projectCard";
import ProjectSkeleton from "../projectSkeleton";

const Projects = () => {
  const t = useTranslations("Projects");
  const currentLocale = useLocale();
  const isRtl = currentLocale === "ar";

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();

        setProjects(data.slice(0, 4));
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

          {!loading && !error && projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isRtl={isRtl}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Projects;
