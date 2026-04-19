import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import type { AdminRole } from "@prisma/client";

export async function requireAdminPageSession(allowedRoles?: AdminRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/admin23671361");
  }

  if (
    allowedRoles &&
    session.user.role &&
    !allowedRoles.includes(session.user.role)
  ) {
    redirect("/dashboard/forbidden");
  }

  return session.user;
}
