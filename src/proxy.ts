import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from "jose";
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'ar'
});


const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const RATE_LIMIT_RULES: Record<string, { max: number; windowMs: number; message: string }> = {
    "POST:/api/auth/login": {
        max: 5,
        windowMs: 60 * 1000,
        message: "Too many login attempts. Please try again after a minute.",
    },
    "PUT:/api/user/profile": {
        max: 3,
        windowMs: 60 * 1000,
        message: "Too many profile updates. Core system cooldown active.",
    },
    "POST:/api/chat/user": {
        max: 20,
        windowMs: 60 * 1000,
        message: "Message rate limit exceeded. Please slow down.",
    },
};

const rateLimiter = (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const method = req.method;
    const routeKey = `${method}:${pathname}`;

    const rule = RATE_LIMIT_RULES[routeKey];
    if (!rule) return null;

    const now = Date.now();

    if (rateLimitMap.size > 5000) {
        for (const [key, value] of rateLimitMap.entries()) {
            if (now > value.expiresAt) rateLimitMap.delete(key);
        }
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const actionKey = `${ip}:${routeKey}`;
    const limitData = rateLimitMap.get(actionKey);

    if (limitData && now < limitData.expiresAt) {
        if (limitData.count >= rule.max) {
            return NextResponse.json(
                { success: false, error: rule.message },
                { status: 429 }
            );
        }
        limitData.count++;
    } else {
        rateLimitMap.set(actionKey, { count: 1, expiresAt: now + rule.windowMs });
    }

    return null;
};


if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const authenticate = async (req: NextRequest, requestHeaders: Headers) => {
    const { pathname } = req.nextUrl;

    requestHeaders.delete("x-user-id");
    requestHeaders.delete("x-user-role");

    const token = req.cookies.get("token")?.value;

    const isUserRoute =
        pathname.includes("/profile") ||
        pathname.includes("/chat") ||
        pathname.startsWith("/api/user") ||
        pathname.startsWith("/api/chat");

    const isAdminRoute =
        pathname.startsWith("/api/admin") ||
        pathname.includes("/admin");

    if (isUserRoute || isAdminRoute) {
        const isApi = pathname.startsWith("/api");
        const locale = pathname.split("/")[1] === "ar" ? "ar" : "en";

        if (!token) {
            return isApi
                ? NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
                : NextResponse.redirect(new URL(`/${locale}/auth`, req.url));
        }

        try {
            const { payload } = await jose.jwtVerify(token, JWT_SECRET);

            requestHeaders.set("x-user-id", payload.userId as string);
            requestHeaders.set("x-user-role", payload.role as string);

            return null;
        } catch {
            const res = isApi
                ? NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
                : NextResponse.redirect(new URL(`/${locale}/auth`, req.url));
            
            res.cookies.delete("token");
            return res;
        }
    }

    return null;
};

const authorize = (request: NextRequest, requestHeaders: Headers) => {
    const { pathname } = request.nextUrl;
    const method = request.method;
    const userRole = requestHeaders.get("x-user-role");
    const isApi = pathname.startsWith("/api");
    const locale = pathname.split("/")[1] === "en" ? "en" : "ar";

    const isAdminRoute =
        pathname.startsWith("/api/admin") ||
        /^\/(en|ar)\/admin(\/|$)/.test(pathname);

    const isProjectMutation =
        pathname.startsWith("/api/projects") && method !== "GET";

    if (isAdminRoute || isProjectMutation) {
        if (userRole !== "admin") {
            return isApi
                ? NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 })
                : NextResponse.redirect(new URL(`/${locale}`, request.url));
        }
    }

    const isStrictUserRoute =
        pathname.startsWith("/api/user") ||
        /^\/(en|ar)\/profile(\/|$)/.test(pathname);

    if (isStrictUserRoute && userRole !== "user") {
        return isApi
            ? NextResponse.json({ success: false, error: "Forbidden: User access required" }, { status: 403 })
            : NextResponse.redirect(new URL(userRole === "admin" ? `/${locale}/admin` : `/${locale}/auth`, request.url));
    }

    return null;
};

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
        const rateLimitResponse = rateLimiter(request);
        if (rateLimitResponse) return rateLimitResponse;

        const requestHeaders = new Headers(request.headers);

        const authResponse = await authenticate(request, requestHeaders);
        if (authResponse) return authResponse;

        const authorizeResponse = authorize(request, requestHeaders);
        if (authorizeResponse) return authorizeResponse;

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } else {
        if (pathname.startsWith('/_next') || pathname.includes('.')) {
            return NextResponse.next();
        }
        return intlMiddleware(request);
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};