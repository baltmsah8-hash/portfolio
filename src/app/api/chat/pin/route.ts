import { NextRequest } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    return ChatController.pinMessage(body, req);
}
