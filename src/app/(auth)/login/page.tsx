import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/forms/auth/login-form";
import { DEMO_LOGIN_ACCOUNTS } from "@/lib/auth/demo-login";
import { getDemoLoginReadiness } from "@/lib/auth/demo-login.server";
import { getDashboardPathForRole } from "@/lib/auth/role";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDashboardPathForRole(user.role));
  }

  const demoLoginReadiness = await getDemoLoginReadiness();
  const demoLoginEnabled = demoLoginReadiness.available;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-royal-blue/25 bg-soft-blue/12 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-royal-blue">
          TopMox Global Tutoring
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-deep-navy transition-colors hover:text-royal-blue"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to homepage
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-primary">Sign in</h1>
        <p className="text-sm text-text-secondary">
          Continue to your parent, tutor, or admin workspace.
        </p>
      </div>

      <LoginForm
        demoLoginEnabled={demoLoginEnabled}
        demoAccounts={demoLoginEnabled ? DEMO_LOGIN_ACCOUNTS : []}
      />

      <p className="text-xs text-text-muted">
        New to TopMox?{" "}
        <Link
          href="/register"
          className="font-medium text-royal-blue transition-colors hover:text-deep-navy"
        >
          Create a parent account
        </Link>
        .
      </p>
    </div>
  );
}
