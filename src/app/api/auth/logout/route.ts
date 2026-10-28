import { NextResponse, NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function POST(request: NextRequest) {
    const result = await authController.logout(); 

    return NextResponse.json(result);
}
