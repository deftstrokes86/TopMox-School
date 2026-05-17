export const REQUIRED_RESOURCE_TITLES = [
  "How online tutoring works at TopMox",
  "How to help your child improve in Mathematics",
  "Reading habits for primary school children",
  "Preparing your child for exam success"
] as const;

export type DefaultResource = {
  title: (typeof REQUIRED_RESOURCE_TITLES)[number];
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: "PUBLISHED";
};

export const DEFAULT_RESOURCES: DefaultResource[] = [
  {
    title: "How online tutoring works at TopMox",
    slug: "how-online-tutoring-works-at-topmox",
    excerpt:
      "A parent-friendly guide to how TopMox moves from child assessment to structured online tutoring and visible progress updates.",
    category: "Parent Guidance",
    status: "PUBLISHED",
    content: `Many parents know their child needs support, but the next step can feel unclear. TopMox Global Tutoring is designed to reduce that uncertainty. The process starts by understanding the child before recommending lessons, because two children can struggle in the same subject for very different reasons.

The first step is a child assessment request. Parents share the child's class or year group, curriculum, subjects needing support, main academic challenge, academic goal, and preferred lesson times. This gives TopMox enough context to prepare a better assessment conversation and avoid guessing from a single symptom.

After the assessment details are reviewed, TopMox recommends a learning direction that fits the child. The recommendation may focus on foundational gaps, confidence, homework structure, exam preparation, reading fluency, or a mix of needs. The aim is not to overpromise. The aim is to choose a sensible, structured support path.

Once a parent accepts a plan and payment is verified, TopMox can activate tutoring, assign a tutor, and schedule lessons. Parents then get visibility through lesson details, homework, tutor notes, and progress reports. This is important because tutoring should not feel like a black box.

The strongest results usually come from consistency. A clear plan, a steady lesson rhythm, useful homework, and honest progress feedback help parents understand what is happening and what should happen next. That structure is the TopMox difference: assessment first, tutoring second, progress visibility throughout.`
  },
  {
    title: "How to help your child improve in Mathematics",
    slug: "how-to-help-your-child-improve-in-mathematics",
    excerpt:
      "Practical ways parents can support maths confidence at home while TopMox builds a structured learning path through tutoring.",
    category: "Mathematics Support",
    status: "PUBLISHED",
    content: `Mathematics struggles are rarely solved by pressure alone. A child may be missing foundations, rushing through steps, avoiding corrections, or feeling anxious when questions look unfamiliar. Before choosing extra lessons, it helps to understand which of these problems is most likely.

Start by asking your child to explain how they solved a question. If they can get an answer but cannot explain the method, the issue may be weak understanding. If they understand during practice but freeze during tests, the issue may be confidence, timing, or exam technique. These are different problems and they need different support.

At home, keep practice short and consistent. Ten to twenty focused minutes can be more useful than one stressful weekend session. Review mistakes calmly and look for patterns. Are the errors in multiplication, fractions, word problems, algebra steps, or reading the question? Patterns help tutors choose the right intervention.

TopMox uses assessment details to shape the learning path before recommending a plan. A mathematics tutor can then reinforce foundations, model problem-solving steps, assign targeted homework, and help the child build confidence through repeated correction loops. Parents can support this by checking that homework is attempted and by encouraging the child to show working, not just answers.

Progress in Mathematics is usually built through clarity, practice, and patience. The goal is not to promise sudden grades. The goal is to make the next topic less confusing, the next homework task more manageable, and the next assessment less intimidating because the child has a structure to follow.`
  },
  {
    title: "Reading habits for primary school children",
    slug: "reading-habits-for-primary-school-children",
    excerpt:
      "Simple reading routines that help younger learners build fluency, vocabulary, comprehension, and confidence without overwhelming them.",
    category: "Reading Support",
    status: "PUBLISHED",
    content: `Reading improves when children meet words often, talk about meaning, and feel safe making mistakes. For primary school children, the best reading routine is usually simple, calm, and repeatable. It should feel like a habit, not a punishment.

Choose a short daily reading window. Ten minutes most days is better than a long session that happens only when everyone is already tired. Let the child read aloud sometimes, but also read to them. Hearing fluent reading helps children understand pace, expression, and sentence rhythm.

Comprehension grows through conversation. After a page or short passage, ask gentle questions: What happened first? Why did the character do that? What do you think this word means? What might happen next? These questions help children think about meaning instead of only sounding out words.

If your child avoids reading, do not start with blame. Avoidance may mean the book is too hard, the child is embarrassed, or comprehension is weak. TopMox uses child profile and assessment details to understand whether the main need is fluency, vocabulary, comprehension, confidence, or study routine.

A tutor can support reading by choosing appropriate passages, modelling strategies, assigning manageable practice, and helping parents see progress over time. The aim is not to turn every child into the same kind of reader. The aim is to build a reliable reading habit that supports schoolwork, homework, and confidence across subjects.`
  },
  {
    title: "Preparing your child for exam success",
    slug: "preparing-your-child-for-exam-success",
    excerpt:
      "A calm framework for helping children prepare for exams with better structure, less last-minute panic, and clearer tutor support.",
    category: "Exam Preparation",
    status: "PUBLISHED",
    content: `Exam preparation works best when it begins before panic starts. Many children do not fail to revise because they are lazy. They often struggle because the work feels too large, the weak areas are unclear, or they do not know how to practise under exam conditions.

Begin with a simple topic map. List the subjects, major topics, and the areas your child finds difficult. Then separate the work into weekly priorities. This gives the child a visible plan and helps parents avoid random revision. A clear plan also helps a tutor decide where support should begin.

Assessment-first tutoring is useful for exam preparation because it identifies the difference between knowledge gaps and exam technique problems. Some learners need content support. Others understand the topic but lose marks through timing, careless reading, weak answer structure, or stress. These are not the same issue.

At home, practise with time limits in small doses. Review mistakes after each practice session and ask what caused the mistake: lack of knowledge, rushing, misunderstanding the question, or weak structure. This helps the child learn from practice instead of only counting scores.

TopMox exam support is designed to create a steady rhythm: identify weak areas, practise deliberately, review progress, and adjust the plan. Parents should expect clarity and structure, not unrealistic claims. The goal is to help the child enter the exam period with better habits, better awareness, and a more confident next step.`
  }
];
