import type { Metadata } from "next";

import { SubjectPageTemplate } from "@/components/marketing/SubjectPageTemplate";

export default function MathematicsSubjectPage() {
  return (
    <SubjectPageTemplate
      heroBadge="Mathematics Support"
      heroTitle="Mathematics support designed to turn confusion into confidence"
      heroDescription="TopMox Mathematics tutoring is structured to help identify learning gaps, strengthen problem solving habits, and build academic momentum through consistent support."
      struggles={[
        {
          title: "Foundational gaps",
          description:
            "Children may struggle with core numeracy concepts that affect more advanced topics."
        },
        {
          title: "Word problem anxiety",
          description:
            "Students often know steps but lose confidence when problems become multi-layered."
        },
        {
          title: "Low confidence under pressure",
          description:
            "Tests can expose weak pacing, hesitation, and poor strategy even when understanding exists."
        }
      ]}
      approachPoints={[
        "Assessment is used to understand where the learner is struggling and why.",
        "Lessons are structured to help rebuild fundamentals before increasing complexity.",
        "Tutors focus on clear explanations, guided practice, and consistent feedback.",
        "Parents receive visibility so support at home can align with lesson goals."
      ]}
      lessonCoverage={[
        "Number sense, arithmetic fluency, and operations",
        "Fractions, ratios, and proportional reasoning",
        "Algebra foundations and equation practice",
        "Word problems and multi-step problem solving",
        "Timed practice and exam confidence habits",
        "Homework correction and error analysis routines"
      ]}
      outcomes={[
        {
          title: "Clearer understanding",
          description:
            "Learners are designed to build stronger conceptual understanding rather than memorizing procedures."
        },
        {
          title: "Better confidence",
          description:
            "Support is focused on helping children approach problem solving with less fear and more structure."
        },
        {
          title: "More consistent rhythm",
          description:
            "Regular tutoring and homework follow-through are structured to help improve study discipline."
        }
      ]}
      recommendedPlans={[
        {
          title: "Starter Support",
          description:
            "Suitable for children who need steady reinforcement and consistency in core maths skills."
        },
        {
          title: "Growth Plan",
          description:
            "Designed for learners who need stronger weekly momentum and deeper intervention."
        },
        {
          title: "Exam Prep Intensive",
          description:
            "For students who need focused support on exam pacing, accuracy, and confidence."
        }
      ]}
      parentVisibility={[
        "Upcoming maths lessons",
        "Homework progress",
        "Tutor notes",
        "Attendance updates",
        "Progress reports"
      ]}
      ctaTitle="Start with a mathematics assessment."
      ctaDescription="Book a child assessment to identify the right mathematics support path and begin with clear direction."
    />
  );
}

export const metadata: Metadata = {
  title: "Mathematics Tutoring | TopMox Global Tutoring",
  description:
    "Structured mathematics support focused on confidence, clarity, and consistent progress. Start with a child assessment."
};
