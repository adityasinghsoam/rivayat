import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name must be 60 characters or fewer."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(24, "Username must be 24 characters or fewer.")
    .regex(/^[A-Za-z0-9_]+$/, "Username may only contain letters, numbers, and underscores.")
    .transform((value) => value.toLowerCase()),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(64, "Password must be 64 characters or fewer."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(64, "Password must be 64 characters or fewer."),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160, "Title must be 160 characters or fewer."),
  content: z.string().trim().min(1, "Content is required."),
  excerpt: z.string().trim().max(180, "Excerpt must be 180 characters or fewer. Leave it blank to generate one from the content.").optional(),
  tags: z.array(z.string().min(1).max(24)).max(6),
  language: z.enum(["ENGLISH", "HINDI"]),
  isPublished: z.boolean().optional(),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty.").max(1000, "Comment must be 1000 characters or fewer."),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(280).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});
