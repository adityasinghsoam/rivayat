import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="space-y-6 py-10">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-5xl text-ink">Welcome back</h1>
        <p className="text-ink/70">
          Log in to continue writing and responding. Need an account?{" "}
          <Link href="/signup" className="text-ember">
            Sign up
          </Link>
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
