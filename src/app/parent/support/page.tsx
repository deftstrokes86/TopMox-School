import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy, Send } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupportStatusMeta } from "@/lib/utils/support-ui";
import { createSupportRequestAction } from "@/server/actions/support.actions";
import { getCurrentParentSupportRequests } from "@/server/queries/support.queries";

export const dynamic = "force-dynamic";

type ParentSupportItem = Awaited<
  ReturnType<typeof getCurrentParentSupportRequests>
>[number];

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

async function createSupportRequest(formData: FormData) {
  "use server";

  const result = await createSupportRequestAction({
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? "")
  });

  if (result.success && result.data?.supportRequestId) {
    redirect(`/parent/support/${result.data.supportRequestId}?created=1`);
  }
}

function SupportRequestCard({ supportRequest }: { supportRequest: ParentSupportItem }) {
  const status = getSupportStatusMeta(supportRequest.status);

  return (
    <Card className="border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-deep-navy">
              {supportRequest.subject}
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Created {formatDate(supportRequest.createdAt)}
            </p>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
          {supportRequest.message}
        </p>
        {supportRequest.adminReply ? (
          <p className="rounded-xl border border-royal-blue/20 bg-soft-blue/20 p-4 text-sm text-text-secondary">
            Latest TopMox reply: {supportRequest.adminReply}
          </p>
        ) : (
          <p className="rounded-xl border border-border/80 bg-soft-cream/40 p-4 text-sm text-text-secondary">
            TopMox will update this request when there is a clear next step.
          </p>
        )}
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/parent/support/${supportRequest.id}`}>
            View Request
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function ParentSupportPage() {
  const supportRequests = await getCurrentParentSupportRequests();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Support"
        description="Ask TopMox for help with assessments, payments, lessons, homework, or your child's tutoring journey."
      />

      <Card className="border-royal-blue/20 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-deep-navy">
            <LifeBuoy className="h-5 w-5 text-royal-blue" />
            Create a Support Request
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Share what you need help with. TopMox will review and update the
            request status from the admin workspace.
          </p>
        </CardHeader>
        <CardContent>
          <form action={createSupportRequest} className="grid gap-4">
            <label className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <input
                id="support-subject"
                name="subject"
                required
                placeholder="Example: Payment question, lesson timing, assessment follow-up"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                name="message"
                required
                placeholder="Tell TopMox what happened and what help you need."
              />
            </label>

            <Button type="submit" className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              Submit Support Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {supportRequests.length === 0 ? (
        <EmptyState
          title="No support requests yet"
          description="When you create a support request, TopMox updates and replies will appear here."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {supportRequests.map((supportRequest) => (
            <SupportRequestCard
              key={supportRequest.id}
              supportRequest={supportRequest}
            />
          ))}
        </div>
      )}
    </section>
  );
}
