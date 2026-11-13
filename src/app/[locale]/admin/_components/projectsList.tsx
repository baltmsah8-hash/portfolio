"use client";

import React, { useState, useEffect } from "react";
import { Search, Edit2, Trash2, Globe, Code, Layers, Tag, Terminal, X, Check, Loader2 } from "lucide-react";

interface ProjectItem {
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
}

interface ProjectsListProps {
  t: (key: string) => string;
  showAlert: (message: string, type: "success" | "error") => void;
  isRtl: boolean;
}

export const ProjectsList = ({ t, showAlert, isRtl }: ProjectsListProps) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || data.projects || []);
      }
    } catch {
      showAlert(t("projectsList.fetchError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/admin/projects/manage/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
        showAlert(t("projectsList.deleteSuccess"), "success");
      } else {
        showAlert(data.error || t("projectsList.deleteError"), "error");
      }
    } catch {
      showAlert(t("projectsList.deleteError"), "error");
    }
  };

  // 3. دالة حفظ التعديلات عبر PUT /api/projects/manage
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/projects/manage/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingProject._id, ...editingProject }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setProjects((prev) => prev.map((p) => (p._id === editingProject._id ? editingProject : p)));
        setEditingProject(null);
        showAlert(t("projectsList.updateSuccess"), "success");
      } else {
        showAlert(data.error || t("projectsList.updateError"), "error");
      }
    } catch {
      showAlert(t("projectsList.updateError"), "error");
    } finally {
      setUpdating(false);
    }
  };
  
  const filteredProjects = projects.filter((project: any) => {
    const query = searchQuery.toLowerCase().trim();
    const title = isRtl 
      ? (project.title_ar || project.title || "") 
      : (project.title_en || project.title || "");
      
    const matchesTitle = title.toLowerCase().includes(query);
    const matchesTags = Array.isArray(project.tags) 
      ? project.tags.some((tag: string) => tag.toLowerCase().includes(query))
      : false;

    return matchesTitle || matchesTags;
  });


  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full animate-pulse">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-80 bg-[#070a13]/40 border border-green-500/5 rounded-2xl p-6 space-y-4">
            <div className="w-full h-40 bg-gray-800/40 rounded-xl" />
            <div className="w-1/2 h-4 bg-gray-800 rounded-full" />
            <div className="w-full h-3 bg-gray-800/60 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="relative w-full z-10">
        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("projectsList.searchPlaceholder")}
          className="w-full px-5 py-3.5 ps-11 rounded-xl font-mono text-xs sm:text-sm bg-[#070a13]/40 border border-green-500/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 custom-scrollbar py-6 w-full">
        {filteredProjects.length === 0 ? (
          <div className="lg:col-span-2 p-8 text-center text-gray-500 font-mono text-xs border border-dashed border-gray-800 rounded-2xl uppercase">
            {t("projectsList.noProjects")}
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className="bg-[#070a13]/30 border border-green-500/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-green-500/20">
              <div className="w-full">
                <div className="w-full aspect-video relative bg-gray-950 overflow-hidden border-b border-green-500/5">
                  <img src={project.images[0]} alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-black font-mono text-[9px] font-black uppercase">
                    <Layers className="w-2.5 h-2.5" /> {project.stack}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-base font-mono font-bold text-white uppercase flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-500" />
                    {isRtl ? project.title_ar : project.title_en}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {isRtl ? project.description_ar : project.description_en}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/5 border border-green-500/10 text-[10px] font-mono text-green-400/80 uppercase">
                        <Tag className="w-2.5 h-2.5 text-green-500/30" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-green-500/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-gray-500 font-mono text-[10px]">
                  {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> LIVE</a>}
                  {project.repoLink && <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1"><Code className="w-3.5 h-3.5" /> REPO</a>}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingProject(project)} className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteProject(project._id)} className="p-2 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdateProject} className="max-w-lg w-full bg-[#070a13] border border-green-500/20 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-green-500/10 pb-3">
              <h3 className="text-sm font-mono font-bold text-green-400 uppercase">{t("projectsList.editTitle")}</h3>
              <button type="button" onClick={() => setEditingProject(null)} className="text-gray-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <input type="text" value={editingProject.title_en} onChange={(e) => setEditingProject({ ...editingProject, title_en: e.target.value })} placeholder="Title EN" className="w-full px-4 py-2.5 bg-[#02040a] border border-green-500/10 rounded-xl font-mono text-xs text-white" required />
            <input type="text" value={editingProject.title_ar} onChange={(e) => setEditingProject({ ...editingProject, title_ar: e.target.value })} placeholder="Title AR" className="w-full px-4 py-2.5 bg-[#02040a] border border-green-500/10 rounded-xl font-mono text-xs text-white" required />
            <textarea value={editingProject.description_en} onChange={(e) => setEditingProject({ ...editingProject, description_en: e.target.value })} rows={2} placeholder="Desc EN" className="w-full px-4 py-2.5 bg-[#02040a] border border-green-500/10 rounded-xl font-mono text-xs text-white resize-none" required />
            <textarea value={editingProject.description_ar} onChange={(e) => setEditingProject({ ...editingProject, description_ar: e.target.value })} rows={2} placeholder="Desc AR" className="w-full px-4 py-2.5 bg-[#02040a] border border-green-500/10 rounded-xl font-mono text-xs text-white resize-none" required />

            <div className="flex justify-end gap-2 pt-2">
              <button type="submit" disabled={updating} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-500 text-black font-bold font-mono text-xs hover:bg-green-400 cursor-pointer">
                {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{t("projectsList.saveChanges")}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
