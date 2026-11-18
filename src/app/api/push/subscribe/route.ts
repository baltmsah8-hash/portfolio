import { NextRequest } from "next/server";
import { PushController } from "@/src/controllers/push.controller";

export async function POST(request: NextRequest) {
    const body = await request.json();

    return PushController.subscribe(body, request);
}

export async function DELETE(request: NextRequest) {
    const body = await request.json();

    return PushController.unsubscribe(body, request);
}
