import { NextRequest } from "next/server";
import { ProjectController } from "@/src/controllers/project.controller";

export async function PUT(req: NextRequest) {
    const body = await req.json();
    return ProjectController.update(body, req);
}

export async function DELETE(req: NextRequest) {
    const body = await req.json();
    return ProjectController.delete(body, req);
}
