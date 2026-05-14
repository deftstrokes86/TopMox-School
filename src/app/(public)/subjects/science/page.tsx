import type { Metadata } from "next";

import { SubjectPageTemplate } from "@/components/marketing/SubjectPageTemplate";

export default function ScienceSubjectPage() {
  return (
    <SubjectPageTemplate
      heroBadge="Science Support"
      heroTitle="Science support built to strengthen understanding and exam confidence"
      heroDescription="TopMox Science tutoring is structured to help learners move beyond memorization by improving concept clarity, explanation skills, and practical application."
      struggles={[
        {
          title: "Memorization without understanding",
          description:
            "Students may remember definitions but struggle to apply concepts to real questions."
        },
        {
          title: "Weak confidence in explanations",
          description:
            "Learners can find it difficult to explain scientific ideas clearly in classwork or exams."
        },
        {
          title: "Exam uncertainty",
          description:
            "Children may struggle with pacing, interpretation, and structured answers in test settings."
        }
      ]}
      approachPoints={[
        "Assessment helps identify conceptual gaps and confidence barriers.",
        "Tutors focus on explanation, guided application, and correction loops.",
        "Lessons are designed to support understanding before speed.",
        "Parents stay informed with visibility into lesson focus and progress direction."
      ]}
      lessonCoverage={[
        "Core concept explanation and reinforcement",
        "Application-based question practice",
        "Scientific vocabulary and clarity of expression",
        "Structured answer writing for exams",
        "Topic revision routines and retention habits",
        "Homework review and misconception correction"
      ]}
      outcomes={[
        {
          title: "Improved concept understanding",
          description:
            "Children are structured to help explain what they learn with better clarity and confidence."
        },
        {
          title: "Better application skills",
          description:
            "Support is focused on improving how learners apply concepts to unfamiliar questions."
        },
        {
          title: "More exam confidence",
          description:
            "Practice routines are designed to help students prepare with structure and less panic."
        }
      ]}
      recommendedPlans={[
        {
          title: "Starter Support",
          description:
            "Helpful for learners needing foundational topic consistency and guided explanation."
        },
        {
          title: "Growth Plan",
          description:
            "Designed for children needing stronger weekly concept reinforcement and accountability."
        },
        {
          title: "Exam Prep Intensive",
          description:
            "For students preparing for high-stakes assessments with focused strategy support."
        }
      ]}
      parentVisibility={[
        "Topic progress tracking",
        "Application practice updates",
        "Tutor notes on concept mastery",
        "Attendance and lesson rhythm",
        "Monthly progress reporting"
      ]}
      ctaTitle="Start with a science assessment."
      ctaDescription="Book a child assessment to identify science support priorities and begin with a clear improvement path."
    />
  );
}

export const metadata: Metadata = {
  title: "Science Tutoring | TopMox Global Tutoring",
  description:
    "Science tutoring designed to support concept understanding, practical application, and exam confidence. Begin with a child assessment."
};
