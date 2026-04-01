import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const tag = request.nextUrl.searchParams.get("tag")?.trim().toLowerCase() || null;
  const query = request.nextUrl.searchParams.get("q")?.trim() || null;
  const cursor = request.nextUrl.searchParams.get("cursor")?.trim() || null;
  const limitParam = Number(request.nextUrl.searchParams.get("limit") || "10");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : 10;

  let whereClause: Record<string, unknown> = {};

  if (tag) {
    whereClause = {
      ...whereClause,
      tags: {
        has: tag,
      },
    };
  }

  if (query) {
    whereClause = {
      ...whereClause,
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
    };
  }

  if (cursor) {
    const cursorPost = await prisma.post.findUnique({
      where: { id: cursor },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (cursorPost) {
      whereClause = {
        ...whereClause,
        AND: [
          ...(Array.isArray(whereClause.AND) ? (whereClause.AND as object[]) : []),
          {
            OR: [
              {
                createdAt: {
                  lt: cursorPost.createdAt,
                },
              },
              {
                createdAt: cursorPost.createdAt,
                id: {
                  lt: cursorPost.id,
                },
              },
            ],
          },
        ],
      };
    }
  }

  const posts = await prisma.post.findMany({
    take: limit + 1,
    where: whereClause,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      excerpt: true,
      createdAt: true,
      slug: true,
      tags: true,
      _count: {
        select: {
          likes: true,
        },
      },
      likes: user
        ? {
            where: {
              userId: user.id,
            },
            select: {
              id: true,
            },
          }
        : false,
      author: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  const hasMore = posts.length > limit;
  const paginatedPosts = hasMore ? posts.slice(0, limit) : posts;

  return NextResponse.json({
    emptyStateMessage: query ? "No posts found" : null,
    nextCursor: hasMore ? paginatedPosts[paginatedPosts.length - 1]?.id ?? null : null,
    posts: paginatedPosts.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      createdAt: post.createdAt,
      slug: post.slug,
      tags: post.tags,
      likeCount: post._count.likes,
      likedByMe: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      author: post.author,
    })),
  });
}
