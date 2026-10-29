import mongoose from 'mongoose';

const SingleMessageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    sender: { 
        type: String, 
        required: true, 
        enum: ['user', 'admin'],
        default: "user",
    },
    isReaded: { type: Boolean, default: false },
    content: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    unreadCount: { type: Number, default: 0 },
    messages: [SingleMessageSchema],
},{ timestamps: true });

export const ChatModel = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
