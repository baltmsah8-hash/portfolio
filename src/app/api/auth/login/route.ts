import { NextResponse, NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const result = await authController.login(body); 

    return NextResponse.json(result);
}