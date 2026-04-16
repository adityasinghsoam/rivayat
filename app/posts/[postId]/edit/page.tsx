import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PostEditorForm } from "@/components/post-editor-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      tags: true,
      language: true,
      isPublished: true,
      updatedAt: true,
      authorId: true,
    },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== user.id) {
    redirect(`/posts/${post.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">Revision</p>
        <h1 className="font-display text-5xl text-black">Sharpen the draft.</h1>
      </div>
      <PostEditorForm
        initialValue={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          tags: post.tags,
          language: post.language,
          isPublished: post.isPublished,
          updatedAt: post.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}
