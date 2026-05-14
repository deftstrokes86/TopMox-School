"use client";

import { LogOut, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/auth/types";

type DashboardUserMenuProps = {
  name: string;
  email: string;
  role: AppRole;
};

export function DashboardUserMenu({ name, email, role }: DashboardUserMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden rounded-lg border border-border/80 bg-soft-cream/50 px-3 py-2 text-right sm:block">
        <p className="text-xs font-semibold text-text-primary">{name}</p>
        <p className="text-[11px] text-text-muted">{email}</p>
      </div>
      <StatusBadge label={role} tone="info" className="hidden sm:inline-flex" />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <UserCircle2 className="mr-2 h-4 w-4" />
        Sign out
        <LogOut className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
