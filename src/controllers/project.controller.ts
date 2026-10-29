import { ProjectModel } from "../models/project.model";
import { projectValidatorSchema } from "../lib/validators";
import { AppError, handleApi } from "../lib/api-handler";
import { connectDB } from "../lib/db";
import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// إعدادات كلوديناري للباك إيند (بتقرأ تلقائي من ملف الـ .env بتاعك)
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const getPublicIdFromUrl = (url: string): string | null => {
    try {
        const parts = url.split("/upload/");
        if (parts.length < 2) return null;

        const removeVersion = parts[1].substring(parts[1].indexOf("/") + 1);
        const publicId = removeVersion.split(".")[0];
        
        return publicId;
    } catch (error) {
        return null;
    }
};

export const ProjectController = {
    create: handleApi(async (body, req: NextRequest) => {
        await connectDB();
        const role = req.headers.get("x-user-role");
        if (role !== "admin") {
            throw new AppError("Forbidden: Admin access required", 403);
        }

        const validData = projectValidatorSchema.parse(body);
        const newProject = await ProjectModel.create(validData);

        return { success: true, message: "Project created successfully", data: newProject };
    }),

    getAll: handleApi(async () => {
        await connectDB();
        const projects = await ProjectModel.find({}).sort({ createdAt: -1 });
        return { success: true, data: projects };
    }),

    update: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const role = req.headers.get("x-user-role");
        if (role !== "admin") {
            throw new AppError("Forbidden: Admin access required", 403);
        }

        const { id, ...updateData } = body as { id?: string; [key: string]: unknown };
        if (!id) throw new AppError("Project ID is required", 400);

        const validData = projectValidatorSchema.parse(updateData);

        const updatedProject = await ProjectModel.findByIdAndUpdate(
            id,
            { $set: validData },
            { new: true }
        );

        if (!updatedProject) {
            throw new AppError("Project not found", 404);
        }

        return { success: true, message: "Project updated successfully", data: updatedProject };
    }),

    delete: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const role = req.headers.get("x-user-role");
        if (role !== "admin") throw new AppError("Forbidden: Admin access required", 403);

        const { id } = body as { id?: string };
        if (!id) throw new AppError("Project ID is required", 400);

        const project = await ProjectModel.findById(id);
        if (!project) throw new AppError("Project not found", 404);

        if (project.images && project.images.length > 0) {
            for (const imageUrl of project.images) {
                const publicId = getPublicIdFromUrl(imageUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId).catch((err) => {
                        console.error(`Failed to delete image ${publicId} from Cloudinary:`, err);
                    });
                }
            }
        }

        await ProjectModel.findByIdAndDelete(id);

        return { success: true, message: "Project and its cloud images deleted successfully" };
    })
};
