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


const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || ""
);

const authenticate = async (req: NextRequest, requestHeaders: Headers) => {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("token")?.value;

    const isUserRoute =
        pathname.includes("/profile") ||
        pathname.startsWith("/api/user/profile") ||
        pathname.startsWith("/api/chat");

    const isAdminRoute = pathname.startsWith("/api/admin") || pathname.includes("/admin");

    if (isUserRoute || isAdminRoute) {
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized: Token missing" }, { status: 401 });
        }

        try {
            const { payload } = await jose.jwtVerify(token, JWT_SECRET);

            requestHeaders.set("x-user-id", payload.userId as string);
            requestHeaders.set("x-user-role", payload.role as string);

            return null;
        } catch (error) {
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid token" }, { status: 401 });
        }
    }

    return null;
};

const authorize = (request: NextRequest, requestHeaders: Headers) => {
    const { pathname } = request.nextUrl;
    const isAdminRoute = pathname.startsWith("/api/admin") || pathname.startsWith("/admin");

    if (isAdminRoute) {
        const userRole = requestHeaders.get("x-user-role");

        if (userRole !== "admin") {
            return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
        }
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
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};