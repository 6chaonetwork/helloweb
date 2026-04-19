"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardSignOutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);

    try {
      await signOut({
        callbackUrl: "/admin23671361",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={pending}
      className={cn("w-full justify-center", className)}
    >
      <LogOut size={16} />
      <span>{pending ? "退出中..." : "退出后台"}</span>
    </Button>
  );
}
