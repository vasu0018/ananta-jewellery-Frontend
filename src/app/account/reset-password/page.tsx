import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false },
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/account/reset-password">) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Set a new password" subtitle="Choose a password you haven't used before.">
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />
    </AuthShell>
  );
}
