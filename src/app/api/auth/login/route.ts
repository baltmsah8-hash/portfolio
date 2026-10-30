import { NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function POST(request: NextRequest) {
    const body = await request.json();
    return authController.login(body);
}