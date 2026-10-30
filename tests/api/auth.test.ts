import { NextRequest } from "next/server";
import { GET as getAllUsers } from "@/src/app/api/auth/all-users/route";
import { POST as login } from "@/src/app/api/auth/login/route";
import { POST as logout } from "@/src/app/api/auth/logout/route";
import { POST as register } from "@/src/app/api/auth/register/route";
import { PUT as update } from "@/src/app/api/auth/update/route";
import bcrypt from "bcryptjs";
import { ChatModel } from "@/src/models/chat.model";
import { UserModel } from "@/src/models/user.model";

jest.mock("@/src/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/src/models/user.model", () => ({
  UserModel: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock("@/src/models/chat.model", () => ({
  ChatModel: {
    aggregate: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("jest-signed-token"),
  })),
}));

const user = {
  _id: "user-1",
  name: "Test User",
  email: "test@example.com",
  phone: "+14155552671",
  password: "hashed-password",
  role: "user",
};

function createRequest(
  method: string,
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe("Authentication API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("authenticates a user, normalizes email, and sets an HTTP-only token cookie", async () => {
    jest.mocked(UserModel.findOne).mockResolvedValue(user as never);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const response = await login(
      createRequest("POST", "http://localhost/api/auth/login", {
        email: "TEST@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true, user });
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed-password");
    expect(response.headers.get("set-cookie")).toContain("token=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("rejects login when the account does not exist", async () => {
    jest.mocked(UserModel.findOne).mockResolvedValue(null as never);

    const response = await login(
      createRequest("POST", "http://localhost/api/auth/login", {
        email: "unknown@example.com",
        password: "password123",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Error on email or password",
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("rejects invalid login data", async () => {
    const response = await login(
      createRequest("POST", "http://localhost/api/auth/login", {
        email: "not-an-email",
        password: "short",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ success: false });
    expect(UserModel.findOne).not.toHaveBeenCalled();
  });

  it("registers a user with a hashed password and returns 201", async () => {
    jest.mocked(UserModel.findOne).mockResolvedValue(null as never);
    jest.mocked(bcrypt.genSalt).mockResolvedValue("salt" as never);
    jest.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never);
    jest.mocked(UserModel.create).mockResolvedValue({
      ...user,
      password: "new-hash",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);

    const response = await register(
      createRequest("POST", "http://localhost/api/auth/register", {
        name: "Test User",
        email: "TEST@example.com",
        phone: "+14155552671",
        password: "password123",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: "email created successfully",
    });
    expect(UserModel.create).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      phone: "+14155552671",
      password: "new-hash",
      role: "user",
    });
    expect(response.headers.get("set-cookie")).toContain("token=");
  });

  it("rejects registering an existing email", async () => {
    jest.mocked(UserModel.findOne).mockResolvedValue(user as never);

    const response = await register(
      createRequest("POST", "http://localhost/api/auth/register", {
        name: "Test User",
        email: "test@example.com",
        phone: "+14155552671",
        password: "password123",
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Email is already exist",
    });
    expect(UserModel.create).not.toHaveBeenCalled();
  });

  it("updates an authenticated user's profile without selecting their password", async () => {
    const updatedUser = { ...user, name: "Updated User" };
    const select = jest.fn().mockResolvedValue(updatedUser);
    jest.mocked(UserModel.findOneAndUpdate).mockReturnValue({ select } as never);

    const response = await update(
      createRequest(
        "PUT",
        "http://localhost/api/auth/update",
        { name: "Updated User", email: "TEST@example.com", phone: "+14155552671" },
        { "x-user-id": "user-1" },
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      user: updatedUser,
    });
    expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith(
      { email: "test@example.com" },
      { $set: { name: "Updated User", phone: "+14155552671" } },
      { new: true },
    );
    expect(select).toHaveBeenCalledWith("-password");
  });

  it("rejects profile updates without an authenticated user ID", async () => {
    const response = await update(
      createRequest("PUT", "http://localhost/api/auth/update", {
        name: "Updated User",
        email: "test@example.com",
        phone: "+14155552671",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "User identity mising",
    });
    expect(UserModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("restricts the user listing to admins and returns unread message totals", async () => {
    const forbiddenResponse = await getAllUsers(
      createRequest("GET", "http://localhost/api/auth/all-users", undefined, {
        "x-user-role": "user",
      }),
    );
    expect(forbiddenResponse.status).toBe(403);

    jest.mocked(ChatModel.aggregate).mockResolvedValue([{ _id: null, totalSum: 3 }] as never);
    jest.mocked(UserModel.find).mockResolvedValue([user] as never);

    const response = await getAllUsers(
      createRequest("GET", "http://localhost/api/auth/all-users", undefined, {
        "x-user-role": "admin",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [user],
      unReadedMessages: [{ _id: null, totalSum: 3 }],
    });
    expect(ChatModel.aggregate).toHaveBeenCalled();
    expect(UserModel.find).toHaveBeenCalledWith({});
  });

  it("clears the token cookie on logout", async () => {
    const response = await logout();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "Logged out successfully",
    });
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
