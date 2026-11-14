import { NextRequest } from "next/server";
import { proxy } from "@/src/proxy";
import { jwtVerify } from "jose";

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

jest.mock("next-intl/middleware", () => jest.fn(() => jest.fn(() => null)));

function createRequest(
  url: string,
  headers: Record<string, string> = {},
  method = "GET",
): NextRequest {
  return new NextRequest(url, { method, headers });
}

describe("API proxy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows unrelated API routes through the proxy", async () => {
    const response = await proxy(createRequest("http://localhost/api/projects"));

    expect(response.status).toBe(200);
  });

  it("limits login attempts after five requests from the same IP", async () => {
    const ip = "198.51.100.24";
    const request = createRequest(
      "http://localhost/api/auth/login",
      { "x-forwarded-for": ip },
      "POST",
    );

    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await proxy(request)).status).toBe(200);
    }

    const limited = await proxy(request);
    expect(limited.status).toBe(429);
    await expect(limited.json()).resolves.toMatchObject({ success: false });
  });

  it("requires a token on protected API routes", async () => {
    const response = await proxy(
      createRequest("http://localhost/api/chat/user"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Unauthorized",
    });
  });

  it("rejects invalid tokens on protected API routes", async () => {
    jest.mocked(jwtVerify).mockRejectedValue(new Error("invalid token"));

    const response = await proxy(
      createRequest("http://localhost/api/user/profile", {
        cookie: "token=invalid",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Invalid token",
    });
    expect(response.headers.get("set-cookie")).toContain("token=");
  });

  it("uses the authenticated role to restrict admin routes", async () => {
    jest.mocked(jwtVerify).mockResolvedValue({
      payload: { userId: "user-1", role: "user" },
      protectedHeader: { alg: "HS256" },
    } as never);

    const forbidden = await proxy(
      createRequest("http://localhost/api/admin/users", {
        cookie: "token=user-token",
      }),
    );

    expect(forbidden.status).toBe(403);
    await expect(forbidden.json()).resolves.toEqual({
      success: false,
      error: "Forbidden: Admin access required",
    });

    jest.mocked(jwtVerify).mockResolvedValue({
      payload: { userId: "admin-1", role: "admin" },
      protectedHeader: { alg: "HS256" },
    } as never);

    const allowed = await proxy(
      createRequest("http://localhost/api/admin/users", {
        cookie: "token=admin-token",
      }),
    );

    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("x-middleware-request-x-user-id")).toBe("admin-1");
    expect(allowed.headers.get("x-middleware-request-x-user-role")).toBe("admin");
  });
});
