import { NextRequest, NextResponse } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function GET(req: NextRequest) {
    const result = await ChatController.cleanupOldMessages({}, req);
    return NextResponse.json(result);
}
