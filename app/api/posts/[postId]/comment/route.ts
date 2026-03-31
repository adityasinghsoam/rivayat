import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAction } from "@/lib/action-log";
import { createNotification } from "@/lib/notifications";
import { commentSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = await requireUser();
    const { postId } = await params;
    const json = await request.json();
    const data = commentSchema.parse(json);

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId,
        authorId: user.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
      },
    });

    if (post) {
      await createNotification({
        type: "comment",
        userId: post.authorId,
        actorId: user.id,
        postId,
      });
    }

    logAction("comment_added", {
      userId: user.id,
      postId,
      commentId: comment.id,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid comment." }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Login to comment" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to add comment." }, { status: 500 });
  }
}
