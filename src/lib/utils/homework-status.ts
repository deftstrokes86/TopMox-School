import type { HomeworkStatus } from "@prisma/client";

import type { StatusTone } from "@/lib/constants/statuses";

export type HomeworkStatusMeta = {
  label: string;
  tone: StatusTone;
};

const HOMEWORK_STATUS_META: Record<HomeworkStatus, HomeworkStatusMeta> = {
  ASSIGNED: {
    label: "Assigned",
    tone: "info"
  },
  SUBMITTED: {
    label: "Submitted",
    tone: "warning"
  },
  REVIEWED: {
    label: "Reviewed",
    tone: "success"
  },
  OVERDUE: {
    label: "Overdue",
    tone: "danger"
  }
};

export function getHomeworkStatusMeta(
  status: HomeworkStatus
): HomeworkStatusMeta {
  return HOMEWORK_STATUS_META[status];
}
