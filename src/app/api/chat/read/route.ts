import { NextRequest, NextResponse } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const result = await ChatController.markAsRead(body, req);
    return NextResponse.json(result);
}
