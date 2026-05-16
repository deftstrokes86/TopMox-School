import { revalidatePath } from "next/cache";
import type { CommunicationLogType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { COMMUNICATION_LOG_TYPES } from "@/lib/validations/communication-log.schema";
import {
  getCommunicationLogTypeMeta,
  type CommunicationLogTargetInput
} from "@/lib/utils/communication-log-ui";
import { createCommunicationLogAction } from "@/server/actions/communication-log.actions";

type CommunicationLogPanelLog = {
  id: string;
  type: CommunicationLogType;
  message: string;
  createdAt: Date;
  createdBy?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

type CommunicationLogPanelProps = {
  title?: string;
  description?: string;
  logs: CommunicationLogPanelLog[];
  targetInput: CommunicationLogTargetInput;
  revalidatePathname: string;
};

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function buildPayloadFromFormData(
  formData: FormData,
  targetInput: CommunicationLogTargetInput
) {
  return {
    type: formData.get("type") as CommunicationLogType,
    message: String(formData.get("message") ?? ""),
    ...targetInput
  };
}

export function CommunicationLogPanel({
  title = "Communication Logs",
  description = "Record internal operational context for TopMox follow-up.",
  logs,
  targetInput,
  revalidatePathname
}: CommunicationLogPanelProps) {
  async function addCommunicationLog(formData: FormData) {
    "use server";

    const result = await createCommunicationLogAction(
      buildPayloadFromFormData(formData, targetInput)
    );

    if (result.success) {
      revalidatePath(revalidatePathname);
    }
  }

  return (
    <Card className="border-royal-blue/20">
      <CardHeader>
        <CardTitle className="text-xl text-deep-navy">{title}</CardTitle>
        <p className="text-sm text-text-secondary">{description}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => {
              const meta = getCommunicationLogTypeMeta(log.type);

              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-border/80 bg-soft-cream/40 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <StatusBadge label={meta.label} tone={meta.tone} />
                    <p className="text-xs text-text-muted">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {log.message}
                  </p>
                  <p className="mt-2 text-xs text-text-muted">
                    Added by{" "}
                    {log.createdBy?.name ||
                      log.createdBy?.email ||
                      "TopMox admin"}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-soft-cream/40 p-5 text-sm text-text-secondary">
              No communication logs yet. Add a note after a call, WhatsApp
              exchange, email, payment follow-up, or academic follow-up.
            </p>
          )}
        </div>

        <form action={addCommunicationLog} className="space-y-4 rounded-xl border border-border/80 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-[0.55fr_1fr]">
            <label className="space-y-2">
              <Label htmlFor="communication-log-type">Log type</Label>
              <select
                id="communication-log-type"
                name="type"
                defaultValue="INTERNAL_NOTE"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {COMMUNICATION_LOG_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getCommunicationLogTypeMeta(type).label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <Label htmlFor="communication-log-message">Message</Label>
              <Textarea
                id="communication-log-message"
                name="message"
                required
                placeholder="Record what happened, who was contacted, and the next operational step."
              />
            </label>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Add Communication Log
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
