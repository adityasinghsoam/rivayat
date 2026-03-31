import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const currentUser = await requireUser();
    const { username } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUser.id,
          },
        },
      });
    } else {
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      });

      await createNotification({
        type: "follow",
        userId: targetUser.id,
        actorId: currentUser.id,
      });
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: {
          followingId: targetUser.id,
        },
      }),
      prisma.follow.count({
        where: {
          followerId: targetUser.id,
        },
      }),
    ]);

    return NextResponse.json({
      isFollowing: !existingFollow,
      followersCount,
      followingCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to update follow status." }, { status: 500 });
  }
}
