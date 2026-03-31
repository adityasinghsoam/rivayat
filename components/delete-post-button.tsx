"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();

  async function onDelete() {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) {
      return;
    }

    await apiFetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="danger" onClick={onDelete}>
      Delete
    </Button>
  );
}
