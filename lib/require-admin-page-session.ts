import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSessionCookieName, readAdminSessionCookieValue } from "@/lib/admin-auth";

export async function requireAdminPageSession() {
  const cookieStore = await cookies();
  const session = readAdminSessionCookieValue(cookieStore.get(getAdminSessionCookieName())?.value);

  if (!session) {
    redirect("/login");
  }

  return session;
}
