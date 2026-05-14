"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerParentAction,
  type AuthActionResult
} from "@/server/actions/auth.actions";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth.schema";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AuthActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (values: RegisterInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await registerParentAction(values);
      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        if (actionResult.fieldErrors.fullName) {
          setError("fullName", { message: actionResult.fieldErrors.fullName });
        }
        if (actionResult.fieldErrors.email) {
          setError("email", { message: actionResult.fieldErrors.email });
        }
        if (actionResult.fieldErrors.password) {
          setError("password", { message: actionResult.fieldErrors.password });
        }
        if (actionResult.fieldErrors.confirmPassword) {
          setError("confirmPassword", {
            message: actionResult.fieldErrors.confirmPassword
          });
        }
        return;
      }

      if (actionResult.success) {
        reset();
      }
    });
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
        <Label htmlFor="register-name" className="text-text-primary">
          Full name
        </Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Parent full name"
          autoComplete="name"
          {...register("fullName")}
        />
        {errors.fullName ? (
          <p className="text-xs text-danger">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-text-primary">
          Email address
        </Label>
        <Input
          id="register-email"
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
        <Label htmlFor="register-password" className="text-text-primary">
          Password
        </Label>
        <Input
          id="register-password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-danger">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password" className="text-text-primary">
          Confirm password
        </Label>
        <Input
          id="register-confirm-password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-3 text-sm text-text-secondary">
        <p className="flex items-center gap-2 font-medium text-deep-navy">
          <ShieldCheck className="h-4 w-4 text-warm-gold" />
          Public registration creates parent accounts only.
        </p>
        <p className="mt-1">
          Admin and tutor accounts are provisioned internally by TopMox operations.
        </p>
      </div>

      {result ? (
        <p
          className={
            result.success
              ? "rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
              : "rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          }
        >
          {result.success ? (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {result.message}
            </span>
          ) : (
            result.message
          )}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create parent account"
        )}
      </Button>

      <p className="text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-royal-blue transition-colors hover:text-deep-navy"
        >
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}
