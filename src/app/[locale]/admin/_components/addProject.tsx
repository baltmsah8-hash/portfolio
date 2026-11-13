"use client";

import React, { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { FolderPlus, Globe, Code, Layers, Tag, Image, Terminal, Plus, X, UploadCloud } from "lucide-react";

interface AddProjectFormProps {
    t: (key: string) => string;
    showAlert: (message: string, type: "success" | "error") => void;
}

export const AddProject = ({ t, showAlert }: AddProjectFormProps) => {
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const [formData, setFormData] = useState({
        title_en: "",
        title_ar: "",
        description_en: "",
        description_ar: "",
        liveLink: "",
        repoLink: "",
        stack: "fullstack",
        images: [] as string[],
        tags: [] as string[],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUploadSuccess = (result: { info?: { secure_url?: string } | string }) => {
        if (typeof result.info === "object" && result.info?.secure_url) {
            const secureUrl = result.info.secure_url;
            setFormData((prev) => ({ ...prev, images: [...prev.images, secureUrl] }));
            showAlert(t("addProject.uploadSuccess"), "success");
        }
    };

    const handleAddTag = () => {
        if (!tagInput.trim() || formData.tags.includes(tagInput.trim())) return;
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
        setTagInput("");
    };

    const handleRemoveTag = (idx: number) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
    };

    const handleRemoveImage = async (idx: number, url: string) => {
        try {
            const res = await fetch("/api/admin/projects/upload", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl: url }),
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
            } else {
                showAlert(data.error, "error");
            }
        } catch(error) {
            showAlert("Error during deleting image", "error");
            console.log(error)
        };
    };

    const handleDeployProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/projects/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });
            const data = await res.json();

            if (res.status === 400) {
                showAlert(t("addProject.validationError"), "error");
                return;
            }

            if (data.success) {
                showAlert(t("addProject.deploySuccess"), "success");
                setFormData({
                    title_en: "", title_ar: "", description_en: "", description_ar: "",
                    liveLink: "", repoLink: "", stack: "fullstack", images: [], tags: [],
                });
            } else {
                showAlert(data.error || "Deployment failed.", "error");
            }
        } catch {
            showAlert("Deployment execution timeout.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleDeployProject} className="w-full space-y-6 bg-[#070a13]/30 custom-scroolbar border border-green-500/10 rounded-[2.5rem] py-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 flex items-center gap-2"><Terminal className="w-3.5 h-3.5 text-green-500" /> {t("addProject.titleEn")}</label>
                    <input type="text" name="title_en" value={formData.title_en} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#02040a]/60 border border-green-500/10 rounded-xl font-mono text-sm text-white focus:outline-none" required />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 flex items-center gap-2"><Terminal className="w-3.5 h-3.5 text-green-500" /> {t("addProject.titleAr")}</label>
                    <input type="text" name="title_ar" value={formData.title_ar} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#02040a]/60 border border-green-500/10 rounded-xl font-mono text-sm text-white focus:outline-none" required />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-mono text-gray-400">{t("addProject.descEn")}</label>
                    <textarea name="description_en" value={formData.description_en} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-[#02040a]/60 border border-green-500/10 rounded-xl font-mono text-sm text-white resize-none" required />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-mono text-gray-400">{t("addProject.descAr")}</label>
                    <textarea name="description_ar" value={formData.description_ar} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-[#02040a]/60 border border-green-500/10 rounded-xl font-mono text-sm text-white resize-none" required />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-green-500" /> {t("addProject.liveLink")}</label>
                    <input type="url" name="liveLink" value={formData.liveLink} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#02040a]/60 border border-green-500/10 rounded-xl font-mono text-sm text-white focus:outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 flex items-center gap-2"><Code className="w-3.5 h-3.5 text-green-500" /> {t("addProject.repoLink")}</label>
                    <input type="url" name="repoLink" value={formData.repoLink} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#02040a]/60 border border-green-500/10 rounded-xl font-mono text-sm text-white focus:outline-none" />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-mono text-gray-400 flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-green-500" /> {t("addProject.stack")}</label>
                    <select name="stack" value={formData.stack} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#02040a]/80 border border-green-500/10 rounded-xl font-mono text-sm text-white cursor-pointer focus:outline-none">
                        <option value="fullstack">FULLSTACK_DEPLOYMENT</option>
                        <option value="frontend">FRONTEND_ONLY</option>
                        <option value="backend">BACKEND_CORE</option>
                        <option value="mobile">MOBILE_APPLICATION</option>
                    </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-mono text-gray-400 flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-green-500" /> {t("addProject.tags")}</label>
                    <div className="flex gap-2">
                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} className="flex-1 px-4 py-3 bg-[#02040a]/60 border border-green-500/10 rounded-xl font-mono text-sm text-white focus:outline-none" />
                        <button type="button" onClick={handleAddTag} className="px-4 rounded-xl bg-green-500 text-black font-bold font-mono text-xs cursor-pointer hover:bg-green-400 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {formData.tags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/20 text-[10px] font-mono text-green-400 uppercase">
                                {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleRemoveTag(idx)} />
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-mono text-gray-400 flex items-center gap-2">
                        <Image className="w-3.5 h-3.5 text-green-500" /> {t("addProject.images")}
                    </label>
                    <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} onSuccess={handleUploadSuccess}>
                        {({ open }) => (
                            <div onClick={() => open()} className="w-full h-32 rounded-xl border border-dashed border-green-500/20 bg-[#02040a]/40 hover:bg-[#02040a]/80 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-green-400 transition-colors" />
                                <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-300">{t("addProject.uploadPlaceholder")}</span>
                            </div>
                        )}
                    </CldUploadWidget>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-xl border border-green-500/10 bg-[#070a13]/40 overflow-hidden">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => handleRemoveImage(idx, img)} className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-red-400 hover:text-white transition-opacity"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-green-500/5 mt-6">
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-green-500 text-black font-bold font-mono text-xs hover:bg-green-400 disabled:opacity-40 transition-all duration-300 shadow-xl cursor-pointer">
                    <FolderPlus className="w-4 h-4" />
                    <span>{loading ? t("addProject.deploying") : t("addProject.deployBtn")}</span>
                </button>
            </div>
        </form>
    );
};

export default AddProject;