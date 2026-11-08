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
    
    // حالة لتتبع الفهرس الحالي للصورة النشطة في السلايدر
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

    useEffect(() => {
        if (!projectId) return;
        console.log("Fetching project details for ID:", projectId);

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
                    throw new Error("Failed to fetch project details");
                }
                const result = await response.json();

                if (result.success && result.data) {
                    setProject(result.data);
                } else {
                    throw new Error("Project not found");
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    // دوال تقليب الصور التفاعلية في السلايدر
    const handleNextImage = () => {
        if (!project?.images) return;
        setActiveImageIndex((prev) => (prev + 1) % project.images.length);
    };

    const handlePrevImage = () => {
        if (!project?.images) return;
        setActiveImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#02040a] flex items-center justify-center text-green-500 font-mono text-sm">
                <div className="text-center">
                    <p className="animate-pulse">{isRtl ? "// جاري تحميل تفاصيل المشروع..." : "// Loading project details..."}</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="w-full min-h-screen bg-[#02040a] flex items-center justify-center px-4">
                <div className="text-center font-mono text-sm text-red-400/80 border border-red-500/10 bg-red-500/[0.01] p-8 rounded-xl max-w-md">
                    <p>{`// Error: ${error || "Project not found"}`}</p>
                    <Link href="/projects" className="mt-6 inline-flex items-center gap-2 text-green-400 hover:underline">
                        <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} /> {isRtl ? "العودة للمشاريع" : "Back to projects"}
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

            <div className="max-w-4xl mx-auto relative z-10">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 font-mono text-xs text-green-500/60 hover:text-green-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className={`w-4 h-4 transition-transform ${isRtl ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1"}`} />
                    <span>{isRtl ? "العودة إلى ارشيف الاعمال" : "Back to projects archive"}</span>
                </Link>

                <div className="relative aspect-video w-full overflow-hidden border border-green-500/10 rounded-xl bg-[#090d16]/90 mb-12 shadow-2xl flex items-center justify-center group/slider">
                    <Image
                        src={mainImage}
                        alt={title || "Project Image"}
                        fill
                        priority
                        className="object-contain object-center filter contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/40 via-transparent to-transparent pointer-events-none" />

                    {projectImages.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#02040a]/70 border border-green-500/10 hover:border-green-500/40 text-green-400 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 opacity-0 group-hover/slider:opacity-100 z-20"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#02040a]/70 border border-green-500/10 hover:border-green-500/40 text-green-400 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 opacity-0 group-hover/slider:opacity-100 z-20"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-4 right-4 bg-[#02040a]/80 border border-green-500/10 px-3 py-1 rounded-md font-mono text-[11px] text-green-400 backdrop-blur-sm z-20 shadow-md">
                                [ {String(activeImageIndex + 1).padStart(2, '0')} / {String(projectImages.length).padStart(2, '0')} ]
                            </div>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-green-500/10 pt-8">
                    <div className="md:col-span-1 space-y-6 font-mono text-xs text-gray-400">
                        <div className="border border-green-500/5 bg-[#090d16]/20 p-4 rounded-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <Layers className="w-4 h-4 text-green-400" />
                                <div>
                                    <p className="text-[14px] text-gray-500">{isRtl ? "نوع المشروع" : "STACK"}</p>
                                    <p className="text-[12px] text-gray-200 capitalize">{project.stack}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 leading-normal">
                                <Calendar className="w-4 h-4 text-green-400" />
                                <div>
                                    <p className="text-[14px] text-gray-500">{isRtl ? "تاريخ النشر" : "DATE"}</p>
                                    <p className="text-[12px] text-gray-200">
                                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString(locale) : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {project.liveLink && (
                                <a
                                    href={project.liveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 rounded-lg bg-green-500/10 border border-green-500/20 hover:border-green-500/50 text-green-400 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>{t("liveLink") || "Live Preview"}</span>
                                </a>
                            )}

                            {project.repoLink && (
                                <a
                                    href={project.repoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 rounded-lg bg-[#090d16]/60 border border-gray-800 hover:border-gray-600 text-gray-300 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <GitBranch className="w-4 h-4" />
                                    <span>{isRtl ? "مستودع المشروع" : "Source Code"}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">
                            {title}
                        </h1>

                        <p className={`text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line dir-auto ${isRtl ? "border-r-2 border-green-500/20 pr-4" : "border-l-2 border-green-500/20 pl-4"}`}>
                            {description}
                        </p>

                        <div className="pt-4 border-t border-green-500/5 leading-normal">
                            <p className="font-mono text-[16px] text-gray-500 uppercase tracking-wider mb-3">{t("techUsed") || "Tech Stack Tags"}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.tags?.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="font-mono text-[11px] px-3 py-1 rounded-md bg-green-500/5 text-green-400/90 border border-green-500/10 hover:border-green-500/30 transition-colors"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SingleProjectPage;
