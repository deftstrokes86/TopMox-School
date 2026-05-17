"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { ResourceStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, CheckCircle2, Loader2, Save, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  archiveResourceAction,
  createResourceAction,
  updateResourceAction,
  type ResourceActionResult
} from "@/server/actions/resource.actions";
import { updateResourceSchema } from "@/lib/validations/resource.schema";
import {
  buildResourceFormInitialValues,
  type ResourceFormValues
} from "@/lib/utils/resource-ui";

type ResourceFormMode = "create" | "edit";

type ResourceFormProps = {
  mode: ResourceFormMode;
  resourceId?: string;
  initialValues?: Partial<ResourceFormValues>;
};

const resourceFormSchema = updateResourceSchema.omit({
  resourceId: true
});

type ResourceFormInput = z.infer<typeof resourceFormSchema>;

const resourceStatuses: Array<{ value: ResourceStatus; label: string }> = [
  {
    value: "DRAFT",
    label: "Draft"
  },
  {
    value: "PUBLISHED",
    label: "Published"
  },
  {
    value: "ARCHIVED",
    label: "Archived"
  }
];

const resourceCategories = [
  "Parent Guidance",
  "Mathematics Support",
  "Reading Support",
  "Exam Preparation",
  "Academic Support"
];

const resourceFormFieldNames = new Set<keyof ResourceFormInput>([
  "title",
  "slug",
  "excerpt",
  "content",
  "category",
  "status"
]);

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-danger">{message}</p> : null;
}

export function ResourceForm({
  mode,
  resourceId,
  initialValues
}: ResourceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const submitStatusRef = useRef<ResourceStatus | null>(null);
  const [result, setResult] = useState<ResourceActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ResourceFormInput>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: buildResourceFormInitialValues(initialValues)
  });

  const handleActionResult = (actionResult: ResourceActionResult) => {
    setResult(actionResult);

    if (!actionResult.success && actionResult.fieldErrors) {
      const entries = Object.entries(actionResult.fieldErrors) as Array<
        [keyof ResourceFormInput, string | undefined]
      >;

      entries.forEach(([field, message]) => {
        if (message && resourceFormFieldNames.has(field)) {
          setError(field, { message });
        }
      });

      return;
    }

    if (actionResult.success && actionResult.data?.resourceId) {
      router.push(`/admin/resources/${actionResult.data.resourceId}`);
      router.refresh();
    }
  };

  const onSubmit = (values: ResourceFormInput) => {
    setResult(null);

    startTransition(async () => {
      const payload = {
        ...values,
        status: submitStatusRef.current ?? values.status
      };
      submitStatusRef.current = null;

      const actionResult =
        mode === "edit"
          ? await updateResourceAction({
              resourceId: resourceId ?? "",
              ...payload
            })
          : await createResourceAction(payload);

      handleActionResult(actionResult);
    });
  };

  const archiveResource = () => {
    const confirmed = window.confirm(
      "Archive this resource? It will no longer appear publicly."
    );

    if (!confirmed || !resourceId) {
      return;
    }

    setResult(null);

    startTransition(async () => {
      const actionResult = await archiveResourceAction({ resourceId });
      handleActionResult(actionResult);
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-xl border border-warm-gold/35 bg-warm-gold/10 p-4 text-sm text-text-secondary">
        <p className="font-medium text-deep-navy">
          Create resources that help parents make clearer learning decisions.
        </p>
        <p className="mt-2">
          Keep the article practical, parent-focused, and trustworthy. Published
          resources appear on the public website; drafts and archived resources
          stay hidden from public readers.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal-blue">
              Editorial Basics
            </p>
            <h2 className="mt-1 text-xl font-semibold text-deep-navy">
              Resource identity
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resource-title">Title</Label>
              <Input
                id="resource-title"
                placeholder="Example: How to support maths confidence at home"
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-slug">Slug</Label>
              <Input
                id="resource-slug"
                placeholder="how-to-support-maths-confidence"
                {...register("slug")}
              />
              <FieldError message={errors.slug?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-category">Category</Label>
              <Input
                id="resource-category"
                list="resource-category-options"
                placeholder="Parent Guidance"
                {...register("category")}
              />
              <datalist id="resource-category-options">
                {resourceCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <FieldError message={errors.category?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-status">Status</Label>
              <select
                id="resource-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("status")}
              >
                {resourceStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.status?.message} />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="resource-excerpt">Excerpt</Label>
            <Textarea
              id="resource-excerpt"
              placeholder="A concise summary parents can scan before reading."
              {...register("excerpt")}
            />
            <FieldError message={errors.excerpt?.message} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-royal-blue">
              Article Content
            </p>
            <h2 className="mt-1 text-xl font-semibold text-deep-navy">
              Parent-facing guidance
            </h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-content">Content</Label>
            <Textarea
              id="resource-content"
              rows={14}
              placeholder="Write clear paragraphs. Separate sections with blank lines for readable public rendering."
              {...register("content")}
            />
            <FieldError message={errors.content?.message} />
          </div>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="submit"
          disabled={isPending}
          onClick={() => {
            submitStatusRef.current = mode === "create" ? "DRAFT" : null;
          }}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {mode === "edit" ? "Save Changes" : "Save Draft"}
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          onClick={() => {
            submitStatusRef.current = "PUBLISHED";
          }}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Publish
        </Button>

        {mode === "edit" ? (
          <Button
            type="button"
            variant="outline"
            onClick={archiveResource}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            Archive
          </Button>
        ) : null}

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin/resources">Back to Resources</Link>
        </Button>
      </div>
    </form>
  );
}
