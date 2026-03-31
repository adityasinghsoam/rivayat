import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-4xl text-ink">Edit profile</h1>
        <p className="text-sm text-ink/60">Update your public profile details.</p>
      </div>
      <Card>
        <ProfileForm
          initialValue={{
            username: user.username,
            name: user.name,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
          }}
        />
      </Card>
    </div>
  );
}
