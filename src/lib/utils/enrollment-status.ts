import type { StatusTone } from "@/lib/constants/statuses";
import { ENROLLMENT_STATUSES } from "@/lib/constants/statuses";

export type EnrollmentStatusValue = (typeof ENROLLMENT_STATUSES)[number];

export type EnrollmentStatusMeta = {
  label: string;
  tone: StatusTone;
  parentDescription: string;
};

const ENROLLMENT_STATUS_META: Record<
  EnrollmentStatusValue,
  EnrollmentStatusMeta
> = {
  PENDING_PAYMENT: {
    label: "Pending payment",
    tone: "warning",
    parentDescription:
      "Submit payment details so TopMox can verify and activate this tutoring plan."
  },
  ACTIVE: {
    label: "Active",
    tone: "success",
    parentDescription:
      "This tutoring plan is active. Lessons will appear after scheduling."
  },
  PAUSED: {
    label: "Paused",
    tone: "warning",
    parentDescription:
      "This tutoring plan is paused. Contact TopMox for the next step."
  },
  COMPLETED: {
    label: "Completed",
    tone: "success",
    parentDescription: "This tutoring plan has been completed."
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "danger",
    parentDescription: "This tutoring plan is no longer active."
  }
};

export function getEnrollmentStatusMeta(
  status: EnrollmentStatusValue
): EnrollmentStatusMeta {
  return ENROLLMENT_STATUS_META[status];
}
