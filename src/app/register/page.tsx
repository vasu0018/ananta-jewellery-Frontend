import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { safeNext } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join the Ananta circle for welcome points, early access to new drops and faster checkout.",
  robots: { index: false },
};

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next } = await searchParams;
  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute.">
      <RegisterForm next={safeNext(next)} />
    </AuthShell>
  );
}
