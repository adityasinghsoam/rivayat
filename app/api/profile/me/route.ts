import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const data = profileSchema.parse(json);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "Please log in."
        : error instanceof Error
          ? error.message
          : "Unable to update profile";
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
