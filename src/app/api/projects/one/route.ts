import { NextRequest, NextResponse } from "next/server";
import { ProjectController } from "@/src/controllers/project.controller";

export async function GET(req: NextRequest) {
    const id = req.headers.get("x-project-id");

    if (!id) {
        return NextResponse.json({ error: "Project ID is required in headers" }, { status: 400 });
    }

    return ProjectController.getProject(id);
}
