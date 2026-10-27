import { authController } from "@/src/controllers/auth.controller";

export async function POST() {
    return authController.logout();
}
