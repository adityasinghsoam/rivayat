import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="space-y-6 py-10">
      <div className="space-y-2 text-center">
        <h1 className="bg-gradient-to-r from-white to-violet-200 bg-clip-text font-display text-5xl text-transparent">Welcome back</h1>
        <p className="text-neutral-300">
          Log in to continue writing and responding. Need an account?{" "}
          <Link href="/signup" className="text-violet-300 transition hover:text-rose-300">
            Sign up
          </Link>
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
