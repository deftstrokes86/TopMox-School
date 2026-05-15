import type { StatusTone } from "@/lib/constants/statuses";
import { LESSON_STATUSES } from "@/lib/constants/statuses";

export type LessonStatusValue = (typeof LESSON_STATUSES)[number];

export type LessonStatusMeta = {
  label: string;
  tone: StatusTone;
};

const LESSON_STATUS_META: Record<LessonStatusValue, LessonStatusMeta> = {
  SCHEDULED: {
    label: "Scheduled",
    tone: "info"
  },
  COMPLETED: {
    label: "Completed",
    tone: "success"
  },
  MISSED: {
    label: "Missed",
    tone: "warning"
  },
  RESCHEDULED: {
    label: "Rescheduled",
    tone: "warning"
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "danger"
  }
};

export function getLessonStatusMeta(
  status: LessonStatusValue
): LessonStatusMeta {
  return LESSON_STATUS_META[status];
}
