import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReadTimeMinutes } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireUser();

    const drafts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        isPublished: false,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        updatedAt: true,
        createdAt: true,
        tags: true,
        language: true,
        views: true,
      },
    });

    return NextResponse.json({
      drafts: drafts.map((draft) => ({
        ...draft,
        readTime: getReadTimeMinutes(draft.content),
      })),
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    const message = status === 401 ? "Please log in." : "Unable to load drafts.";
    return NextResponse.json({ error: message }, { status });
  }
}
