import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/forms/auth/forgot-password-form";
import { getDashboardPathForRole } from "@/lib/auth/role";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDashboardPathForRole(user.role));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-primary">Reset password</h1>
        <p className="text-sm text-text-secondary">
          Enter your account email and we will send reset instructions.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
