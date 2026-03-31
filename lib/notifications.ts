import { prisma } from "@/lib/prisma";

type NotificationType = "like" | "comment" | "follow";

export async function createNotification({
  type,
  userId,
  actorId,
  postId,
}: {
  type: NotificationType;
  userId: string;
  actorId: string;
  postId?: string;
}) {
  if (userId === actorId) {
    return;
  }

  await prisma.notification.create({
    data: {
      type,
      userId,
      actorId,
      postId,
    },
  });
}
