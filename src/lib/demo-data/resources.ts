export type ResourceSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ResourceArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Parent Guidance" | "Mathematics Support" | "Reading Support" | "Exam Preparation";
  intro: string;
  sections: ResourceSection[];
};

const resources: ResourceArticle[] = [
  {
    slug: "how-online-tutoring-works-at-topmox",
    title: "How online tutoring works at TopMox",
    excerpt:
      "A parent-friendly guide to the TopMox process from child assessment to structured lessons and progress visibility.",
    category: "Parent Guidance",
    intro:
      "Many parents want tutoring support but are unsure what a structured process should look like. TopMox Global Tutoring is designed to help families move from uncertainty to a clear support pathway.",
    sections: [
      {
        heading: "Why we begin with assessment",
        paragraphs: [
          "Children can show the same academic symptoms for very different reasons. One child may need foundational reinforcement, while another needs study-discipline support or exam strategy.",
          "Assessment helps TopMox identify likely support priorities before recommending a tutoring pathway."
        ],
        bullets: [
          "Reduces guesswork before lessons begin",
          "Helps parents understand likely root challenges",
          "Improves confidence in plan selection"
        ]
      },
      {
        heading: "What happens after assessment",
        paragraphs: [
          "After reviewing a child profile and assessment context, TopMox recommends a support direction designed around learning needs and practical schedule fit.",
          "From there, sessions are coordinated with a tutor and delivered through a structured lesson rhythm."
        ],
        bullets: [
          "Learning recommendation",
          "Tutor support coordination",
          "Consistent lesson schedule"
        ]
      },
      {
        heading: "How parents stay informed",
        paragraphs: [
          "Parent visibility is a core part of the TopMox model. Families are not left to wonder whether lessons are helping.",
          "You can expect structured updates across lessons, homework, attendance, and progress reporting."
        ],
        bullets: [
          "Lesson context and tutor notes",
          "Homework follow-through visibility",
          "Progress reporting designed to support better home decisions"
        ]
      }
    ]
  },
  {
    slug: "how-to-help-your-child-improve-in-mathematics",
    title: "How to help your child improve in Mathematics",
    excerpt:
      "Practical ways parents can support maths confidence while working with structured tutoring.",
    category: "Mathematics Support",
    intro:
      "Maths struggles can feel overwhelming for children and parents. The goal is not pressure. The goal is structured support that builds understanding, confidence, and consistency over time.",
    sections: [
      {
        heading: "Focus on understanding before speed",
        paragraphs: [
          "Children often rush to answers without understanding the steps. This creates repeated mistakes and confidence loss.",
          "A stronger approach is to slow down and reinforce how and why each step works."
        ],
        bullets: [
          "Ask your child to explain the method, not just the answer",
          "Review one concept at a time",
          "Encourage correction as part of learning, not failure"
        ]
      },
      {
        heading: "Use a consistent practice rhythm",
        paragraphs: [
          "Progress improves when practice is regular and manageable. Short, focused practice windows often work better than irregular long sessions.",
          "Tutoring support is most effective when home routines align with lesson goals."
        ],
        bullets: [
          "Set a fixed weekly maths practice routine",
          "Track homework completion and weak-topic patterns",
          "Celebrate consistency, not only test scores"
        ]
      },
      {
        heading: "Partner with structured tutoring",
        paragraphs: [
          "Parents do not need to carry maths support alone. A tutor can provide explanation clarity, correction loops, and a practical improvement path.",
          "TopMox lessons are structured to help identify gaps and strengthen confidence through guided progress."
        ]
      }
    ]
  },
  {
    slug: "reading-habits-for-primary-school-children",
    title: "Reading habits for primary school children",
    excerpt:
      "Simple reading routines that help children improve fluency, vocabulary, and comprehension confidence.",
    category: "Reading Support",
    intro:
      "Reading confidence grows from routine and encouragement. Parents do not need complicated methods to help; they need consistency and practical structure.",
    sections: [
      {
        heading: "Create a predictable reading routine",
        paragraphs: [
          "Children are more likely to read consistently when reading time is expected and calm.",
          "Even short daily reading windows can improve fluency and comfort over time."
        ],
        bullets: [
          "Set a fixed reading time most days of the week",
          "Choose age-appropriate and interesting texts",
          "Keep sessions short enough to avoid burnout"
        ]
      },
      {
        heading: "Build comprehension through conversation",
        paragraphs: [
          "Comprehension improves when children discuss what they read instead of only reading aloud.",
          "Ask simple questions about the story, meaning, and characters to strengthen recall and inference."
        ],
        bullets: [
          "What happened first, and why?",
          "What do you think this word means in this sentence?",
          "How would you describe this chapter in your own words?"
        ]
      },
      {
        heading: "Support confidence, not perfection",
        paragraphs: [
          "Children who fear making mistakes often avoid reading. Encourage progress, curiosity, and effort.",
          "Structured tutor support can reinforce reading strategy and help parents stay aligned with learning goals."
        ]
      }
    ]
  },
  {
    slug: "preparing-your-child-for-exam-success",
    title: "Preparing your child for exam success",
    excerpt:
      "How to build calm, structured exam preparation without last-minute panic.",
    category: "Exam Preparation",
    intro:
      "Exam confidence is usually the result of planning, consistency, and guided support. Parents can help children prepare better by shifting from emergency revision to structured preparation.",
    sections: [
      {
        heading: "Start preparation early with a clear plan",
        paragraphs: [
          "Last-minute revision increases stress and reduces retention. A week-by-week plan is more effective than random cramming.",
          "Assessment-first support helps identify where preparation should focus first."
        ],
        bullets: [
          "Break topics into manageable weekly priorities",
          "Focus on high-impact weak areas early",
          "Track completed topics visibly"
        ]
      },
      {
        heading: "Build exam discipline and pacing",
        paragraphs: [
          "Many learners understand content but struggle with timing and structured responses in exams.",
          "Practice under timed conditions helps children improve pacing and decision-making confidence."
        ],
        bullets: [
          "Introduce timed practice windows",
          "Review common mistakes and correction patterns",
          "Teach answer-structure habits for longer questions"
        ]
      },
      {
        heading: "Use accountability and visibility",
        paragraphs: [
          "Parents and tutors should work from the same preparation direction. Structured communication reduces uncertainty and keeps support focused.",
          "TopMox exam-prep support is designed to help families track preparation rhythm and confidence signals."
        ]
      }
    ]
  }
];

export function getAllResources(): ResourceArticle[] {
  return resources;
}

export function getResourceBySlug(slug: string): ResourceArticle | undefined {
  return resources.find((resource) => resource.slug === slug);
}

export function getRelatedResources(
  slug: string,
  limit = 3
): ResourceArticle[] {
  const current = getResourceBySlug(slug);

  if (!current) {
    return resources.slice(0, limit);
  }

  const sameCategory = resources.filter(
    (resource) => resource.slug !== slug && resource.category === current.category
  );
  const otherResources = resources.filter(
    (resource) => resource.slug !== slug && resource.category !== current.category
  );

  return [...sameCategory, ...otherResources].slice(0, limit);
}
