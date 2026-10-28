import { ChatModel } from "../models/chat.model";
import { userMessageSchema, adminMessageSchema } from "../lib/validators";
import { AppError, handleApi } from "../lib/api-handler";
import { connectDB } from "../lib/db";
import { pusherServer } from "../lib/pusher";
import crypto from "crypto";


export const ChatController = {
    sendFromUser: handleApi(async (body, req: Request) => {
        await connectDB();

        const validData = userMessageSchema.parse(body);
        const { content } = validData;

        const userId = req.headers.get("x-user-id");

        const newMessage = {
            id: crypto.randomUUID(),
            content,
            createdAt: new Date()
        };

        await ChatModel.findOneAndUpdate(
            { userId },
            {
                $push: { incomingMessages: newMessage },
                $inc: { incomingCount: 1 }
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
            content,
            isReaded: false,
            createdAt: new Date()
        };

        const updatedChat = await ChatModel.findOneAndUpdate(
            { userId },
            {
                $push: { outgoingMessages: newMessage },
                $inc: { outgoingCount: 1 }
            }
        );

        if (!updatedChat) {
            throw new AppError("Chat channel not found for this user", 404);
        }

        await pusherServer.trigger(`chat-${userId}`, "new-message", {
            sender: "admin",
            message: newMessage
        });

        return { success: true, message: newMessage };
    }),
};