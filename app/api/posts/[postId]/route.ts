import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { makeExcerpt, makeSlug } from "@/lib/utils";
import { postSchema } from "@/lib/validations";

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

  let isFollowingAuthor = false;

  if (user && user.id !== post.author.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: post.author.id,
        },
      },
      select: {
        id: true,
      },
    });

    isFollowingAuthor = Boolean(follow);
  }

  return NextResponse.json({
    post: {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      tags: post.tags,
      language: post.language,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByMe: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      bookmarkedByMe: Array.isArray(post.bookmarks) ? post.bookmarks.length > 0 : false,
      author: {
        ...post.author,
        isFollowing: isFollowingAuthor,
      },
    },
  });
}

export async function PUT(
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
        excerpt: makeExcerpt(data.content),
        tags: data.tags,
        language: data.language,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "Please log in."
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
