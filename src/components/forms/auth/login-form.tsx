"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { getSession, signIn } from "next-auth/react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardPathForRole } from "@/lib/auth/role";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (!result || result.error) {
      setFormError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    const nextPath = getDashboardPathForRole(session?.user?.role);

    if (nextPath === "/login") {
      setFormError("We could not determine your account role. Please try again.");
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <motion.form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-text-primary">
          Email address
        </Label>
        <Input
          id="login-email"
          type="email"
          placeholder="parent@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-danger">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-text-primary">
          Password
        </Label>
        <Input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-danger">{errors.password.message}</p>
        ) : null}
      </div>

      {formError ? (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link
          href="/register"
          className="font-medium text-royal-blue transition-colors hover:text-deep-navy"
        >
          Create parent account
        </Link>
        <Link
          href="/forgot-password"
          className="text-text-secondary transition-colors hover:text-text-primary"
        >
          Forgot password?
        </Link>
      </div>

      <div className="rounded-xl border border-royal-blue/20 bg-soft-blue/35 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-deep-navy">
          <Sparkles className="h-4 w-4 text-warm-gold" />
          Demo Login
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Demo login controls will be enabled in Phase 3C.
        </p>
      </div>
    </motion.form>
  );
}
