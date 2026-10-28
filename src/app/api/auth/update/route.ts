import { NextResponse, NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function PUT(request: NextRequest) {
    const body = await request.json();

    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
        return NextResponse.json({ success: false, error: "User identity mising" }, { status: 401 });
    }

    const result = await authController.updateData(body); 

    return NextResponse.json(result);
}
