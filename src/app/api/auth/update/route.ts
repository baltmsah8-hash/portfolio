import { NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function PUT(request: NextRequest) {
    const body = await request.json();

    return authController.updateData(body, request);
}
