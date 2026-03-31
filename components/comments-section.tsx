"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
};

export function CommentsSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadComments() {
    try {
      const data = await apiFetch<{ comments: CommentItem[] }>(`/api/posts/${postId}/comments`);
      setComments(data.comments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadComments();
  }, [postId]);

  async function submitComment() {
    if (!user) {
      setError("Login to comment");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await apiFetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setContent("");
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add comment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-3xl text-ink">Comments</h2>
      <Card className="space-y-3">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={user ? "Write a comment..." : "Login to comment"}
          disabled={!user || busy}
        />
        {!user ? <p className="text-sm text-ink/60">Login to comment</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button variant="secondary" onClick={submitComment} disabled={!user || busy || !content.trim()}>
          {busy ? "Posting..." : "Post comment"}
        </Button>
      </Card>

      {loading ? <p className="text-sm text-ink/60">Loading comments...</p> : null}

      {!loading && !comments.length ? <p className="text-sm text-ink/60">No comments yet.</p> : null}

      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id} className="space-y-2">
            <p className="text-sm text-ink/60">
              {comment.author.name} · {formatDate(comment.createdAt)}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-ink/85">{comment.content}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
