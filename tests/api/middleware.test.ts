import { NextRequest } from "next/server";
import { authenticate, authorize, rateLimiter, proxy } from "@/src/proxy";
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

describe("API proxy and helpers", () => {
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

  describe("Main proxy function", () => {
    it("successfully passes valid admin requests with mutated headers", async () => {
      // محاكاة نجاح توكن الأدمن
      jest.mocked(jwtVerify).mockResolvedValue({
        payload: { userId: "admin-1", role: "admin" },
        protectedHeader: { alg: "HS256" },
      } as never);

      const request = createRequest("http://localhost/api/admin/dashboard", {
        cookie: "token=valid_admin_token",
      });

      const response = await proxy(request);

      expect(response).toBeDefined();
      expect(response.headers.get("x-user-id")).toBeNull();
    });

    it("stops execution early if rate limiter triggers", async () => {
      const ip = "192.0.2.1";
      const request = createRequest("http://localhost/api/auth/login", {
        "x-forwarded-for": ip,
      });

      for (let i = 0; i < 5; i++) {
        await proxy(request);
      }

      const blockedResponse = await proxy(request);
      expect(blockedResponse.status).toBe(429);
    });
  });
});
