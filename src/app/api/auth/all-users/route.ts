import { NextRequest } from "next/server";
import { authController } from "@/src/controllers/auth.controller";

export async function GET(request: NextRequest) {

    return authController.allUsers(request);
}