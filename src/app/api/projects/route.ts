import { NextRequest, NextResponse } from "next/server";
import { ProjectController } from "@/src/controllers/project.controller";

export async function GET() {
    const result = await ProjectController.getAll();
    return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const result = await ProjectController.create(body, req);
    return NextResponse.json(result);
}
