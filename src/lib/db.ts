import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error("Error in mongodb url");
}

type MongooseCache = {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
    mongoose?: MongooseCache;
};
const cached: MongooseCache = globalWithMongoose.mongoose || {
    conn: null,
    promise: null,
};

const seedAdmin = async () => {
    try {
        const adminExists = await UserModel.findOne({ role: "admin" });

        if (!adminExists) {
            const adminName = process.env.ADMIN_NAME || "Admin";
            const adminEmail = process.env.ADMIN_EMAIL || "";
            const adminPhone = process.env.ADMIN_PHONE || "";
            const adminPassword = process.env.ADMIN_PASSWORD || "";

            if (!adminEmail || !adminPassword || !adminPhone) {
                console.warn("Admin-Seed Warning: Admin credentials missing in .env.local. Skipping automation.");
                return;
            }

            console.log("Admin-Seed: No admin found. Injecting system administrator account...");

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await UserModel.create({
                name: adminName,
                email: adminEmail.toLowerCase().trim(),
                phone: adminPhone.trim(),
                password: hashedPassword,
                role: "admin",
            });

            console.log("Admin-Seed Success: Admin account created successfully!");
        }
    } catch (error: unknown) {
        console.error(
            "Admin-Seed Error: Failed to verify/seed admin account:",
            error instanceof Error ? error.message : String(error)
        );
    }
}


export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (mongoose.connection.readyState === 0 || !cached.promise) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose.connect(MONGODB_URI).then(async (m) => {
            console.log(`Conected to mongodb successfully!`);
            await seedAdmin();
            return m;
        }).catch((err) => {
            cached.promise = null;
            console.error("MongoDB Connection Error:", err.message);
            throw new Error("Error on DB");
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    globalWithMongoose.mongoose = cached;
    return cached.conn;
}
