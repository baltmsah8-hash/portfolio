import { NextResponse, NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function PUT(request: NextRequest) {
    const body = await request.json();

    const result = await authController.updateData(body, request); 

    return NextResponse.json(result);
}
