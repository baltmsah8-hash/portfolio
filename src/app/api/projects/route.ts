import { ProjectController } from "@/src/controllers/project.controller";

export async function GET() {
    return ProjectController.getAll();
}
