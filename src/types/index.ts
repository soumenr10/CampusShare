import type {
  Item,
  Note,
  User,
  Message,
  Conversation,
  Review,
  Report,
  NoteVote,
  ConversationParticipant,
} from "@prisma/client";

// ─── Generic API Response Types ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── User Types ─────────────────────────────────────────────────────────────────

export type SafeUser = Omit<User, "passwordHash">;

export type UserSummary = Pick<
  User,
  "id" | "name" | "avatarUrl" | "rating" | "reviewCount"
>;

export interface UserProfile extends SafeUser {
  items: Item[];
  notes: Note[];
  reviewsReceived: ReviewWithReviewer[];
}

// ─── Item Types ─────────────────────────────────────────────────────────────────

export interface ItemWithSeller extends Item {
  seller: UserSummary;
}

// ─── Note Types ─────────────────────────────────────────────────────────────────

export interface NoteWithUploader extends Note {
  uploader: UserSummary;
}

export interface NoteWithVotes extends NoteWithUploader {
  votes: NoteVote[];
}

// ─── Conversation Types ─────────────────────────────────────────────────────────

export interface ConversationWithDetails extends Conversation {
  participants: (ConversationParticipant & {
    user: UserSummary;
  })[];
  messages: Message[];
}

export interface ConversationListItem extends Conversation {
  participants: (ConversationParticipant & {
    user: UserSummary;
  })[];
  messages: Message[]; // Last message only
}

// ─── Review Types ───────────────────────────────────────────────────────────────

export interface ReviewWithReviewer extends Review {
  reviewer: UserSummary;
}

// ─── Report Types ───────────────────────────────────────────────────────────────

export interface ReportWithDetails extends Report {
  reporter: UserSummary;
  item: Item | null;
  note: Note | null;
  reportedUser: SafeUser | null;
}

// ─── Message Types ──────────────────────────────────────────────────────────────

export interface MessageWithSender extends Message {
  sender: UserSummary;
}

// ─── Session / Auth Types ───────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User {
    id: string;
    role: string;
    isVerified: boolean;
    avatarUrl: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
    avatarUrl: string | null;
  }
}
