"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";

import { ParentOnboardingProgress } from "@/components/forms/parent/parent-onboarding-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PREFERRED_LESSON_DAY_OPTIONS,
  SUPPORT_SUBJECT_OPTIONS
} from "@/lib/constants/subjects";
import {
  childProfileSchema,
  type ChildProfileInput
} from "@/lib/validations/student.schema";
import {
  createChildProfileAction,
  updateChildProfileAction,
  type ChildProfileActionResult
} from "@/server/actions/student.actions";

type ChildProfileFormMode = "create" | "edit";

type ChildProfileInitialValues = Partial<{
  fullName: string;
  age: number;
  classYearGroup: string;
  countryOfStudy: string;
  curriculum: string;
  subjectsNeedingSupport: string[];
  mainAcademicChallenge: string;
  academicGoal: string;
  preferredLessonDays: string[];
  preferredLessonTime: string;
}>;

type ChildProfileFormProps = {
  mode: ChildProfileFormMode;
  childId?: string;
  initialValues?: ChildProfileInitialValues;
};

function getDefaultValues(initialValues?: ChildProfileInitialValues): ChildProfileInput {
  return {
    fullName: initialValues?.fullName ?? "",
    age: initialValues?.age ?? 8,
    classYearGroup: initialValues?.classYearGroup ?? "",
    countryOfStudy: initialValues?.countryOfStudy ?? "",
    curriculum: initialValues?.curriculum ?? "",
    subjectsNeedingSupport: initialValues?.subjectsNeedingSupport ?? [],
    mainAcademicChallenge: initialValues?.mainAcademicChallenge ?? "",
    academicGoal: initialValues?.academicGoal ?? "",
    preferredLessonDays: initialValues?.preferredLessonDays ?? [],
    preferredLessonTime: initialValues?.preferredLessonTime ?? ""
  };
}

export function ChildProfileForm({
  mode,
  childId,
  initialValues
}: ChildProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ChildProfileActionResult | null>(null);
  const [savedChildCountHint, setSavedChildCountHint] = useState(
    (initialValues?.subjectsNeedingSupport?.length ?? 0) > 0
  );
  const isEditMode = mode === "edit";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ChildProfileInput>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: getDefaultValues(initialValues)
  });

  const onSubmit = (values: ChildProfileInput) => {
    setResult(null);

    startTransition(async () => {
      const actionResult = isEditMode
        ? await updateChildProfileAction({
            childId: childId ?? "",
            ...values
          })
        : await createChildProfileAction(values);

      setResult(actionResult);

      if (!actionResult.success && actionResult.fieldErrors) {
        const fieldEntries = Object.entries(actionResult.fieldErrors) as Array<
          [keyof ChildProfileInput | "childId", string | undefined]
        >;

        fieldEntries.forEach(([field, message]) => {
          if (!message || field === "childId") {
            return;
          }

          setError(field, { message });
        });

        return;
      }

      if (actionResult.success) {
        setSavedChildCountHint(true);
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <ParentOnboardingProgress
        activeStep={2}
        profileSaved
        hasChildProfiles={savedChildCountHint}
      />

      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
        <p className="font-medium text-deep-navy">
          Tell us where your child needs support
        </p>
        <p className="mt-2">
          This helps TopMox prepare a better assessment and recommend the right
          learning path for your child.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="child-full-name">Child full name</Label>
          <Input id="child-full-name" placeholder="Child full name" {...register("fullName")} />
          {errors.fullName ? (
            <p className="text-xs text-danger">{errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="child-age">Age</Label>
          <Input id="child-age" type="number" min={1} max={25} {...register("age")} />
          {errors.age ? (
            <p className="text-xs text-danger">{errors.age.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="child-class">Current class or year group</Label>
          <Input id="child-class" placeholder="Example: Primary 5, Year 8" {...register("classYearGroup")} />
          {errors.classYearGroup ? (
            <p className="text-xs text-danger">{errors.classYearGroup.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="child-country">Country of study</Label>
          <Input id="child-country" placeholder="Country of study" {...register("countryOfStudy")} />
          {errors.countryOfStudy ? (
            <p className="text-xs text-danger">{errors.countryOfStudy.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="child-curriculum">Curriculum</Label>
          <Input
            id="child-curriculum"
            placeholder="Example: Nigerian, British, American, blended school curriculum"
            {...register("curriculum")}
          />
          {errors.curriculum ? (
            <p className="text-xs text-danger">{errors.curriculum.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Subjects needing support</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUPPORT_SUBJECT_OPTIONS.map((subject) => (
              <label
                key={subject.slug}
                className="flex items-start gap-3 rounded-lg border border-border/80 bg-white px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  value={subject.slug}
                  className="mt-0.5 h-4 w-4 rounded border-border text-royal-blue focus:ring-royal-blue"
                  {...register("subjectsNeedingSupport")}
                />
                <span>
                  <span className="font-medium text-deep-navy">{subject.name}</span>
                  <span className="mt-1 block text-xs text-text-secondary">
                    {subject.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.subjectsNeedingSupport ? (
            <p className="text-xs text-danger">
              {errors.subjectsNeedingSupport.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="academic-challenge">Main academic challenge</Label>
          <Textarea
            id="academic-challenge"
            placeholder="Describe where your child is currently struggling."
            {...register("mainAcademicChallenge")}
          />
          {errors.mainAcademicChallenge ? (
            <p className="text-xs text-danger">
              {errors.mainAcademicChallenge.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="academic-goal">Academic goal</Label>
          <Textarea
            id="academic-goal"
            placeholder="What improvement do you want to see over the next term?"
            {...register("academicGoal")}
          />
          {errors.academicGoal ? (
            <p className="text-xs text-danger">{errors.academicGoal.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Preferred lesson days</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {PREFERRED_LESSON_DAY_OPTIONS.map((day) => (
              <label
                key={day}
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-white px-3 py-2 text-sm text-deep-navy"
              >
                <input
                  type="checkbox"
                  value={day}
                  className="h-4 w-4 rounded border-border text-royal-blue focus:ring-royal-blue"
                  {...register("preferredLessonDays")}
                />
                {day}
              </label>
            ))}
          </div>
          {errors.preferredLessonDays ? (
            <p className="text-xs text-danger">
              {errors.preferredLessonDays.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="preferred-lesson-time">Preferred lesson time</Label>
          <Input
            id="preferred-lesson-time"
            placeholder="Example: Weekdays 5:00 PM - 7:00 PM WAT"
            {...register("preferredLessonTime")}
          />
          {errors.preferredLessonTime ? (
            <p className="text-xs text-danger">
              {errors.preferredLessonTime.message}
            </p>
          ) : null}
        </div>
      </div>

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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving profile...
            </>
          ) : isEditMode ? (
            "Save Child Profile"
          ) : (
            "Create Child Profile"
          )}
        </Button>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/parent/children">Back to Children</Link>
        </Button>

        {savedChildCountHint ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/book-assessment">Next: Book a Child Assessment</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
