"use client";

import { useState, useEffect, use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ExternalLink, GitBranch, Calendar, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProjectDetails {
    _id: string;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    images: string[];
    liveLink?: string;
    repoLink?: string;
    stack: "fullstack" | "mobile" | "frontend" | "backend";
    tags: string[];
    createdAt: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const SingleProjectPage = ({ params }: PageProps) => {
    const t = useTranslations("Projects");
    const locale = useLocale();
    const isRtl = locale === "ar";

    const resolvedParams = use(params);
    const projectId = resolvedParams?.id;

    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

    useEffect(() => {
        if (!projectId) return;

        const fetchProjectDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/projects/one", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "x-project-id": projectId
                    }
                });
                if (!response.ok) {
                    throw new Error(t("errorLoading"));
                }
                const result = await response.json();

                if (result.success && result.data) {
                    setProject(result.data);
                    setActiveImageIndex(0);
                } else {
                    throw new Error(t("errorLoading"));
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : t("errorLoading"));
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId, t]);
    const handleNextImage = () => {
        if (!project?.images?.length) return;
        setActiveImageIndex((prev) => (prev + 1) % project.images.length);
    };

    const handlePrevImage = () => {
        if (!project?.images?.length) return;
        setActiveImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#02040a] flex items-center justify-center text-green-500 font-mono text-sm">
                <p className="animate-pulse">{`// ${t("loadingDetails")}`}</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="w-full min-h-screen bg-[#02040a] flex items-center justify-center px-4">
                <div className="text-center font-mono text-sm text-red-400/80 border border-red-500/10 bg-red-500/[0.01] p-8 rounded-xl max-w-md">
                    <p>{`// ${error || t("errorLoading")}`}</p>
                    <Link href={`/${locale}/projects`} className="mt-6 inline-flex items-center gap-2 text-green-400 hover:underline">
                        <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                        <span>{t("backToProjects")}</span>
                    </Link>
                </div>
            </div>
        );
    }

    const title = isRtl ? project.title_ar : project.title_en;
    const description = isRtl ? project.description_ar : project.description_en;
    const projectImages = project.images && project.images.length > 0 ? project.images : ["/placeholder.webp"];
    const mainImage = projectImages[activeImageIndex];

    return (
        <main className="w-full min-h-screen bg-[#02040a] text-white py-24 px-4 sm:px-6 lg:px-8 relative" dir={isRtl ? "rtl" : "ltr"}>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/[0.02] rounded-full blur-[180px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <Link
                    href={`/${locale}/projects`}
                    className="inline-flex items-center gap-2 font-mono text-xs text-green-500/60 hover:text-green-400 transition-colors mb-6 group"
                >
                    <ArrowLeft className={`w-4 h-4 transition-transform ${isRtl ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1"}`} />
                    <span>{t("backToProjects")}</span>
                </Link>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono tracking-tight text-white">
                        {title}
                    </h1>
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-green-500/10 border border-green-500/20 text-green-400">
                        {project.stack}
                    </span>
                </div>
                <div className="mb-12 space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden border border-green-500/15 rounded-2xl bg-[#090d16]/90 shadow-2xl flex items-center justify-center group/slider">
                        <Image
                            src={mainImage}
                            alt={title || "Project Image"}
                            fill
                            priority
                            className="object-contain object-center transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/50 via-transparent to-transparent pointer-events-none" />

                        {projectImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Previous Image"
                                    onClick={isRtl ? handleNextImage : handlePrevImage}
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#02040a]/80 border border-green-500/20 hover:border-green-500/60 text-green-400 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 z-20 cursor-pointer shadow-lg"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Next Image"
                                    onClick={isRtl ? handlePrevImage : handleNextImage}
                                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#02040a]/80 border border-green-500/20 hover:border-green-500/60 text-green-400 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 z-20 cursor-pointer shadow-lg"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-[#02040a]/85 border border-green-500/20 px-3 py-1 rounded-md font-mono text-[11px] text-green-400 backdrop-blur-sm z-20">
                                    [ {String(activeImageIndex + 1).padStart(2, "0")} / {String(projectImages.length).padStart(2, "0")} ]
                                </div>
                            </>
                        )}
                    </div>

                    {projectImages.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                            {projectImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative w-20 h-12 sm:w-24 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${activeImageIndex === idx
                                            ? "border-green-400 scale-105 shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                                            : "border-green-500/10 opacity-50 hover:opacity-90"
                                        }`}
                                >
                                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-green-500/10 pt-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="font-mono text-xs text-green-500/70 uppercase tracking-widest mb-3">
                                {`// ${t("overviewTag")}`}
                            </h2>
                            <p className={`text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line ${isRtl ? "border-r-2 border-green-500/30 pr-4" : "border-l-2 border-green-500/30 pl-4"}`}>
                                {description}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-green-500/10">
                            <h3 className="font-mono text-xs text-green-500/70 uppercase tracking-widest mb-4">
                                {`// ${t("techUsed")}`}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags?.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="font-mono text-xs px-3 py-1.5 rounded-lg bg-green-500/5 text-green-400 border border-green-500/15 hover:border-green-500/40 transition-colors"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="lg:col-span-1 space-y-4 font-mono text-xs">
                        <div className="border border-green-500/15 bg-[#090d16]/50 p-5 rounded-2xl space-y-5">
                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 uppercase">{t("projectType")}</p>
                                    <p className="text-sm text-gray-200 capitalize font-semibold mt-0.5">{project.stack}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 uppercase">{t("publishDate")}</p>
                                    <p className="text-sm text-gray-200 font-semibold mt-0.5">
                                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString(locale) : "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-green-500/10 flex flex-col gap-3">
                                {project.liveLink && (
                                    <a
                                        href={project.liveLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 px-4 rounded-xl bg-green-500 text-black hover:bg-green-400 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/10"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>{t("liveLink")}</span>
                                    </a>
                                )}

                                {project.repoLink && (
                                    <a
                                        href={project.repoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 px-4 rounded-xl bg-[#02040a] border border-green-500/20 hover:border-green-500/50 text-gray-200 hover:text-green-400 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <GitBranch className="w-4 h-4" />
                                        <span>{t("sourceCode")}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default SingleProjectPage;
