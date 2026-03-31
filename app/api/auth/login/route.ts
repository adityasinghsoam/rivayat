import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, setSessionCookie, signAuthToken } from "@/lib/auth";
import { logAction } from "@/lib/action-log";
import { loginSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = loginSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const passwordMatches = await comparePassword(data.password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signAuthToken({
      id: user.id,
      email: user.email,
    });

    try {
      await setSessionCookie(token);
    } catch {
      // Returning the JWT token is enough for the client auth flow.
    }

    logAction("user_login", {
      userId: user.id,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid login request" }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to log in" }, { status: 500 });
  }
}
