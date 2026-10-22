import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to track orders, manage your wishlist and check out faster.",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <AuthShell>
      <LoginForm next={safeNext(next)} />
    </AuthShell>
  );
}
