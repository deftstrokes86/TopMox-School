import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSupportStatusMeta,
  shapeParentSupportRequestDetail
} from "@/lib/utils/support-ui";
import { getCurrentParentSupportRequestById } from "@/server/queries/support.queries";

export const dynamic = "force-dynamic";

type ParentSupportDetailPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    created?: string;
  };
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function DetailBlock({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-soft-cream/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{value}</p>
    </div>
  );
}

export default async function ParentSupportDetailPage({
  params,
  searchParams
}: ParentSupportDetailPageProps) {
  const supportRequest = await getCurrentParentSupportRequestById(params.id);

  if (!supportRequest) {
    notFound();
  }

  const parentView = shapeParentSupportRequestDetail(supportRequest);
  const status = getSupportStatusMeta(parentView.status);

  return (
    <section className="space-y-6">
      <PageHeader
        title={parentView.subject}
        description="Follow the current status and TopMox reply for this support request."
        actions={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/parent/support">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support
            </Link>
          </Button>
        }
      />

      {searchParams?.created === "1" ? (
        <Card className="border-success/25 bg-success/10">
          <CardContent className="p-5">
            <p className="font-semibold text-deep-navy">
              Your support request has been submitted.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              TopMox will review it and update this page when there is a clear
              next step.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl text-deep-navy">
              Request Details
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Created {formatDate(parentView.createdAt)} | Last updated{" "}
              {formatDate(parentView.updatedAt)}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4 text-sm text-text-secondary">
            {status.parentDescription}
          </p>
          <DetailBlock label="Your Message" value={parentView.message} />
          <DetailBlock
            label="TopMox Reply"
            value={
              parentView.adminReply ||
              "No admin reply has been added yet. TopMox will update this request after review."
            }
          />
        </CardContent>
      </Card>
    </section>
  );
}
