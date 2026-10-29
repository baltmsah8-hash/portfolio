import { NextResponse, NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function GET(request: NextRequest) {

    const result = await authController.allUsers(request); 

    return NextResponse.json(result);
}