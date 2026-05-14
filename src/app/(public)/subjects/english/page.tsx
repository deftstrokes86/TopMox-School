import type { Metadata } from "next";

import { SubjectPageTemplate } from "@/components/marketing/SubjectPageTemplate";

export default function EnglishSubjectPage() {
  return (
    <SubjectPageTemplate
      heroBadge="English Support"
      heroTitle="English support structured to help children communicate with confidence"
      heroDescription="TopMox English tutoring is designed to support reading, grammar, writing clarity, and comprehension through consistent guided practice."
      struggles={[
        {
          title: "Weak grammar control",
          description:
            "Students may understand ideas but struggle to express them with correct sentence structure."
        },
        {
          title: "Limited writing confidence",
          description:
            "Children can find it difficult to organize thoughts into clear paragraphs and arguments."
        },
        {
          title: "Reading comprehension gaps",
          description:
            "Learners may read text but miss key meaning, inference, or vocabulary context."
        }
      ]}
      approachPoints={[
        "Assessment helps identify whether the priority is grammar, reading, writing, or a combination.",
        "Tutors structure lessons around targeted language support and guided correction.",
        "Practice routines are built to support both school performance and communication confidence.",
        "Parents get clear updates to understand where improvement is happening."
      ]}
      lessonCoverage={[
        "Grammar and sentence structure reinforcement",
        "Reading fluency and comprehension strategies",
        "Vocabulary building and usage confidence",
        "Paragraph and essay writing structure",
        "Critical reading and response skills",
        "Homework support and correction feedback"
      ]}
      outcomes={[
        {
          title: "Clearer writing",
          description:
            "Support is focused on improving sentence control, structure, and expression."
        },
        {
          title: "Stronger comprehension",
          description:
            "Children are designed to improve understanding, recall, and inference in reading tasks."
        },
        {
          title: "More confidence in communication",
          description:
            "Learners can become more comfortable expressing ideas in classwork and assessments."
        }
      ]}
      recommendedPlans={[
        {
          title: "Starter Support",
          description:
            "Good fit for children needing consistency in reading and grammar fundamentals."
        },
        {
          title: "Growth Plan",
          description:
            "Designed for learners who need stronger weekly writing and comprehension development."
        },
        {
          title: "Homework Club",
          description:
            "Useful for children who need regular assignment support and accountability."
        }
      ]}
      parentVisibility={[
        "Reading tasks covered",
        "Writing homework tracking",
        "Tutor communication notes",
        "Attendance consistency",
        "Progress reports"
      ]}
      ctaTitle="Start with an English assessment."
      ctaDescription="Book a child assessment to understand where language support is needed and start with a structured plan."
    />
  );
}

export const metadata: Metadata = {
  title: "English Tutoring | TopMox Global Tutoring",
  description:
    "Structured English support for grammar, writing, reading, and comprehension. Begin with a child assessment."
};
