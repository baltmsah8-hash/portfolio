import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from "jose";


const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const rateLimiter = (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (pathname === "/api/auth/login") {
        const now = Date.now();
        const limitData = rateLimitMap.get(ip);

        if (limitData && now < limitData.expiresAt) {
            if (limitData.count >= 5) {
                return NextResponse.json(
                    { success: false, error: "Too many login attempts. Please try again after a minute." },
                    { status: 429 }
                );
            }
            limitData.count++;
        } else {
            rateLimitMap.set(ip, { count: 1, expiresAt: now + 60 * 1000 });
        }
    }
    return null;
};

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || ""
);

const authenticate = async (req: NextRequest, headers: Headers) => {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("token")?.value;

    const isUserRoute = pathname.startsWith("/api/auth/update") || pathname.startsWith("/api/chat");
    const isAdminRoute = pathname.startsWith("/api/admin") || pathname.startsWith("/admin");

    if (isUserRoute || isAdminRoute) {
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized: Token missing" }, { status: 401 });
        }

        try {
            const { payload } = await jose.jwtVerify(token, JWT_SECRET);

            headers.set("x-user-id", payload.userId as string);
            headers.set("x-user-role", payload.role as string);
            
            return null;
        } catch (error) {
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid token" }, { status: 401 });
        }
    }

    return null;
};

const authorize = (request: NextRequest, headers: Headers) => {
    const { pathname } = request.nextUrl;
    const isAdminRoute = pathname.startsWith("/api/admin") || pathname.startsWith("/admin");

    if (isAdminRoute) {
        const userRole = headers.get("x-user-role");

        if (userRole !== "admin") {
            return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
        }
    }

    return null;
}


export { rateLimiter, authenticate, authorize };