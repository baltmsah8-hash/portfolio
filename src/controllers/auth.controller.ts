import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { UserModel } from "../models/user.model";
import { RegisterSchema, LoginSchema, UpdateSchema } from "../lib/validators";
import { AppError, handleApi } from "../lib/api-handler";
import { connectDB } from "../lib/db";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

export const authController = {
    login: handleApi(async (body) => {
        await connectDB();

        const validData = LoginSchema.parse(body);
        const { email, password } = validData;

        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new AppError("Error on email or password", 401);
        }

        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            throw new AppError("Error on email or password", 401);
        };

        const token = await new jose.SignJWT({ userId: user._id.toString(), role: user.role })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            user: user
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

    return response;
    }),
    register: handleApi(async (body) => {
        await connectDB();

        const validData = RegisterSchema.parse(body);
        const { name, email, phone, password } = validData;

        const userExists = await UserModel.findOne({ email: email.toLowerCase() });
        if (userExists) {
            throw new AppError("Email is already exist", 409);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await UserModel.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: "user",
        });

            const token = await new jose.SignJWT({ userId: newUser._id.toString(), role: newUser.role })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

        const response = NextResponse.json(
            { success: true, 
                message: "email created successfully", 
                user: { 
                    userId: newUser._id, 
                    ...newUser, createdAt: newUser.createdAt, 
                    updatedAt: newUser.updatedAt 
            } }, { status: 201 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response
    }),

    updateData: handleApi(async (body) => {
        await connectDB();

        const validData = UpdateSchema.parse(body);
        const { name, email, phone } = validData;

        const updateData: { name?: string; phone?: string } = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const updatedUser = await UserModel.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            throw new AppError("User not found", 404);
        }

        return { success: true, message: "User updated successfully", user: updatedUser };
    }),

    allUsers: handleApi(async () => {
        await connectDB();

        const users = await UserModel.find({});
        return { success: true, data: users };
    }),

    logout: handleApi(async () => {
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully"
        });

        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
            path: "/",
        });

        return response;
    })
};