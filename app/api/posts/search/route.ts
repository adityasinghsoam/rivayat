import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ posts: [] });
  }

  const posts = await prisma.post.findMany({
    take: 10,
    where: {
      isPublished: true,
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      excerpt: true,
      slug: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ posts });
}
