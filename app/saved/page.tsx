import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SavedPosts } from "@/components/saved-posts";

export default async function SavedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-4xl text-black">Saved</h1>
        <p className="text-sm text-neutral-500">Posts you bookmarked to read later.</p>
      </div>
      <SavedPosts />
    </div>
  );
}
