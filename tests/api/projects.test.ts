import { NextRequest } from "next/server";
import { DELETE, PUT } from "@/src/app/api/projects/manage/route";
import { GET, POST } from "@/src/app/api/projects/route";
import { ProjectModel } from "@/src/models/project.model";
import { v2 as cloudinary } from "cloudinary";

jest.mock("@/src/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/src/models/project.model", () => ({
  ProjectModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

const validProject = {
  title: "Portfolio website",
  description: "A personal website showcasing my projects.",
  images: ["https://res.cloudinary.com/demo/image/upload/v1234/projects/portfolio.jpg"],
  liveLink: "https://example.com",
  repoLink: "https://github.com/example/portfolio",
  tags: ["Next.js", "TypeScript"],
};

const savedProject = { _id: "project-1", ...validProject };

function createRequest(
  method: string,
  body?: unknown,
  role?: string,
): NextRequest {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  if (role) headers.set("x-user-role", role);

  return new NextRequest("http://localhost/api/projects", {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe("Project API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns projects ordered by creation date", async () => {
    const projects = [savedProject];
    const sort = jest.fn().mockResolvedValue(projects);
    jest.mocked(ProjectModel.find).mockReturnValue({ sort } as never);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: projects });
    expect(ProjectModel.find).toHaveBeenCalledWith({});
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("creates a valid project for an admin", async () => {
    jest.mocked(ProjectModel.create).mockResolvedValue(savedProject as never);

    const response = await POST(createRequest("POST", validProject, "admin"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "Project created successfully",
      data: savedProject,
    });
    expect(ProjectModel.create).toHaveBeenCalledWith(validProject);
  });

  it("rejects project creation for non-admin users", async () => {
    const response = await POST(createRequest("POST", validProject, "user"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Forbidden: Admin access required",
    });
    expect(ProjectModel.create).not.toHaveBeenCalled();
  });

  it("rejects invalid project data", async () => {
    const response = await POST(
      createRequest("POST", { ...validProject, title: "x" }, "admin"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Title must be at least 3 characters long",
    });
    expect(ProjectModel.create).not.toHaveBeenCalled();
  });

  it("updates an existing project for an admin", async () => {
    jest.mocked(ProjectModel.findByIdAndUpdate).mockResolvedValue(savedProject as never);

    const response = await PUT(
      createRequest("PUT", { id: "project-1", ...validProject }, "admin"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "Project updated successfully",
      data: savedProject,
    });
    expect(ProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "project-1",
      { $set: validProject },
      { new: true },
    );
  });

  it("rejects updates without a project ID", async () => {
    const response = await PUT(createRequest("PUT", validProject, "admin"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Project ID is required",
    });
    expect(ProjectModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("returns not found when updating a missing project", async () => {
    jest.mocked(ProjectModel.findByIdAndUpdate).mockResolvedValue(null as never);

    const response = await PUT(
      createRequest("PUT", { id: "missing", ...validProject }, "admin"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Project not found",
    });
  });

  it("deletes an existing project and its Cloudinary images", async () => {
    jest.mocked(ProjectModel.findById).mockResolvedValue(savedProject as never);
    jest.mocked(ProjectModel.findByIdAndDelete).mockResolvedValue(savedProject as never);

    const response = await DELETE(
      createRequest("DELETE", { id: "project-1" }, "admin"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "Project and its cloud images deleted successfully",
    });
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("projects/portfolio");
    expect(ProjectModel.findByIdAndDelete).toHaveBeenCalledWith("project-1");
  });

  it("returns not found when deleting a missing project", async () => {
    jest.mocked(ProjectModel.findById).mockResolvedValue(null as never);

    const response = await DELETE(
      createRequest("DELETE", { id: "missing" }, "admin"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Project not found",
    });
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    expect(ProjectModel.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
