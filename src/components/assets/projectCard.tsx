"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, Eye } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";

export interface ProjectItem {
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
    createdAt?: string;
}

interface ProjectCardProps {
    project: ProjectItem;
    isRtl: boolean;
}

const ProjectCard = ({ project, isRtl }: ProjectCardProps) => {
    const t = useTranslations("Projects");

    const title = isRtl ? project.title_ar : project.title_en;

    const mainImage = project.images && project.images.length > 0 
        ? project.images[0] 
        : "/placeholder.webp";

    return (
        <div className="group relative bg-[#090d16]/40 border border-green-500/10 rounded-xl overflow-hidden transition-all duration-500 hover:border-green-500/30 hover:bg-green-500/[0.01] flex flex-col justify-between h-full">
            <div className="absolute -inset-px bg-gradient-to-b from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

            <div>
                <div className="relative aspect-video w-full overflow-hidden border-b border-green-500/5 bg-[#02040a]">
                    <Image
                        src={mainImage}
                        alt={title}
                        fill
                        sizes="(max-w-7xl) 33vw, 50vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-6">
                    <h3
                        className={`text-xl font-bold font-mono text-gray-200 group-hover:text-green-400 transition-colors duration-300 ${isRtl ? "text-right" : "text-left"}`}
                    >
                        {title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                        {project.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-green-500/5 border border-green-500/10 text-green-400/70"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 pt-0 mt-auto flex items-center gap-3">
                <Link
                    href={`/projects/${project._id}`}
                    className="flex-1 py-2.5 px-4 text-xs font-mono rounded-lg bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 hover:border-green-500/30 text-green-400 flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
                >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t("viewDetails")}</span>
                </Link>

                {project.liveLink && (
                    <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-4 text-xs font-mono rounded-lg bg-transparent hover:bg-white/[0.02] border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 group/btn"
                    >
                        <span>{t("liveLink")}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
