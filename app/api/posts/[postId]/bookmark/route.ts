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

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
      });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          postId,
        },
      });
    }

    return NextResponse.json({
      bookmarked: !existingBookmark,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to update bookmark." }, { status: 500 });
  }
}
