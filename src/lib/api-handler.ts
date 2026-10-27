import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export function handleApi<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult | Promise<TResult>,
): (...args: TArgs) => Promise<NextResponse> {
    return async (...args: TArgs): Promise<NextResponse> => {
        try {
            const result = await fn(...args);

            if (result instanceof NextResponse) {
                return result;
            }

            return NextResponse.json(result);
        } catch (error: unknown) {
            console.error("[API Error Handled]:", error);

            let status = 500;
            let message = "Internal server error";

            if (error instanceof AppError) {
                status = error.status;
                message = error.message;
            } 

            else if (error instanceof ZodError) {
                status = 400;
                message = error.issues[0]?.message || "Invalid inputs";
            }

            else if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
                status = 409;
                message = "Email is already exist";
            }
            else if (error instanceof Error) {
                message = error.message;
            }

            return NextResponse.json({ success: false, error: message }, { status });
        }
    };
}
