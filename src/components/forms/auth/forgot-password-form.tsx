"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordAction,
  type AuthActionResult
} from "@/server/actions/auth.actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput
} from "@/lib/validations/auth.schema";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AuthActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = (values: ForgotPasswordInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await forgotPasswordAction(values);
      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors?.email) {
        setError("email", { message: actionResult.fieldErrors.email });
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
        <Label htmlFor="forgot-email" className="text-text-primary">
          Email address
        </Label>
        <Input
          id="forgot-email"
          type="email"
          placeholder="parent@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-danger">{errors.email.message}</p>
        ) : null}
      </div>

      <p className="rounded-md border border-royal-blue/20 bg-soft-blue/30 px-3 py-2 text-sm text-text-secondary">
        If an account exists, reset instructions will be sent.
      </p>

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
              <MailCheck className="h-4 w-4" />
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
            Sending...
          </>
        ) : (
          "Send reset instructions"
        )}
      </Button>

      <p className="text-sm text-text-secondary">
        Back to{" "}
        <Link
          href="/login"
          className="font-medium text-royal-blue transition-colors hover:text-deep-navy"
        >
          sign in
        </Link>
      </p>
    </motion.form>
  );
}
