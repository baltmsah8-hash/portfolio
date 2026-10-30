import { NextRequest } from "next/server";
import { ChatController } from "@/src/controllers/chat.controller";

export async function POST(req: NextRequest) {
    const body = await req.json();

    return ChatController.sendFromUser(body, req);
}
