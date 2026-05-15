import type { StatusTone } from "@/lib/constants/statuses";
import { ASSESSMENT_STATUSES } from "@/lib/constants/statuses";

export type AssessmentStatusValue = (typeof ASSESSMENT_STATUSES)[number];

export type AssessmentStatusMeta = {
  label: string;
  tone: StatusTone;
  parentDescription: string;
};

export type ParentAssessmentAction = {
  label: string;
  href: string;
  description: string;
};

const ASSESSMENT_STATUS_META: Record<
  AssessmentStatusValue,
  AssessmentStatusMeta
> = {
  PENDING_REVIEW: {
    label: "Pending review",
    tone: "warning",
    parentDescription:
      "TopMox has received the request and will review your child's details."
  },
  SCHEDULED: {
    label: "Scheduled",
    tone: "info",
    parentDescription:
      "Your child assessment has been scheduled. Review the time and meeting details."
  },
  COMPLETED: {
    label: "Completed",
    tone: "success",
    parentDescription:
      "The assessment is complete. TopMox will prepare the academic recommendation next."
  },
  PLAN_RECOMMENDED: {
    label: "Plan recommended",
    tone: "success",
    parentDescription:
      "TopMox has prepared a recommended tutoring path for your child."
  },
  CONVERTED: {
    label: "Converted",
    tone: "success",
    parentDescription:
      "This assessment has moved into the tutoring enrollment journey."
  },
  DECLINED: {
    label: "Declined",
    tone: "danger",
    parentDescription:
      "This assessment request is no longer moving forward. Contact TopMox if you need help."
  }
};

export function getAssessmentStatusMeta(
  status: AssessmentStatusValue
): AssessmentStatusMeta {
  return ASSESSMENT_STATUS_META[status];
}

export function getParentAssessmentNextAction(
  status: AssessmentStatusValue,
  assessmentId: string
): ParentAssessmentAction {
  const detailHref = `/parent/assessments/${assessmentId}`;

  switch (status) {
    case "PENDING_REVIEW":
      return {
        label: "Await TopMox Review",
        href: detailHref,
        description:
          "TopMox is reviewing your child's details and will confirm the next step."
      };
    case "SCHEDULED":
      return {
        label: "View Assessment Details",
        href: detailHref,
        description:
          "Check the scheduled assessment time and meeting details."
      };
    case "COMPLETED":
      return {
        label: "Await Recommendation",
        href: detailHref,
        description:
          "TopMox is preparing the learning recommendation from the assessment."
      };
    case "PLAN_RECOMMENDED":
      return {
        label: "View Learning Recommendation",
        href: detailHref,
        description:
          "Review the recommended tutoring path. Plan acceptance comes in a later phase."
      };
    case "CONVERTED":
      return {
        label: "View Assessment Details",
        href: detailHref,
        description:
          "This assessment has already moved forward into the tutoring journey."
      };
    case "DECLINED":
      return {
        label: "View Assessment Details",
        href: detailHref,
        description:
          "Review the request status or contact TopMox for clarification."
      };
  }
}
