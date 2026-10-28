import { NextResponse, NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function GET(request: Request) {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "admin") {
        return Response.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const result = await authController.allUsers(); 

    return NextResponse.json(result);
}