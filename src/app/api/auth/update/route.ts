import { authController } from "@/src/controllers/auth.controller";

export async function PUT(request: Request) {
    const body = await request.json();

    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
        return Response.json({ success: false, error: "User identity mising" }, { status: 401 });
    }

    return authController.updateData(body); 
}
