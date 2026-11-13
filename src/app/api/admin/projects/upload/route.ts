import { NextRequest } from "next/server";
import { ProjectController } from "@/src/controllers/project.controller";

export async function POST(req: NextRequest) {
    const body = await req.json();
    return ProjectController.create(body, req);
}

export async function DELETE(req: NextRequest) {
    const body = await req.json();
    return ProjectController.deleteImage(body, req);
}
