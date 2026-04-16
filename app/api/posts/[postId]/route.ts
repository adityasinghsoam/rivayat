import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getReadTimeMinutes, makeSlug, normalizeExcerpt } from "@/lib/utils";
import { postSchema } from "@/lib/validations";

const recommendationSelect = {
  id: true,
  title: true,
  excerpt: true,
  slug: true,
  tags: true,
  createdAt: true,
  author: {
    select: {
      name: true,
      username: true,
    },
  },
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const user = await getCurrentUser();
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ slug: postId }, { id: postId }],
    },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      tags: true,
      language: true,
      views: true,
      isPublished: true,
      _count: {
        select: {
          likes: true,
          comments: true,
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
      bookmarks: user
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
          id: true,
          name: true,
          username: true,
          bio: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (!post.isPublished && user?.id !== post.author.id) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const updatedPost =
    post.isPublished
      ? await prisma.post.update({
          where: { id: post.id },
          data: {
            views: {
              increment: 1,
            },
          },
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            tags: true,
            language: true,
            views: true,
            isPublished: true,
            _count: {
              select: {
                likes: true,
                comments: true,
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
            bookmarks: user
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
                id: true,
                name: true,
                username: true,
                bio: true,
                avatarUrl: true,
              },
            },
          },
        })
      : post;

  let isFollowingAuthor = false;

  const [follow, authorPosts, similarTagCandidates] = await Promise.all([
    user && user.id !== updatedPost.author.id
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: updatedPost.author.id,
            },
          },
          select: {
            id: true,
          },
        })
      : Promise.resolve(null),
    prisma.post.findMany({
      where: {
        authorId: updatedPost.author.id,
        id: {
          not: updatedPost.id,
        },
        isPublished: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      select: recommendationSelect,
    }),
    updatedPost.tags.length
      ? prisma.post.findMany({
          where: {
            id: {
              not: updatedPost.id,
            },
            isPublished: true,
            tags: {
              hasSome: updatedPost.tags,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 12,
          select: recommendationSelect,
        })
      : Promise.resolve([]),
  ]);

  isFollowingAuthor = Boolean(follow);

  const similarPosts = similarTagCandidates
    .map((candidate) => ({
      ...candidate,
      sharedTagCount: candidate.tags.filter((tag) => updatedPost.tags.includes(tag)).length,
    }))
    .sort((left, right) => {
      if (right.sharedTagCount !== left.sharedTagCount) {
        return right.sharedTagCount - left.sharedTagCount;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    })
    .slice(0, 3)
    .map(({ sharedTagCount: _sharedTagCount, ...candidate }) => candidate);

  const readNext =
    similarPosts.length > 0
      ? similarPosts
      : await prisma.post.findMany({
          where: {
            id: {
              not: updatedPost.id,
            },
            isPublished: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
          select: recommendationSelect,
        });

  return NextResponse.json({
    post: {
      id: post.id,
      title: updatedPost.title,
      content: updatedPost.content,
      createdAt: updatedPost.createdAt,
      tags: updatedPost.tags,
      language: updatedPost.language,
      views: updatedPost.views,
      readTime: getReadTimeMinutes(updatedPost.content),
      isPublished: updatedPost.isPublished,
      likeCount: updatedPost._count.likes,
      commentCount: updatedPost._count.comments,
      likedByMe: Array.isArray(updatedPost.likes) ? updatedPost.likes.length > 0 : false,
      bookmarkedByMe: Array.isArray(updatedPost.bookmarks) ? updatedPost.bookmarks.length > 0 : false,
      author: {
        ...updatedPost.author,
        isFollowing: isFollowingAuthor,
      },
    },
    readNext,
    moreFromAuthor: authorPosts,
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  return PATCH(request, context);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;
    const existing = await prisma.post.findUnique({ where: { id: postId } });

    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json({ error: "You cannot edit this post." }, { status: 403 });
    }

    const json = await request.json();
    const data = postSchema.parse(json);
    const slug = existing.title === data.title ? existing.slug : `${makeSlug(data.title)}-${postId.slice(-5)}`;

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: normalizeExcerpt(data.excerpt ?? "", data.content),
        tags: data.tags,
        language: data.language,
        isPublished: data.isPublished ?? existing.isPublished,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "Please log in."
        : error instanceof ZodError
          ? error.issues[0]?.message ?? "Invalid post data."
          : error instanceof Error
            ? error.message
            : "Unable to update post";
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: "You cannot delete this post." }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error && error.message === "UNAUTHORIZED" ? "Please log in." : "Unable to delete post";
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
