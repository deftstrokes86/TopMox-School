import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/auth/register-form";
import { getDashboardPathForRole } from "@/lib/auth/role";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDashboardPathForRole(user.role));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-primary">
          Create parent account
        </h1>
        <p className="text-sm text-text-secondary">
          Start with secure access and we will guide you to the next steps.
        </p>
      </div>

      <RegisterForm />

      <p className="text-xs text-text-muted">
        By continuing, you are registering as a parent account under TopMox Global
        Tutoring.
      </p>
      <p className="text-xs text-text-muted">
        Need to sign in instead?{" "}
        <Link
          href="/login"
          className="font-medium text-royal-blue transition-colors hover:text-deep-navy"
        >
          Go to login
        </Link>
        .
      </p>
    </div>
  );
}
