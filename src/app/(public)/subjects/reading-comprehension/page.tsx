import type { Metadata } from "next";

import { SubjectPageTemplate } from "@/components/marketing/SubjectPageTemplate";

export default function ReadingComprehensionSubjectPage() {
  return (
    <SubjectPageTemplate
      heroBadge="Reading & Comprehension Support"
      heroTitle="Reading support designed to improve fluency, understanding, and confidence"
      heroDescription="TopMox Reading & Comprehension tutoring is structured to help learners strengthen vocabulary, reading fluency, and understanding habits while supporting families at home."
      struggles={[
        {
          title: "Slow reading fluency",
          description:
            "Children may read slowly and lose meaning before completing a passage."
        },
        {
          title: "Weak vocabulary depth",
          description:
            "Limited vocabulary can reduce understanding and confidence in school tasks."
        },
        {
          title: "Low comprehension confidence",
          description:
            "Students may avoid reading tasks because they are unsure how to interpret text effectively."
        }
      ]}
      approachPoints={[
        "Assessment helps identify whether fluency, vocabulary, or comprehension strategy needs priority support.",
        "Tutors structure reading sessions to build confidence through guided text engagement.",
        "Lessons are designed to support both school reading demands and independent learning habits.",
        "Parents receive practical visibility to support reading routines at home."
      ]}
      lessonCoverage={[
        "Reading fluency exercises and pacing",
        "Vocabulary expansion and usage practice",
        "Comprehension strategies and inference support",
        "Confidence building through guided reading",
        "Structured response and summary techniques",
        "Homework reading routines with tutor feedback"
      ]}
      outcomes={[
        {
          title: "Improved fluency",
          description:
            "Support is focused on helping learners read with better pace and confidence."
        },
        {
          title: "Stronger comprehension habits",
          description:
            "Children are structured to improve understanding, interpretation, and recall."
        },
        {
          title: "Better home learning rhythm",
          description:
            "Parents gain practical direction for consistent reading support outside lessons."
        }
      ]}
      recommendedPlans={[
        {
          title: "Starter Support",
          description:
            "Best for children who need steady fluency and comprehension reinforcement."
        },
        {
          title: "Growth Plan",
          description:
            "Suitable when deeper reading intervention and stronger weekly momentum are needed."
        },
        {
          title: "Homework Club",
          description:
            "Useful for maintaining consistency in reading assignments and follow-through."
        }
      ]}
      parentVisibility={[
        "Reading fluency updates",
        "Vocabulary focus areas",
        "Tutor guidance notes",
        "Homework consistency",
        "Progress visibility reports"
      ]}
      ctaTitle="Start with a reading assessment."
      ctaDescription="Book a child assessment to understand your child's reading needs and begin with a structured support path."
    />
  );
}

export const metadata: Metadata = {
  title: "Reading & Comprehension | TopMox Global Tutoring",
  description:
    "Reading and comprehension tutoring focused on fluency, vocabulary, confidence, and parent-supported learning routines."
};
