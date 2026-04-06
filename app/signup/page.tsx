import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="space-y-6 py-10">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-5xl text-black">Join Rivayat</h1>
        <p className="text-neutral-700">
          Create a home for your poems and stories. Already have an account?{" "}
          <Link href="/login" className="text-black transition hover:text-neutral-700">
            Log in
          </Link>
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
