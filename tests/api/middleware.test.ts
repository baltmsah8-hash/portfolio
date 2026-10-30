import { NextRequest } from "next/server";
import { authenticate, authorize, rateLimiter } from "@/src/middleware";
import { jwtVerify } from "jose";

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

function createRequest(
  url: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(url, { headers });
}

describe("API middleware helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows unrelated routes through the login rate limiter", () => {
    expect(rateLimiter(createRequest("http://localhost/api/projects"))).toBeNull();
  });

  it("limits login attempts after five requests from the same IP", async () => {
    const ip = "198.51.100.24";

    for (let attempt = 0; attempt < 5; attempt++) {
      expect(
        rateLimiter(
          createRequest("http://localhost/api/auth/login", {
            "x-forwarded-for": ip,
          }),
        ),
      ).toBeNull();
    }

    const limited = rateLimiter(
      createRequest("http://localhost/api/auth/login", {
        "x-forwarded-for": ip,
      }),
    );
    expect(limited?.status).toBe(429);
    await expect(limited?.json()).resolves.toMatchObject({ success: false });
  });

  it("requires a token on protected API routes", async () => {
    const response = await authenticate(
      createRequest("http://localhost/api/chat/user"),
      new Headers(),
    );

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      success: false,
      error: "Unauthorized: Token missing",
    });
  });

  it("rejects invalid tokens", async () => {
    jest.mocked(jwtVerify).mockRejectedValue(new Error("invalid token"));

    const response = await authenticate(
      createRequest("http://localhost/api/auth/update", {
        cookie: "token=invalid",
      }),
      new Headers(),
    );

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toMatchObject({
      success: false,
      error: "Unauthorized: Invalid token",
    });
  });

  it("adds the authenticated user identity and role to request headers", async () => {
    jest.mocked(jwtVerify).mockResolvedValue({
      payload: { userId: "user-1", role: "admin" },
      protectedHeader: { alg: "HS256" },
    } as never);
    const headers = new Headers();

    const response = await authenticate(
      createRequest("http://localhost/api/chat/user", {
        cookie: "token=valid",
      }),
      headers,
    );

    expect(response).toBeNull();
    expect(headers.get("x-user-id")).toBe("user-1");
    expect(headers.get("x-user-role")).toBe("admin");
  });

  it("restricts admin routes by authenticated role", async () => {
    const request = createRequest("http://localhost/api/admin/users");
    const forbidden = authorize(request, new Headers({ "x-user-role": "user" }));

    expect(forbidden?.status).toBe(403);
    await expect(forbidden?.json()).resolves.toEqual({
      success: false,
      error: "Forbidden: Admin access required",
    });
    expect(authorize(request, new Headers({ "x-user-role": "admin" }))).toBeNull();
  });
});
