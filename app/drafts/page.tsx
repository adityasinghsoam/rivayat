import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DraftsList } from "@/components/drafts-list";

export default async function DraftsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">Workspace</p>
        <h1 className="font-display text-4xl text-black">Drafts</h1>
        <p className="text-sm text-neutral-500">Unpublished pieces you can keep refining before they go live.</p>
      </div>
      <DraftsList />
    </div>
  );
}
