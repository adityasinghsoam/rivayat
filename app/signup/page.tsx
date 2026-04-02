import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="space-y-6 py-10">
      <div className="space-y-2 text-center">
        <h1 className="bg-gradient-to-r from-white to-violet-200 bg-clip-text font-display text-5xl text-transparent">Join Rivayat</h1>
        <p className="text-neutral-300">
          Create a home for your poems and stories. Already have an account?{" "}
          <Link href="/login" className="text-violet-300 transition hover:text-rose-300">
            Log in
          </Link>
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
