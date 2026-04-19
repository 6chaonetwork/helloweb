import { redirect } from "next/navigation";

export default function AdminOnboardingPage() {
  redirect("/dashboard/admin/content");
}
