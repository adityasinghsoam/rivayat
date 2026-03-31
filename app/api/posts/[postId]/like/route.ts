import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId: user.id,
          },
        },
      });
    } else {
      const like = await prisma.like.create({
        data: {
          postId,
          userId: user.id,
        },
      });

      const post = await prisma.post.findUnique({
        where: { id: like.postId },
        select: {
          authorId: true,
        },
      });

      if (post) {
        await createNotification({
          type: "like",
          userId: post.authorId,
          actorId: user.id,
          postId,
        });
      }
    }

    const likeCount = await prisma.like.count({
      where: { postId },
    });

    return NextResponse.json({
      liked: !existingLike,
      likeCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login to like posts" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to update like" }, { status: 500 });
  }
}
