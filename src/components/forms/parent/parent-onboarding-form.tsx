"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCurrentParentProfileAction,
  upsertParentProfileAction,
  type ParentProfileActionResult
} from "@/server/actions/parent.actions";
import {
  parentProfileSchema,
  type ParentProfileInput
} from "@/lib/validations/parent.schema";
import { ParentOnboardingProgress } from "./parent-onboarding-progress";

type ParentOnboardingFormProps = {
  defaultFullName: string;
  defaultEmail: string;
};

export function ParentOnboardingForm({
  defaultFullName,
  defaultEmail
}: ParentOnboardingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [result, setResult] = useState<ParentProfileActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<ParentProfileInput>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      fullName: defaultFullName,
      email: defaultEmail,
      whatsappNumber: "",
      country: "",
      timezone: "",
      preferredContactMethod: "WHATSAPP",
      heardAboutTopMox: ""
    }
  });

  useEffect(() => {
    let mounted = true;

    const loadExistingProfile = async () => {
      try {
        const profileResult = await getCurrentParentProfileAction();

        if (!mounted) {
          return;
        }

        if (profileResult.success && profileResult.data) {
          setIsProfileReady(true);
          reset({
            fullName: profileResult.data.user.name,
            email: profileResult.data.user.email,
            whatsappNumber: profileResult.data.whatsappNumber,
            country: profileResult.data.country,
            timezone: profileResult.data.timezone,
            preferredContactMethod: profileResult.data.preferredContactMethod,
            heardAboutTopMox: profileResult.data.heardAboutTopMox || ""
          });
        }
      } finally {
        if (mounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadExistingProfile();

    return () => {
      mounted = false;
    };
  }, [reset]);

  const onSubmit = (values: ParentProfileInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = await upsertParentProfileAction(values);
      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof ParentProfileInput, string | undefined]
        >;

        fieldEntries.forEach(([field, message]) => {
          if (message) {
            setError(field, { message });
          }
        });
        return;
      }

      if (actionResult.success) {
        setIsProfileReady(true);
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <ParentOnboardingProgress profileSaved={isProfileReady} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="parent-full-name">Full name</Label>
          <Input id="parent-full-name" placeholder="Parent full name" {...register("fullName")} />
          {errors.fullName ? (
            <p className="text-xs text-danger">{errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent-email">Email</Label>
          <Input id="parent-email" type="email" placeholder="parent@example.com" {...register("email")} />
          {errors.email ? (
            <p className="text-xs text-danger">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent-whatsapp">WhatsApp number</Label>
          <Input
            id="parent-whatsapp"
            placeholder="+234 or international format"
            {...register("whatsappNumber")}
          />
          {errors.whatsappNumber ? (
            <p className="text-xs text-danger">{errors.whatsappNumber.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent-country">Country</Label>
          <Input id="parent-country" placeholder="Country of residence" {...register("country")} />
          {errors.country ? (
            <p className="text-xs text-danger">{errors.country.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent-timezone">Timezone</Label>
          <Input
            id="parent-timezone"
            placeholder="Example: Africa/Lagos, Europe/London"
            {...register("timezone")}
          />
          {errors.timezone ? (
            <p className="text-xs text-danger">{errors.timezone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred-contact">Preferred contact method</Label>
          <select
            id="preferred-contact"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("preferredContactMethod")}
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
          </select>
          {errors.preferredContactMethod ? (
            <p className="text-xs text-danger">
              {errors.preferredContactMethod.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="heard-about-topmox">
            How did you hear about TopMox?{" "}
            <span className="text-text-muted">(Optional)</span>
          </Label>
          <Input
            id="heard-about-topmox"
            placeholder="Friend, school referral, social media, community..."
            {...register("heardAboutTopMox")}
          />
          {errors.heardAboutTopMox ? (
            <p className="text-xs text-danger">{errors.heardAboutTopMox.message}</p>
          ) : null}
        </div>
      </div>

      {isLoadingProfile ? (
        <p className="text-sm text-text-secondary">Loading your existing profile...</p>
      ) : null}

      {result ? (
        <div
          className={
            result.success
              ? "rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
              : "rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
          }
        >
          {result.success ? (
            <p className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {result.message}
            </p>
          ) : (
            <p>{result.message}</p>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isPending || isLoadingProfile}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving profile...
            </>
          ) : (
            "Save Parent Profile"
          )}
        </Button>

        {isProfileReady ? (
          <Button asChild variant="outline">
            <Link href="/parent/children">Continue to Child Profile</Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled>
            Continue to Child Profile
          </Button>
        )}
      </div>
    </form>
  );
}
