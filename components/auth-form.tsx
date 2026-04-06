"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const payload =
        mode === "signup"
          ? {
              name: String(formData.get("name") || ""),
              username: String(formData.get("username") || ""),
              email: String(formData.get("email") || ""),
              password: String(formData.get("password") || ""),
            }
          : {
              email: String(formData.get("email") || ""),
              password: String(formData.get("password") || ""),
            };

      const data = await apiFetch<{
        token?: string;
        user?: { id: string; email: string; username: string };
      }>(mode === "signup" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAuth(data.user ?? null, data.token ?? null);
      trackEvent(mode === "signup" ? "user_signup" : "user_login");

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-xl p-8">
      <form onSubmit={onSubmit} className="space-y-5">
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900">Name</label>
              <Input name="name" placeholder="Aarav Sharma" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900">Username</label>
              <Input name="username" placeholder="aarav_writes" required />
            </div>
          </>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Email</label>
          <Input name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900">Password</label>
          <Input name="password" type="password" placeholder="Minimum 8 characters" required />
        </div>
        {error ? <p className="text-sm text-neutral-700">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
