import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { logAction } from "@/lib/action-log";
import { getReadTimeMinutes, makeSlug, normalizeExcerpt } from "@/lib/utils";
import { postSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const tag = request.nextUrl.searchParams.get("tag")?.trim().toLowerCase() || null;
  const query = request.nextUrl.searchParams.get("q")?.trim() || null;
  const cursor = request.nextUrl.searchParams.get("cursor")?.trim() || null;
  const limitParam = Number(request.nextUrl.searchParams.get("limit") || "10");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : 10;
  let personalized = false;
  let emptyStateMessage: string | null = null;
  let whereClause: Record<string, unknown> = {};

  whereClause = {
    isPublished: true,
  };

  if (user) {
    personalized = true;

    const following = await prisma.follow.findMany({
      where: {
        followerId: user.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((entry) => entry.followingId);

    if (!followingIds.length) {
      emptyStateMessage = "Follow users to see their posts";
      return NextResponse.json({
        personalized,
        emptyStateMessage,
        posts: [],
      });
    }

    whereClause = {
      ...whereClause,
      authorId: {
        in: followingIds,
      },
    };
  }

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

  let cursorPost: { id: string; createdAt: Date } | null = null;

  if (cursor) {
    cursorPost = await prisma.post.findUnique({
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
      content: true,
      createdAt: true,
      slug: true,
      tags: true,
      views: true,
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

  if (user && !paginatedPosts.length) {
    emptyStateMessage = "Follow users to see their posts";
  }

  if (query && !paginatedPosts.length) {
    emptyStateMessage = "No posts found";
  }

  return NextResponse.json({
    personalized,
    emptyStateMessage,
    nextCursor: hasMore ? paginatedPosts[paginatedPosts.length - 1]?.id ?? null : null,
    posts: paginatedPosts.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      createdAt: post.createdAt,
      slug: post.slug,
      tags: post.tags,
      views: post.views,
      readTime: getReadTimeMinutes(post.content),
      likeCount: post._count.likes,
      likedByMe: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      author: post.author,
    })),
  });
}

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    const user = await requireUser();
    requestBody = await request.json();
    const data = postSchema.parse(requestBody);
    const baseSlug = makeSlug(data.title);

    if (!baseSlug) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.post.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: normalizeExcerpt(data.excerpt ?? "", data.content),
        tags: data.tags,
        language: data.language,
        isPublished: data.isPublished ?? false,
        authorId: user.id,
      },
    });

    logAction(data.isPublished ? "post_created" : "draft_saved", {
      userId: user.id,
      postId: post.id,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[POST /api/posts] Validation failed", {
        body: requestBody,
        issues: error.issues,
      });
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid post data.",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please log in to create a post." }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to create post." }, { status: 500 });
  }
}
