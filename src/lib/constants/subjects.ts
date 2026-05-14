export type SupportSubjectOption = {
  slug: string;
  name: string;
  description: string;
};

export const SUPPORT_SUBJECT_OPTIONS: SupportSubjectOption[] = [
  {
    slug: "mathematics",
    name: "Mathematics",
    description:
      "Numeracy, problem-solving, confidence with classwork and exam questions."
  },
  {
    slug: "english",
    name: "English",
    description:
      "Reading, grammar, writing clarity, and communication confidence."
  },
  {
    slug: "science",
    name: "Science",
    description:
      "Concept understanding, applied reasoning, and exam-oriented support."
  },
  {
    slug: "reading-comprehension",
    name: "Reading & Comprehension",
    description:
      "Fluency, vocabulary growth, and stronger comprehension strategies."
  },
  {
    slug: "exam-preparation",
    name: "Exam Preparation",
    description:
      "Structured revision, timed practice, and exam confidence support."
  },
  {
    slug: "homework-support",
    name: "Homework Support",
    description:
      "Routine homework guidance, accountability, and consistency building."
  }
];

export const PREFERRED_LESSON_DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;
