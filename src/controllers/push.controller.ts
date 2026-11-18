import { NextRequest } from "next/server";
import { connectDB } from "../lib/db";
import { AppError, handleApi } from "../lib/api-handler";
import { PushSubscriptionModel } from "../models/push-subscription.model";

export const PushController = {
    subscribe: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const userId = req.headers.get("x-user-id");
        if (!userId) {
            throw new AppError("Unauthorized: User identity missing", 401);
        }

        const { endpoint, keys } = body as {
            endpoint?: string;
            keys?: { p256dh?: string; auth?: string };
        };

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            throw new AppError("Invalid push subscription object", 400);
        }

        await PushSubscriptionModel.findOneAndUpdate(
            { endpoint },
            {
                userId,
                endpoint,
                keys: {
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                }
            },
            { upsert: true, new: true }
        );

        return { success: true, message: "Push notifications enabled" };
    }),

    unsubscribe: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const userId = req.headers.get("x-user-id");
        if (!userId) {
            throw new AppError("Unauthorized: User identity missing", 401);
        }

        const { endpoint } = body as { endpoint?: string };
        if (!endpoint) {
            throw new AppError("Endpoint is required", 400);
        }

        await PushSubscriptionModel.deleteOne({ endpoint, userId });

        return { success: true, message: "Push notifications disabled" };
    })
};