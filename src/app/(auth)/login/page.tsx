import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/auth/login-form";
import { DEMO_LOGIN_ACCOUNTS, isDemoLoginEnabled } from "@/lib/auth/demo-login";
import { getDashboardPathForRole } from "@/lib/auth/role";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDashboardPathForRole(user.role));
  }

  const demoLoginEnabled = isDemoLoginEnabled();

  return (
    <div className="space-y-6">
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
