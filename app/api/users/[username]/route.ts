import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const currentUser = await getCurrentUser();

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        posts: {
          orderBy: { createdAt: "desc" },
          select: {
            title: true,
            excerpt: true,
            createdAt: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    let followersCount = 0;
    let followingCount = 0;
    let isFollowing = false;

    try {
      [followersCount, followingCount] = await Promise.all([
        prisma.follow.count({
          where: { followingId: user.id },
        }),
        prisma.follow.count({
          where: { followerId: user.id },
        }),
      ]);

      if (currentUser) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: user.id,
            },
          },
          select: {
            id: true,
          },
        });

        isFollowing = Boolean(follow);
      }
    } catch {
      followersCount = 0;
      followingCount = 0;
      isFollowing = false;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        followersCount,
        followingCount,
        isFollowing,
        posts: user.posts,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load profile.",
      },
      { status: 500 },
    );
  }
}
