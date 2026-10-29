import { NextRequest, NextResponse } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const result = await ChatController.pinMessage(body, req);
    return NextResponse.json(result);
}
