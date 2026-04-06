import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PostEditorForm } from "@/components/post-editor-form";

export default async function WritePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">New piece</p>
        <h1 className="font-display text-5xl text-black">Write something that stays.</h1>
      </div>
      <PostEditorForm />
    </div>
  );
}
