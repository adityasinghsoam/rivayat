import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { LikeButton } from "@/components/post-interactions";
import { CommentsSection } from "@/components/comments-section";
import { Button } from "@/components/ui/button";
import { DeletePostButton } from "@/components/delete-post-button";
import { sanitizeRichText } from "@/lib/sanitize-html";

export default async function PostDetailsPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const user = await getCurrentUser();
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      },
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
          }
        : false,
    },
  });

  if (!post) {
    notFound();
  }

  const isAuthor = user?.id === post.author.id;
  const sanitizedContent = sanitizeRichText(post.content);

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Badge>{post.language}</Badge>
          {post.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
        <h1 className="font-display text-5xl leading-tight text-black sm:text-6xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-neutral-900">
            {post.author.name}
          </Link>
          <span>{formatDate(post.createdAt)}</span>
          <span>{post._count.comments} comments</span>
        </div>
        <div className="flex items-center gap-3">
          <LikeButton postId={post.id} initialLiked={post.likes.length > 0} initialCount={post._count.likes} />
          {isAuthor ? (
            <>
              <Link href={`/posts/${post.id}/edit`}>
                <Button variant="ghost">Edit</Button>
              </Link>
              <DeletePostButton postId={post.id} />
            </>
          ) : null}
        </div>
      </div>

      <Card className="p-8">
        <div className="prose prose-lg max-w-none text-neutral-700" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </Card>

      <section className="space-y-5">
        <CommentsSection postId={post.id} />
      </section>
    </article>
  );
}
