import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      bookmarks: bookmarks.map((bookmark) => ({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        post: bookmark.post,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load saved posts." }, { status: 500 });
  }
}
