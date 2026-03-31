import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;

    await prisma.like.upsert({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
      update: {},
      create: {
        postId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: "Please log in." }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;

    await prisma.like.deleteMany({
      where: {
        postId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: "Please log in." }, { status });
  }
}
