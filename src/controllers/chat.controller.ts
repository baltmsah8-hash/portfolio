import { ChatModel } from "../models/chat.model"; // تأكد من مطابقة اسم الملف والـ import
import { userMessageSchema, adminMessageSchema } from "../lib/validators";
import { AppError, handleApi } from "../lib/api-handler";
import { connectDB } from "../lib/db";
import { pusherServer } from "../lib/pusher";
import crypto from "crypto";
import { NextRequest } from "next/server";

export const ChatController = {
    sendFromUser: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const validData = userMessageSchema.parse(body);
        const { content } = validData;

        const userId = req.headers.get("x-user-id");
        if (!userId) throw new AppError("Unauthorized: User identity missing", 401);

        const newMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            content,
            isRead: false,
            createdAt: new Date()
        };

        await ChatModel.findOneAndUpdate(
            { userId },
            {
                $push: { messages: newMessage },
                $inc: { unreadCount: 1 }
            },
            { new: true, upsert: true }
        );

        await pusherServer.trigger(`chat-${userId}`, "new-message", {
            sender: "user",
            message: newMessage
        });

        return { success: true, message: newMessage };
    }),

    sendFromAdmin: handleApi(async (body) => {
        await connectDB();

        const validData = adminMessageSchema.parse(body);
        const { content, userId } = validData;

        const newMessage = {
            id: crypto.randomUUID(),
            sender: "admin",
            content,
            isRead: true,
            createdAt: new Date()
        };

        await ChatModel.findOneAndUpdate(
            { userId },
            {
                $push: { messages: newMessage }
            },
            { new: true, upsert: true }
        );

        await pusherServer.trigger(`chat-${userId}`, "new-message", {
            sender: "admin",
            message: newMessage
        });

        return { success: true, message: newMessage };
    }),

    getChat: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const userId = req.nextUrl.searchParams.get('UserId') ||
            req.nextUrl.searchParams.get('userId') ||
            req.headers.get("x-user-id");

        if (!userId) {
            throw new AppError("User identity missing", 401);
        }

        const chat = await ChatModel.findOne({ userId }).select("messages unreadCount");
        if (!chat) return { success: true, messages: [] };

        return { success: true, messages: chat.messages };
    }),

    markAsRead: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const role = req.headers.get("x-user-role");
        const userId = req.headers.get("x-user-id");

        if (!userId) throw new AppError("User ID is required for admin", 400);

        if (role === "admin") {
            await ChatModel.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        unreadCount: 0,
                        "messages.$[msg].isRead": true
                    }
                },
                {
                    arrayFilters: [{ "msg.sender": "user" }]
                }
            );
        } else {
            await ChatModel.findOneAndUpdate(
                { userId: userId },
                {
                    $set: { "messages.$[msg].isRead": true }
                },
                { arrayFilters: [{ "msg.sender": "admin" }] }
            );
        }

        return { success: true, message: "Chat marked as read successfully" };
    }),

    cleanupOldMessages: handleApi(async (body, req: NextRequest) => {
        await connectDB();

        const authHeader = req.headers.get("authorization");

        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            throw new AppError("Unauthorized Cron Trigger", 401);
        }

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const result = await ChatModel.updateMany(
            {},
            {
                $pull: {
                    messages: {
                        createdAt: { $lt: oneWeekAgo },
                        isPinned: false
                    }
                }
            }
        );

        return {
            success: true,
            message: "Old messages cleaned up successfully",
            affectedRows: result.modifiedCount
        };
    }),

    pinMessage: handleApi(async (body, req: NextRequest) => {
        await connectDB();
        const role = req.headers.get("x-user-role");
        if (role !== "admin") throw new AppError("Forbidden: Admin access required", 403);

        const { userId, messageId, pinStatus } = body as {
            userId?: string;
            messageId?: string;
            pinStatus?: boolean;
        };
        if (!userId || !messageId) throw new AppError("userId and messageId are required", 400);

        const updatedChat = await ChatModel.findOneAndUpdate(
            { userId, "messages.id": messageId },
            { $set: { "messages.$[msg].isPinned": pinStatus ?? true } },
            { arrayFilters: [{ "msg.id": messageId }], new: true }
        );

        if (!updatedChat) throw new AppError("Message or Chat not found", 404);
        return { success: true, message: "Message pin status updated successfully" };
    }),

};
