import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_ar: { type: String, required: true },
    description_en: { type: String, required: true },
    description_ar: { type: String, required: true },
    images: [{ type: String, required: true }],
    liveLink: { type: String },
    repoLink: { type: String },
    stack: { 
        type: String, 
        enum: ["fullstack", "mobile", "frontend", "backend"], 
        required: true 
    },
    tags: [{ type: String, required: true }],
}, { timestamps: true });

export const ProjectModel = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
