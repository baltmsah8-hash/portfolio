import { NextRequest, NextResponse } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function POST(req: NextRequest) {
    const role = req.headers.get("x-user-role");
    if (role !== "admin") {
        return NextResponse.json(
            { success: false, error: "Forbidden: Admin access required" }, 
            { status: 403 }
        );
    }

    const body = await req.json();
    return ChatController.sendFromAdmin(body);
}
