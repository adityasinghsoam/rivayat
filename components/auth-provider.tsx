"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthUser = {
  id: string;
  email: string;
  username: string;
} | null;

type AuthContextValue = {
  user: AuthUser;
  loading: boolean;
  setAuth: (user: AuthUser, token?: string | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.user) {
          window.localStorage.removeItem("token");
          setUser(null);
          return;
        }

        setUser(data.user);
      })
      .catch(() => {
        window.localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function setAuth(nextUser: AuthUser, token?: string | null) {
    if (typeof token === "string") {
      window.localStorage.setItem("token", token);
    } else if (token === null) {
      window.localStorage.removeItem("token");
    }

    setUser(nextUser);
    setLoading(false);
  }

  async function logout() {
    window.localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
    await fetch("/api/auth/logout", { method: "POST" });
  }

  return <AuthContext.Provider value={{ user, loading, setAuth, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
