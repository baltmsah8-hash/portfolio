import mongoose from "mongoose";

const SingleMessageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    isReaded: { type: Boolean, default: false },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    incomingCount: { type: Number, default: 0 },
    outgoingCount: { type: Number, default: 0 },
    incomingMessages: [SingleMessageSchema],
    outgoingMessages: [SingleMessageSchema],
},{ timestamps: true });

export const ChatModel = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
