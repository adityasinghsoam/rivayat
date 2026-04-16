import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logAction } from "@/lib/action-log";
import { createNotification } from "@/lib/notifications";

async function getTargetUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });
}

async function getFollowCounts(targetUserId: string) {
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({
      where: {
        followingId: targetUserId,
      },
    }),
    prisma.follow.count({
      where: {
        followerId: targetUserId,
      },
    }),
  ]);

  return { followersCount, followingCount };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const currentUser = await requireUser();
    const { username } = await params;
    const targetUser = await getTargetUser(username);

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
      select: {
        id: true,
      },
    });

    if (!existingFollow) {
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

    const { followersCount, followingCount } = await getFollowCounts(targetUser.id);

    logAction("follow_action", {
      userId: currentUser.id,
      targetUserId: targetUser.id,
      following: true,
    });

    return NextResponse.json({
      isFollowing: true,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const currentUser = await requireUser();
    const { username } = await params;
    const targetUser = await getTargetUser(username);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    const { followersCount, followingCount } = await getFollowCounts(targetUser.id);

    logAction("follow_action", {
      userId: currentUser.id,
      targetUserId: targetUser.id,
      following: false,
    });

    return NextResponse.json({
      isFollowing: false,
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
