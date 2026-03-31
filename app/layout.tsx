import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Rivayat",
  description: "A home for poetry and stories in English and Hindi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body text-ink">
        <AuthProvider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
