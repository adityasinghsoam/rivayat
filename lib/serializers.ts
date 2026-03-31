import { Language } from "@prisma/client";

export type FeedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  language: Language;
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string;
    username: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  likedByMe?: boolean;
};

export function postInclude(userId?: string) {
  return {
    author: {
      select: {
        name: true,
        username: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    likes: userId
      ? {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        }
      : false,
  } as const;
}

export function serializePost<T extends FeedPost & { likes?: { id: string }[] }>(post: T) {
  return {
    ...post,
    likedByMe: Array.isArray(post.likes) ? post.likes.length > 0 : false,
  };
}
