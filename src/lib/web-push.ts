import * as webpush from "web-push";
import { PushSubscriptionModel } from "../models/push-subscription.model";

function configureVapid() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_EMAIL;

    if (!publicKey || !privateKey) {
        throw new Error("VAPID public and private keys are required");
    }
    if (!subject) {
        throw new Error("VAPID_EMAIL is required for Web Push delivery");
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
}

interface PushPayload {
    title: string;
    body: string;
    url: string;
    chatId: string;
}

export async function sendWebPushToUsers(
    userIds: string[],
    payload: PushPayload
) {
    try {
        configureVapid();
        const subscriptions = await PushSubscriptionModel.find({
            userId: { $in: userIds },
        }).lean();

        if (!subscriptions.length) return;

        const notificationString = JSON.stringify(payload);

        const sendPromises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.keys.p256dh,
                            auth: sub.keys.auth,
                        },
                    },
                    notificationString
                );
            } catch (error: unknown) {
                const err = error as { statusCode?: number };
                // حذف الاشتراك تلقائياً إذا ألغى المستخدم الإذن أو انتهت صلاحيته
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await PushSubscriptionModel.deleteOne({ _id: sub._id });
                } else {
                    console.error("Web Push Send Error:", error);
                }
            }
        });

        await Promise.all(sendPromises);
    } catch (error) {
        console.error("Failed to process Web Push queue:", error);
    }
}
