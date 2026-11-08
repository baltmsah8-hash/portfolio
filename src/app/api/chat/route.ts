import { NextRequest } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function GET(req: NextRequest) {
    const body = await req.json();

    return ChatController.getChat(body, req);
}
