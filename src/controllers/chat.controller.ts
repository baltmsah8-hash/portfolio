import { ChatModel } from "../models/chat.model";
import { userMessageSchema, adminMessageSchema } from "../lib/validators";
import { AppError, handleApi } from "../lib/api-handler";
import { connectDB } from "../lib/db";
import { pusherServer } from "../lib/pusher";
import crypto from "crypto";
import { NextRequest } from "next/server";

export const ChatController = {
    sendFromUser: handleApi(async (body, req: NextRequest) => {
        await connectDB();
        const { content } = userMessageSchema.parse(body);

        const userId = req.headers.get("x-user-id");
        if (!userId) throw new AppError("Unauthorized: User identity missing", 401);

        const newMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            content,
            isReaded: false,
            createdAt: new Date(),
        };

        await ChatModel.findOneAndUpdate(
            { userId },
            {
                $push: { messages: newMessage },
                $inc: { unreadCount: 1 },
            },
            { new: true, upsert: true }
        ).lean();

        await pusherServer.trigger(`chat-${userId}`, "new-message", {
            sender: "user",
            message: newMessage,
        });

        return { success: true, message: newMessage };
    }),

    sendFromAdmin: handleApi(async (body, req: NextRequest) => {
        await connectDB();
        const role = req.headers.get("x-user-role");
        if (role !== "admin") throw new AppError("Forbidden", 403);

        const { content, userId } = adminMessageSchema.parse(body);

        const newMessage = {
            id: crypto.randomUUID(),
            sender: "admin",
            content,
            isReaded: false,
            createdAt: new Date(),
        };

        await ChatModel.findOneAndUpdate(
            { userId },
            { $push: { messages: newMessage } },
            { new: true, upsert: true }
        ).lean();

        await pusherServer.trigger(`chat-${userId}`, "new-message", {
            sender: "admin",
            message: newMessage,
        });

        return { success: true, message: newMessage };
    }),

    getChat: handleApi(async (req: NextRequest) => {
        await connectDB();

        const role = req.headers.get("x-user-role");
        const headerUserId = req.headers.get("x-user-id");
        const queryUserId = req.nextUrl.searchParams.get("userId");

        const targetUserId = role === "admin" ? queryUserId : headerUserId;
        if (!targetUserId) throw new AppError("User identity missing", 400);

        const otherSender = role === "admin" ? "user" : "admin";

        const updateQuery: { $set: Record<string, boolean | number> } = {
            $set: { "messages.$[msg].isReaded": true },
        };
        if (role === "admin") {
            updateQuery.$set.unreadCount = 0;
        }

        const chat = await ChatModel.findOneAndUpdate(
            { userId: targetUserId },
            updateQuery,
            {
                arrayFilters: [{ "msg.sender": otherSender, "msg.isReaded": false }],
                new: true,
            }
        )
            .select("messages unreadCount")
            .lean();

        if (!chat) return { success: true, messages: [], userId: targetUserId };

        await pusherServer.trigger(`chat-${targetUserId}`, "messages-read", {
            readBy: role,
        });

        return { success: true, messages: chat.messages, userId: targetUserId };
    }),

    markAsRead: handleApi(async (body: { userId?: string }, req: NextRequest) => {
        await connectDB();

        const role = req.headers.get("x-user-role");
        const headerUserId = req.headers.get("x-user-id");

        const targetUserId = role === "admin" ? body.userId : headerUserId;
        if (!targetUserId) throw new AppError("Target User ID is required", 400);

        const otherSender = role === "admin" ? "user" : "admin";

        const updateQuery: { $set: Record<string, boolean | number> } = {
            $set: { "messages.$[msg].isReaded": true },
        };
        if (role === "admin") {
            updateQuery.$set.unreadCount = 0;
        }

        await ChatModel.findOneAndUpdate(
            { userId: targetUserId },
            updateQuery,
            {
                arrayFilters: [{ "msg.sender": otherSender, "msg.isReaded": false }],
            }
        );

        await pusherServer.trigger(`chat-${targetUserId}`, "messages-read", {
            readBy: role,
        });

        return { success: true };
    }),

cleanupOldMessages: handleApi(async (body, req: NextRequest) => {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        throw new AppError("Unauthorized Cron Trigger", 401);
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await ChatModel.updateMany(
        {},
        {
            $pull: {
                messages: {
                    createdAt: { $lt: oneWeekAgo },
                    isPinned: false,
                },
            },
        }
    );

    await ChatModel.updateMany({}, [
        {
            $set: {
                unreadCount: {
                    $size: {
                        $filter: {
                            input: "$messages",
                            as: "msg",
                            cond: {
                                $and: [
                                    { $eq: ["$$msg.sender", "user"] },
                                    { $eq: ["$$msg.isReaded", false] },
                                ],
                            },
                        },
                    },
                },
            },
        },
    ]);

    return {
        success: true,
        message: "Old messages cleaned up successfully",
        affectedRows: result.modifiedCount,
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
            { userId, "messages._id": messageId },
            { $set: { "messages.$[msg].isPinned": pinStatus ?? true } },
            { arrayFilters: [{ "msg._id": messageId }], new: true }
        );

        if (!updatedChat) throw new AppError("Message or Chat not found", 404);
        return { success: true, message: "Message pin status updated successfully" };
    }),

};
