import type { Metadata } from "next";
import { ProfileView } from "@/components/account/ProfileForms";

export const metadata: Metadata = { title: "Profile & security" };

export default function ProfilePage() {
  return <ProfileView />;
}
