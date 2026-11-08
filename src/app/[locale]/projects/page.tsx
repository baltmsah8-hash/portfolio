"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ProjectCard, { ProjectItem } from "@/src/components/assets/projectCard";
import ProjectSkeleton from "@/src/components/loading/projectSkeleton";

const STACK_OPTIONS = ["all", "fullstack", "mobile", "frontend", "backend"] as const;
type StackType = (typeof STACK_OPTIONS)[number];

const AllProjectsPage = () => {
    const t = useTranslations("Projects");
    const currentLocale = useLocale();
    const isRtl = currentLocale === "ar";

    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<StackType>("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const filteredProjects =
        activeFilter === "all"
            ? projects
            : projects.filter((project) => project.stack === activeFilter);

    useEffect(() => {
        const fetchAllProjects = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) {
                    throw new Error("Failed to fetch projects");
                }
                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    setProjects(result.data);
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchAllProjects();
    }, []);

    return (
        <main className="w-full min-h-screen bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 relative" dir={isRtl ? "rtl" : "ltr"}>
            <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-green-500/[0.02] rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[130px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">

                <div className="mb-12 font-mono text-xs md:text-sm tracking-widest text-green-500/60 uppercase flex items-center gap-2">
                    <span>{"//"}</span>
                    <span>{t("allProjectsTag")}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-12 border-b border-green-500/10 pb-6 justify-start" dir={isRtl ? "rtl" : "ltr"}>
                    {STACK_OPTIONS.map((stack) => (
                        <button
                            key={stack}
                            onClick={() => setActiveFilter(stack)}
                            className={`px-4 py-2 rounded-lg font-mono text-xs md:text-sm border transition-all duration-300 capitalize active:scale-95 ${activeFilter === stack
                                ? "bg-green-500/10 border-green-500 text-green-400 font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                : "bg-[#090d16]/40 border-green-500/10 text-gray-400 hover:border-green-500/30 hover:text-gray-200"
                                }`}
                        >
                            {stack === "all" ? (isRtl ? "الكل" : "All") : stack}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    {loading && <ProjectSkeleton count={7} />}

                    {!loading && error && (
                        <div className="col-span-full py-16 text-center font-mono text-sm text-red-400/80 border border-red-500/10 bg-red-500/[0.01] rounded-xl">
                            {`// Error_Loading_Projects: ${error}`}
                        </div>
                    )}

                    {!loading && !error && filteredProjects.length === 0 && (
                        <div className="col-span-full py-16 text-center font-mono text-sm text-gray-400 border border-green-500/5 bg-[#090d16]/20 rounded-xl">
                            {isRtl ? "// لا توجد مشاريع مضافة في هذا القسم بعد" : "// No projects found in this category yet"}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        filteredProjects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                isRtl={isRtl}
                            />
                        ))}
                </div>
            </div>
        </main>
    );
};

export default AllProjectsPage;
