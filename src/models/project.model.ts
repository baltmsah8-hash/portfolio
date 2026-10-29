import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    liveLink: { type: String },
    repoLink: { type: String },
    tags: [{ type: String, required: true }],
}, { timestamps: true });

export const ProjectModel = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
