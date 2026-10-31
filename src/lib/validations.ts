import { z } from "zod";
import { isAllowedEmailDomain } from "./constants";

// ─── Registration ───────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  collegeName: z
    .string()
    .optional(),
  department: z
    .string()
    .optional(),
  graduationYear: z.number().int().min(2000).max(2040).optional(),
  hostel: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

// ─── Item ───────────────────────────────────────────────────────────────────────

export const itemSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  category: z.enum([
    "TEXTBOOKS",
    "ELECTRONICS",
    "DORM_ESSENTIALS",
    "FREE_DONATIONS",
    "NOTES_GUIDES",
    "ENGINEERING_SUPPLIES",
  ]),
  price: z.number().min(0, "Price cannot be negative").default(0),
  condition: z.enum(["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  images: z
    .array(
      z.string().refine(
        (value) => value.startsWith("data:image/") || /^https?:\/\//.test(value),
        "Each image must be a valid URL"
      )
    )
    .default([]),
  campusZone: z.string().max(100).optional(),
});

export const itemUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  category: z
    .enum([
      "TEXTBOOKS",
      "ELECTRONICS",
      "DORM_ESSENTIALS",
      "FREE_DONATIONS",
      "NOTES_GUIDES",
      "ENGINEERING_SUPPLIES",
    ])
    .optional(),
  price: z.number().min(0).optional(),
  condition: z.enum(["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR"]).optional(),
  images: z
    .array(
      z.string().refine(
        (value) => value.startsWith("data:image/") || /^https?:\/\//.test(value),
        "Each image must be a valid URL"
      )
    )
    .optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).optional(),
  campusZone: z.string().max(100).optional().nullable(),
});

// ─── Note ───────────────────────────────────────────────────────────────────────

export const noteSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  department: z.string().max(100).optional(),
  fileUrl: z.string().url("File URL must be a valid URL"),
  thumbnailUrl: z.string().url("Thumbnail must be a valid URL").optional(),
});

// ─── Review ─────────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  sellerId: z.string().cuid("Invalid seller ID"),
  itemId: z.string().cuid("Invalid item ID"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5"),
  comment: z
    .string()
    .min(5, "Comment must be at least 5 characters")
    .max(1000, "Comment must not exceed 1000 characters"),
});

// ─── Report ─────────────────────────────────────────────────────────────────────

export const reportSchema = z
  .object({
    itemId: z.string().cuid().optional(),
    noteId: z.string().cuid().optional(),
    userId: z.string().cuid().optional(),
    reason: z
      .string()
      .min(5, "Reason must be at least 5 characters")
      .max(200, "Reason must not exceed 200 characters"),
    description: z.string().max(2000).optional(),
  })
  .refine((data) => data.itemId || data.noteId || data.userId, {
    message: "At least one target (itemId, noteId, or userId) is required",
  });

// ─── Message ────────────────────────────────────────────────────────────────────

export const messageSchema = z.object({
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must not exceed 5000 characters"),
  messageType: z.enum(["TEXT", "OFFER", "RESERVE", "SOLD"]).default("TEXT"),
});

// ─── Vote ───────────────────────────────────────────────────────────────────────

export const voteSchema = z.object({
  voteType: z.enum(["UP", "DOWN"]),
});

// ─── Profile Update ─────────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  collegeName: z.string().min(2).max(200).optional(),
  department: z.string().min(2).max(100).optional(),
  graduationYear: z.number().int().min(2000).max(2040).optional().nullable(),
  hostel: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  contactPreference: z.enum(["EMAIL", "PHONE", "CHAT"]).optional(),
  phone: z.string().max(20).optional().nullable(),
});
