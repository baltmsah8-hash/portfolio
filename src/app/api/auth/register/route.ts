import { authController } from "@/src/controllers/auth.controller";

export async function POST(request: Request) {
    const body = await request.json();
    return authController.register(body);
}
