import { NextRequest } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function GET(req: NextRequest) {
    return ChatController.cleanupOldMessages({}, req);
}
