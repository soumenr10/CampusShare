import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import type { ApiResponse, SafeUser } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(", "),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { email, password, name, collegeName, department, graduationYear, hostel, phone } =
      parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" } satisfies ApiResponse,
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        collegeName: collegeName ?? "Campus Student",
        department: department ?? "General",
        graduationYear,
        hostel: hostel ?? null,
        phone: phone ?? null,
      },
    });

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json(
      { success: true, data: safeUser as SafeUser } satisfies ApiResponse<SafeUser>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
