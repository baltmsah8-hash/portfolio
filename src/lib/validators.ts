import { Content } from "next/font/google";
import z from "zod";

const phoneRegex: RegExp = /^(01\d{9})|(\+[1-9]\d{1,14})$/;

const RegisterSchema = z.object({
    name: z.string().min(4, "The name must be more than four letters long"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
    password: z.string().min(8, "The password must be at least 8 characters long."),
});

const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "The password must be at least 8 characters long."),
});

const UpdateSchema = z.object({
    name: z.string().min(4, "The name is too short."),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
});

const userMessageSchema = z.object({
  content: z.string().min(8, "Your message is too short (min 8 characters)"),
});

const adminMessageSchema = z.object({
  userId: z.string(),
  content: z.string().min(8, "Your message is too short (min 8 characters)"),
});


export { RegisterSchema, LoginSchema, UpdateSchema, userMessageSchema, adminMessageSchema };
