import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { FeedPost } from "@/lib/serializers";
import { LikeButton } from "@/components/post-interactions";

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-ink/50">{post.language}</p>
          <Link href={`/posts/${post.id}`} className="mt-2 block font-display text-3xl leading-tight text-ink">
            {post.title}
          </Link>
        </div>
        <Badge>{post._count.likes} hearts</Badge>
      </div>
      <p className="line-clamp-3 text-sm leading-7 text-ink/75">{post.excerpt}</p>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Badge key={tag} className="bg-ink/5 text-ink/70">
            #{tag}
          </Badge>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-ink/60">
          <Link href={`/profile/${post.author.username}` as Route} className="font-medium text-ink">
            {post.author.name}
          </Link>{" "}
          · {formatDate(post.createdAt)} · {post._count.comments} comments
        </div>
        <LikeButton postId={post.id} initialLiked={post.likedByMe ?? false} initialCount={post._count.likes} />
      </div>
    </Card>
  );
}
