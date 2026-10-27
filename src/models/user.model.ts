// src/models/user.model.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { 
        type: String, 
        default: "https://dicebear.com"
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    },{ timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
