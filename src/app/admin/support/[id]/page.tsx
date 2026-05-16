import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { SupportStatus } from "@prisma/client";

import { CommunicationLogPanel } from "@/components/admin/CommunicationLogPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  buildAdminSupportStatusOptions,
  getSupportStatusMeta
} from "@/lib/utils/support-ui";
import { updateSupportRequestAction } from "@/server/actions/support.actions";
import { getCommunicationLogsForSupportRequest } from "@/server/queries/communication-log.queries";
import { getAdminSupportRequestById } from "@/server/queries/support.queries";

export const dynamic = "force-dynamic";

type AdminSupportDetailPageProps = {
  params: {
    id: string;
  };
};

function formatDate(value: Date | null): string {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function DetailItem({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-soft-cream/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-text-primary">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function AdminSupportDetailPage({
  params
}: AdminSupportDetailPageProps) {
  const [supportRequest, communicationLogs] = await Promise.all([
    getAdminSupportRequestById(params.id),
    getCommunicationLogsForSupportRequest(params.id)
  ]);

  if (!supportRequest) {
    notFound();
  }

  const status = getSupportStatusMeta(supportRequest.status);
  const nextStatuses = buildAdminSupportStatusOptions(supportRequest.status);

  async function updateSupportRequest(formData: FormData) {
    "use server";

    const result = await updateSupportRequestAction({
      supportRequestId: params.id,
      status: String(formData.get("status") ?? "") as SupportStatus,
      adminReply: String(formData.get("adminReply") ?? "")
    });

    if (result.success) {
      revalidatePath(`/admin/support/${params.id}`);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Support Request Details"
        description="Review the parent message, reply with clarity, update status, and record internal communication history."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/support">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support
            </Link>
          </Button>
        }
      />

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl text-deep-navy">
              {supportRequest.subject}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Parent: {supportRequest.parent.user.name} | Created{" "}
              {formatDate(supportRequest.createdAt)}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem label="Parent email" value={supportRequest.parent.user.email} />
            <DetailItem label="WhatsApp" value={supportRequest.parent.whatsappNumber} />
            <DetailItem label="Timezone" value={supportRequest.parent.timezone} />
            <DetailItem label="Child" value={supportRequest.student?.fullName} />
            <DetailItem label="Lesson" value={supportRequest.lesson?.title} />
            <DetailItem
              label="Payment"
              value={
                supportRequest.payment
                  ? `${supportRequest.payment.currency} ${supportRequest.payment.amount.toString()}`
                  : null
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Parent message
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {supportRequest.message}
              </p>
            </div>
            <div className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Admin guidance
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {status.adminDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {supportRequest.assessmentRequest ? (
              <Button asChild variant="outline">
                <Link href={`/admin/assessments/${supportRequest.assessmentRequest.id}`}>
                  Linked Assessment
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            {supportRequest.payment ? (
              <Button asChild variant="outline">
                <Link href={`/admin/payments/${supportRequest.payment.id}`}>
                  Linked Payment
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            {supportRequest.lesson ? (
              <Button asChild variant="outline">
                <Link href={`/admin/lessons/${supportRequest.lesson.id}`}>
                  Linked Lesson
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl text-deep-navy">
              Reply and Status
            </CardTitle>
            <p className="text-sm text-text-secondary">
              Parent-visible reply and workflow status. Internal details belong
              in communication logs.
            </p>
          </CardHeader>
          <CardContent>
            <form action={updateSupportRequest} className="space-y-4">
              <label className="space-y-2">
                <Label htmlFor="support-status">Status</Label>
                <select
                  id="support-status"
                  name="status"
                  defaultValue={supportRequest.status}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={supportRequest.status}>
                    Keep as {status.label}
                  </option>
                  {nextStatuses.map((nextStatus) => (
                    <option key={nextStatus} value={nextStatus}>
                      Move to {getSupportStatusMeta(nextStatus).label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <Label htmlFor="admin-reply">Admin reply</Label>
                <Textarea
                  id="admin-reply"
                  name="adminReply"
                  defaultValue={supportRequest.adminReply ?? ""}
                  placeholder="Write the parent-visible response or next step."
                />
              </label>

              <Button type="submit" className="w-full sm:w-auto">
                Save Support Update
              </Button>
            </form>
          </CardContent>
        </Card>

        <CommunicationLogPanel
          logs={communicationLogs}
          targetInput={{
            supportRequestId: supportRequest.id,
            parentId: supportRequest.parentId,
            ...(supportRequest.studentId
              ? { studentId: supportRequest.studentId }
              : {})
          }}
          revalidatePathname={`/admin/support/${supportRequest.id}`}
        />
      </div>
    </section>
  );
}
