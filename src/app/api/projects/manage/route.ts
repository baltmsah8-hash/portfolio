import { NextRequest, NextResponse } from "next/server";
import { ProjectController } from "@/src/controllers/project.controller";

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const result = await ProjectController.update(body, req);
    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
    const body = await req.json();
    const result = await ProjectController.delete(body, req);
    return NextResponse.json(result);
}
