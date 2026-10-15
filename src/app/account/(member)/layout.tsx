import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: "My account", template: `%s | ${SITE_NAME}` },
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
