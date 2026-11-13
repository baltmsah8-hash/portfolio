"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

    // حساب عدد المشاريع في كل قسم لعرضه بجانب اسم الفلتر
    const getCategoryCount = (stack: StackType) => {
        if (stack === "all") return projects.length;
        return projects.filter((p) => p.stack === stack).length;
    };

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
        <main
            className="w-full min-h-screen bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
            dir={isRtl ? "rtl" : "ltr"}
        >
            {/* إضاءة خلفية */}
            <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-green-500/[0.02] rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[130px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* الهيدر مع زر الرجوع */}
                <div className="mb-10 flex items-center justify-between">
                    <div className="font-mono text-xs md:text-sm tracking-widest text-green-500/60 uppercase flex items-center gap-2">
                        <span>{"//"}</span>
                        <span>{t("allProjectsTag")}</span>
                    </div>

                    <Link
                        href={`/${currentLocale}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs bg-green-500/5 border border-green-500/15 text-green-400 hover:bg-green-500/15 hover:border-green-500/40 transition-all duration-300"
                    >
                        <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
                        <span>{isRtl ? "الرئيسية" : "Home"}</span>
                    </Link>
                </div>

                {/* شريط الفلاتر مع العداد */}
                <div
                    className="flex flex-wrap gap-2.5 mb-12 border-b border-green-500/10 pb-6 justify-start"
                    dir={isRtl ? "rtl" : "ltr"}
                >
                    {STACK_OPTIONS.map((stack) => {
                        const count = getCategoryCount(stack);
                        const isSelected = activeFilter === stack;

                        return (
                            <button
                                key={stack}
                                onClick={() => setActiveFilter(stack)}
                                className={`px-4 py-2 rounded-lg font-mono text-xs md:text-sm border transition-all duration-300 capitalize active:scale-95 cursor-pointer flex items-center gap-2 ${isSelected
                                        ? "bg-green-500/15 border-green-500 text-green-400 font-bold shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                                        : "bg-[#090d16]/40 border-green-500/10 text-gray-400 hover:border-green-500/30 hover:text-gray-200"
                                    }`}
                            >
                                <span>{stack === "all" ? (isRtl ? "الكل" : "All") : stack}</span>
                                {!loading && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected
                                                ? "bg-green-500/20 text-green-300"
                                                : "bg-white/5 text-gray-500"
                                            }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* شبكة عرض المشاريع */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {loading && <ProjectSkeleton count={6} />}

                    {!loading && error && (
                        <div className="col-span-full py-16 text-center font-mono text-sm text-red-400/80 border border-red-500/10 bg-red-500/[0.01] rounded-xl">
                            {`// Error_Loading_Projects: ${error}`}
                        </div>
                    )}

                    {!loading && !error && filteredProjects.length === 0 && (
                        <div className="col-span-full py-16 text-center font-mono text-sm text-gray-400 border border-green-500/5 bg-[#090d16]/20 rounded-xl animate-card-reveal">
                            {isRtl
                                ? "// لا توجد مشاريع مضافة في هذا القسم بعد"
                                : "// No projects found in this category yet"}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        filteredProjects.map((project, index) => (
                            <div
                                key={`${activeFilter}-${project._id}`}
                                style={{ animationDelay: `${Math.min(index * 90, 600)}ms` }}
                                className="animate-card-reveal"
                            >
                                <ProjectCard project={project} isRtl={isRtl} />
                            </div>
                        ))}
                </div>
            </div>
        </main>
    );
};

export default AllProjectsPage;
