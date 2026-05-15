import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD_HASH = "demo-only-change-me";

const Role = {
  ADMIN: "ADMIN",
  TUTOR: "TUTOR",
  PARENT: "PARENT"
} as const;

const AssessmentStatus = {
  PENDING_REVIEW: "PENDING_REVIEW",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  PLAN_RECOMMENDED: "PLAN_RECOMMENDED",
  CONVERTED: "CONVERTED"
} as const;

const LessonStatus = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;

const PaymentStatus = {
  PENDING: "PENDING",
  AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
  PAID: "PAID",
  FAILED: "FAILED"
} as const;

const PaymentMethod = {
  BANK_TRANSFER: "BANK_TRANSFER",
  CARD: "CARD",
  PAYMENT_GATEWAY_PLACEHOLDER: "PAYMENT_GATEWAY_PLACEHOLDER"
} as const;

const EnrollmentStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED"
} as const;

const HomeworkStatus = {
  ASSIGNED: "ASSIGNED",
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  OVERDUE: "OVERDUE"
} as const;

const ReportStatus = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  PUBLISHED: "PUBLISHED"
} as const;

const SupportStatus = {
  OPEN: "OPEN",
  IN_REVIEW: "IN_REVIEW",
  RESOLVED: "RESOLVED"
} as const;

const TutorStatus = {
  ACTIVE: "ACTIVE"
} as const;

const CommunicationLogType = {
  CALL: "CALL",
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
  INTERNAL_NOTE: "INTERNAL_NOTE",
  PAYMENT_FOLLOW_UP: "PAYMENT_FOLLOW_UP",
  ACADEMIC_FOLLOW_UP: "ACADEMIC_FOLLOW_UP"
} as const;

const ResourceStatus = {
  PUBLISHED: "PUBLISHED"
} as const;

const PreferredContactMethod = {
  EMAIL: "EMAIL",
  WHATSAPP: "WHATSAPP",
  PHONE: "PHONE"
} as const;

const NotificationType = {
  ASSESSMENT_SUBMITTED: "ASSESSMENT_SUBMITTED",
  ASSESSMENT_SCHEDULED: "ASSESSMENT_SCHEDULED",
  PLAN_RECOMMENDED: "PLAN_RECOMMENDED",
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  LESSON_SCHEDULED: "LESSON_SCHEDULED",
  REPORT_PUBLISHED: "REPORT_PUBLISHED"
} as const;

const ProgressStatus = {
  NEEDS_ATTENTION: "NEEDS_ATTENTION",
  IMPROVING: "IMPROVING",
  ON_TRACK: "ON_TRACK"
} as const;

const baseDate = new Date("2026-05-14T09:00:00.000Z");

const addDays = (days: number, hourOffset = 0): Date => {
  return new Date(
    baseDate.getTime() +
      days * 24 * 60 * 60 * 1000 +
      hourOffset * 60 * 60 * 1000
  );
};

async function main(): Promise<void> {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@topmox.test" },
    update: {
      name: "TopMox Admin",
      role: Role.ADMIN,
      passwordHash: DEMO_PASSWORD_HASH
    },
    create: {
      email: "admin@topmox.test",
      name: "TopMox Admin",
      role: Role.ADMIN,
      passwordHash: DEMO_PASSWORD_HASH
    }
  });

  const tutorMathUser = await prisma.user.upsert({
    where: { email: "amara.math@topmox.test" },
    update: {
      name: "Amara Okoye",
      role: Role.TUTOR,
      passwordHash: DEMO_PASSWORD_HASH
    },
    create: {
      email: "amara.math@topmox.test",
      name: "Amara Okoye",
      role: Role.TUTOR,
      passwordHash: DEMO_PASSWORD_HASH
    }
  });

  const tutorEnglishUser = await prisma.user.upsert({
    where: { email: "david.english@topmox.test" },
    update: {
      name: "David Mensah",
      role: Role.TUTOR,
      passwordHash: DEMO_PASSWORD_HASH
    },
    create: {
      email: "david.english@topmox.test",
      name: "David Mensah",
      role: Role.TUTOR,
      passwordHash: DEMO_PASSWORD_HASH
    }
  });

  const parentNigeriaUser = await prisma.user.upsert({
    where: { email: "ngozi.parent@topmox.test" },
    update: {
      name: "Ngozi Akinyemi",
      role: Role.PARENT,
      passwordHash: DEMO_PASSWORD_HASH
    },
    create: {
      email: "ngozi.parent@topmox.test",
      name: "Ngozi Akinyemi",
      role: Role.PARENT,
      passwordHash: DEMO_PASSWORD_HASH
    }
  });

  const parentUkUser = await prisma.user.upsert({
    where: { email: "bola.ukparent@topmox.test" },
    update: {
      name: "Bola Okafor",
      role: Role.PARENT,
      passwordHash: DEMO_PASSWORD_HASH
    },
    create: {
      email: "bola.ukparent@topmox.test",
      name: "Bola Okafor",
      role: Role.PARENT,
      passwordHash: DEMO_PASSWORD_HASH
    }
  });

  const parentCanadaUser = await prisma.user.upsert({
    where: { email: "ada.canadaparent@topmox.test" },
    update: {
      name: "Ada Mensah",
      role: Role.PARENT,
      passwordHash: DEMO_PASSWORD_HASH
    },
    create: {
      email: "ada.canadaparent@topmox.test",
      name: "Ada Mensah",
      role: Role.PARENT,
      passwordHash: DEMO_PASSWORD_HASH
    }
  });

  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {
      phone: "+2348000000000",
      country: "Nigeria",
      timezone: "Africa/Lagos"
    },
    create: {
      userId: adminUser.id,
      phone: "+2348000000000",
      country: "Nigeria",
      timezone: "Africa/Lagos"
    }
  });

  await prisma.profile.upsert({
    where: { userId: tutorMathUser.id },
    update: {
      phone: "+2348011111111",
      country: "Nigeria",
      timezone: "Africa/Lagos"
    },
    create: {
      userId: tutorMathUser.id,
      phone: "+2348011111111",
      country: "Nigeria",
      timezone: "Africa/Lagos"
    }
  });

  await prisma.profile.upsert({
    where: { userId: tutorEnglishUser.id },
    update: {
      phone: "+233201111111",
      country: "Ghana",
      timezone: "Africa/Accra"
    },
    create: {
      userId: tutorEnglishUser.id,
      phone: "+233201111111",
      country: "Ghana",
      timezone: "Africa/Accra"
    }
  });

  await prisma.profile.upsert({
    where: { userId: parentNigeriaUser.id },
    update: {
      phone: "+2348022222222",
      country: "Nigeria",
      timezone: "Africa/Lagos"
    },
    create: {
      userId: parentNigeriaUser.id,
      phone: "+2348022222222",
      country: "Nigeria",
      timezone: "Africa/Lagos"
    }
  });

  await prisma.profile.upsert({
    where: { userId: parentUkUser.id },
    update: {
      phone: "+447700900123",
      country: "United Kingdom",
      timezone: "Europe/London"
    },
    create: {
      userId: parentUkUser.id,
      phone: "+447700900123",
      country: "United Kingdom",
      timezone: "Europe/London"
    }
  });

  await prisma.profile.upsert({
    where: { userId: parentCanadaUser.id },
    update: {
      phone: "+14165550001",
      country: "Canada",
      timezone: "America/Toronto"
    },
    create: {
      userId: parentCanadaUser.id,
      phone: "+14165550001",
      country: "Canada",
      timezone: "America/Toronto"
    }
  });

  const parentNigeria = await prisma.parentProfile.upsert({
    where: { userId: parentNigeriaUser.id },
    update: {
      whatsappNumber: "+2348022222222",
      country: "Nigeria",
      timezone: "Africa/Lagos",
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
      heardAboutTopMox: "TopMox Schools community referral"
    },
    create: {
      userId: parentNigeriaUser.id,
      whatsappNumber: "+2348022222222",
      country: "Nigeria",
      timezone: "Africa/Lagos",
      preferredContactMethod: PreferredContactMethod.WHATSAPP,
      heardAboutTopMox: "TopMox Schools community referral"
    }
  });

  const parentUk = await prisma.parentProfile.upsert({
    where: { userId: parentUkUser.id },
    update: {
      whatsappNumber: "+447700900123",
      country: "United Kingdom",
      timezone: "Europe/London",
      preferredContactMethod: PreferredContactMethod.EMAIL,
      heardAboutTopMox: "Instagram"
    },
    create: {
      userId: parentUkUser.id,
      whatsappNumber: "+447700900123",
      country: "United Kingdom",
      timezone: "Europe/London",
      preferredContactMethod: PreferredContactMethod.EMAIL,
      heardAboutTopMox: "Instagram"
    }
  });

  const parentCanada = await prisma.parentProfile.upsert({
    where: { userId: parentCanadaUser.id },
    update: {
      whatsappNumber: "+14165550001",
      country: "Canada",
      timezone: "America/Toronto",
      preferredContactMethod: PreferredContactMethod.PHONE,
      heardAboutTopMox: "Parent webinar"
    },
    create: {
      userId: parentCanadaUser.id,
      whatsappNumber: "+14165550001",
      country: "Canada",
      timezone: "America/Toronto",
      preferredContactMethod: PreferredContactMethod.PHONE,
      heardAboutTopMox: "Parent webinar"
    }
  });

  const tutorMath = await prisma.tutorProfile.upsert({
    where: { userId: tutorMathUser.id },
    update: {
      phone: "+2348011111111",
      bio: "Experienced mathematics and science educator with exam-focused coaching methods.",
      availabilityNotes:
        "Weekdays from 4 PM to 8 PM WAT, weekends by arrangement.",
      status: TutorStatus.ACTIVE
    },
    create: {
      userId: tutorMathUser.id,
      phone: "+2348011111111",
      bio: "Experienced mathematics and science educator with exam-focused coaching methods.",
      availabilityNotes:
        "Weekdays from 4 PM to 8 PM WAT, weekends by arrangement.",
      status: TutorStatus.ACTIVE
    }
  });

  const tutorEnglish = await prisma.tutorProfile.upsert({
    where: { userId: tutorEnglishUser.id },
    update: {
      phone: "+233201111111",
      bio: "English language specialist focused on reading confidence and writing structure.",
      availabilityNotes:
        "Flexible for UK and North American evening time zones.",
      status: TutorStatus.ACTIVE
    },
    create: {
      userId: tutorEnglishUser.id,
      phone: "+233201111111",
      bio: "English language specialist focused on reading confidence and writing structure.",
      availabilityNotes:
        "Flexible for UK and North American evening time zones.",
      status: TutorStatus.ACTIVE
    }
  });

  const subjectSeeds = [
    {
      name: "Mathematics",
      slug: "mathematics",
      description:
        "Core numeracy, problem-solving, and exam preparation support."
    },
    {
      name: "English",
      slug: "english",
      description:
        "Grammar, writing, vocabulary, and communication development."
    },
    {
      name: "Science",
      slug: "science",
      description:
        "Concept mastery across primary and secondary school science topics."
    },
    {
      name: "Reading & Comprehension",
      slug: "reading-comprehension",
      description: "Guided reading fluency and comprehension strategy coaching."
    }
  ] as const;

  const subjectsBySlug: Record<string, { id: string; slug: string }> = {};

  for (const subjectSeed of subjectSeeds) {
    const subject = await prisma.subject.upsert({
      where: { slug: subjectSeed.slug },
      update: {
        name: subjectSeed.name,
        description: subjectSeed.description
      },
      create: {
        name: subjectSeed.name,
        slug: subjectSeed.slug,
        description: subjectSeed.description
      }
    });

    subjectsBySlug[subject.slug] = { id: subject.id, slug: subject.slug };
  }

  const mathematics = subjectsBySlug["mathematics"];
  const english = subjectsBySlug["english"];
  const science = subjectsBySlug["science"];
  const reading = subjectsBySlug["reading-comprehension"];

  await prisma.tutorProfile.update({
    where: { id: tutorMath.id },
    data: {
      subjects: {
        set: [{ id: mathematics.id }, { id: science.id }]
      }
    }
  });

  await prisma.tutorProfile.update({
    where: { id: tutorEnglish.id },
    data: {
      subjects: {
        set: [{ id: english.id }, { id: reading.id }]
      }
    }
  });

  const planSeeds = [
    {
      name: "Starter Support",
      slug: "starter-support",
      description:
        "Gentle weekly support to improve consistency and confidence.",
      monthlyPrice: "120000.00",
      currency: "NGN",
      sessionsPerWeek: 2,
      bestFor:
        "Parents who need structured support without an intense schedule.",
      features: [
        "2 live sessions per week",
        "Weekly homework review",
        "Monthly parent update"
      ]
    },
    {
      name: "Growth Plan",
      slug: "growth-plan",
      description:
        "Balanced academic acceleration with clear progress tracking.",
      monthlyPrice: "180000.00",
      currency: "NGN",
      sessionsPerWeek: 3,
      bestFor:
        "Children who need stronger discipline, structure, and measurable growth.",
      features: [
        "3 live sessions per week",
        "Structured learning plan",
        "Monthly progress report",
        "Parent visibility dashboard"
      ]
    },
    {
      name: "Exam Prep Intensive",
      slug: "exam-prep-intensive",
      description: "Focused high-frequency support for upcoming exams.",
      monthlyPrice: "250000.00",
      currency: "NGN",
      sessionsPerWeek: 4,
      bestFor: "Learners preparing for high-stakes exams and entrance tests.",
      features: [
        "4 live sessions per week",
        "Past question drills",
        "Performance diagnostics",
        "Exam strategy coaching"
      ]
    },
    {
      name: "Homework Club",
      slug: "homework-club",
      description: "After-school guided homework and accountability support.",
      monthlyPrice: "90000.00",
      currency: "NGN",
      sessionsPerWeek: 2,
      bestFor: "Children who need help staying on top of school assignments.",
      features: [
        "2 guided homework sessions per week",
        "Tutor check-ins",
        "Parent update notes"
      ]
    }
  ] as const;

  const plansBySlug: Record<string, { id: string; slug: string }> = {};

  for (const planSeed of planSeeds) {
    const plan = await prisma.tutoringPlan.upsert({
      where: { slug: planSeed.slug },
      update: {
        name: planSeed.name,
        description: planSeed.description,
        monthlyPrice: planSeed.monthlyPrice,
        currency: planSeed.currency,
        sessionsPerWeek: planSeed.sessionsPerWeek,
        bestFor: planSeed.bestFor,
        features: [...planSeed.features],
        isActive: true
      },
      create: {
        name: planSeed.name,
        slug: planSeed.slug,
        description: planSeed.description,
        monthlyPrice: planSeed.monthlyPrice,
        currency: planSeed.currency,
        sessionsPerWeek: planSeed.sessionsPerWeek,
        bestFor: planSeed.bestFor,
        features: [...planSeed.features],
        isActive: true
      }
    });

    plansBySlug[plan.slug] = { id: plan.id, slug: plan.slug };
  }

  await prisma.resource.upsert({
    where: { slug: "how-online-tutoring-works-at-topmox" },
    update: {
      title: "How online tutoring works at TopMox",
      excerpt:
        "A step-by-step guide to TopMox Global Tutoring for busy parents in Nigeria and abroad.",
      content:
        "TopMox Global Tutoring starts with a child assessment, followed by a structured plan, consistent lessons, and monthly reporting. Parents stay informed through clear notes, homework tracking, and practical next steps.",
      category: "Parent Guide",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    },
    create: {
      slug: "how-online-tutoring-works-at-topmox",
      title: "How online tutoring works at TopMox",
      excerpt:
        "A step-by-step guide to TopMox Global Tutoring for busy parents in Nigeria and abroad.",
      content:
        "TopMox Global Tutoring starts with a child assessment, followed by a structured plan, consistent lessons, and monthly reporting. Parents stay informed through clear notes, homework tracking, and practical next steps.",
      category: "Parent Guide",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    }
  });

  await prisma.resource.upsert({
    where: { slug: "help-your-child-improve-in-mathematics" },
    update: {
      title: "How to help your child improve in Mathematics",
      excerpt:
        "Practical ways parents can support maths confidence and discipline at home.",
      content:
        "Consistency, error review, and confidence coaching make a measurable difference in mathematics performance. This guide shares routines that complement TopMox tutoring sessions.",
      category: "Mathematics",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    },
    create: {
      slug: "help-your-child-improve-in-mathematics",
      title: "How to help your child improve in Mathematics",
      excerpt:
        "Practical ways parents can support maths confidence and discipline at home.",
      content:
        "Consistency, error review, and confidence coaching make a measurable difference in mathematics performance. This guide shares routines that complement TopMox tutoring sessions.",
      category: "Mathematics",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    }
  });

  await prisma.resource.upsert({
    where: { slug: "reading-habits-for-primary-school-children" },
    update: {
      title: "Reading habits for primary school children",
      excerpt:
        "Simple reading routines that build fluency, comprehension, and confidence.",
      content:
        "Strong reading habits are built with short daily sessions, guided questioning, and a supportive environment. Parents can use these methods alongside tutor assignments.",
      category: "Reading",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    },
    create: {
      slug: "reading-habits-for-primary-school-children",
      title: "Reading habits for primary school children",
      excerpt:
        "Simple reading routines that build fluency, comprehension, and confidence.",
      content:
        "Strong reading habits are built with short daily sessions, guided questioning, and a supportive environment. Parents can use these methods alongside tutor assignments.",
      category: "Reading",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    }
  });

  await prisma.resource.upsert({
    where: { slug: "preparing-your-child-for-exam-success" },
    update: {
      title: "Preparing your child for exam success",
      excerpt: "A structured exam-prep framework for parents and learners.",
      content:
        "Exam success improves when revision is planned, practice is timed, and progress is reviewed weekly. This resource explains how TopMox combines tutoring structure with accountability.",
      category: "Exam Prep",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    },
    create: {
      slug: "preparing-your-child-for-exam-success",
      title: "Preparing your child for exam success",
      excerpt: "A structured exam-prep framework for parents and learners.",
      content:
        "Exam success improves when revision is planned, practice is timed, and progress is reviewed weekly. This resource explains how TopMox combines tutoring structure with accountability.",
      category: "Exam Prep",
      status: ResourceStatus.PUBLISHED,
      authorId: adminUser.id
    }
  });

  await prisma.communicationLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.progressReport.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.assessmentOutcome.deleteMany();
  await prisma.assessmentRequest.deleteMany();
  await prisma.studentProfile.deleteMany();

  const studentAdebola = await prisma.studentProfile.create({
    data: {
      parentId: parentNigeria.id,
      fullName: "Adebola Akinyemi",
      age: 10,
      classYearGroup: "Primary 5",
      countryOfStudy: "Nigeria",
      curriculum: "Nigerian/British",
      mainAcademicChallenge: "Difficulty with fractions and word problems",
      academicGoal:
        "Build confidence and improve mathematics scores before promotion exams",
      preferredLessonDays: ["Monday", "Wednesday", "Friday"],
      preferredLessonTime: "5:00 PM",
      subjects: {
        connect: [{ id: mathematics.id }, { id: science.id }]
      }
    }
  });

  const studentChiamaka = await prisma.studentProfile.create({
    data: {
      parentId: parentNigeria.id,
      fullName: "Chiamaka Bello",
      age: 8,
      classYearGroup: "Primary 3",
      countryOfStudy: "Nigeria",
      curriculum: "Nigerian",
      mainAcademicChallenge: "Reading fluency and comprehension confidence",
      academicGoal:
        "Read with confidence and answer comprehension questions accurately",
      preferredLessonDays: ["Tuesday", "Thursday"],
      preferredLessonTime: "4:30 PM",
      subjects: {
        connect: [{ id: english.id }, { id: reading.id }]
      }
    }
  });

  const studentZara = await prisma.studentProfile.create({
    data: {
      parentId: parentUk.id,
      fullName: "Zara Okafor",
      age: 12,
      classYearGroup: "Year 7",
      countryOfStudy: "United Kingdom",
      curriculum: "British",
      mainAcademicChallenge:
        "Weak essay structure and inconsistent reading comprehension",
      academicGoal:
        "Improve writing quality and prepare for end-of-term assessments",
      preferredLessonDays: ["Tuesday", "Thursday"],
      preferredLessonTime: "6:30 PM",
      subjects: {
        connect: [{ id: english.id }, { id: reading.id }]
      }
    }
  });

  const studentEthan = await prisma.studentProfile.create({
    data: {
      parentId: parentCanada.id,
      fullName: "Ethan Mensah",
      age: 14,
      classYearGroup: "Year 9",
      countryOfStudy: "Canada",
      curriculum: "Ontario Curriculum",
      mainAcademicChallenge:
        "Exam pressure and poor time management in science tests",
      academicGoal: "Build exam strategy and maintain consistent high scores",
      preferredLessonDays: ["Wednesday", "Saturday"],
      preferredLessonTime: "7:00 PM",
      subjects: {
        connect: [{ id: mathematics.id }, { id: science.id }]
      }
    }
  });

  const assessmentPending = await prisma.assessmentRequest.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentChiamaka.id,
      status: AssessmentStatus.PENDING_REVIEW,
      academicConcern:
        "Child hesitates while reading and struggles with comprehension questions.",
      preferredAssessmentDate: addDays(2),
      preferredAssessmentTime: "4:00 PM",
      timezone: "Africa/Lagos",
      notes:
        "Parent requests a tutor familiar with early reading intervention.",
      subjects: {
        connect: [{ id: english.id }, { id: reading.id }]
      }
    }
  });

  const assessmentScheduled = await prisma.assessmentRequest.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      status: AssessmentStatus.SCHEDULED,
      academicConcern:
        "Needs help with essay writing and comprehension for school assessments.",
      preferredAssessmentDate: addDays(1),
      preferredAssessmentTime: "7:00 PM",
      timezone: "Europe/London",
      notes: "Parent available after work hours.",
      scheduledAt: addDays(1, 10),
      meetingLink: "https://meet.example.com/topmox-zara-assessment",
      internalNotes: "Assigned to English assessment coordinator.",
      subjects: {
        connect: [{ id: english.id }, { id: reading.id }]
      }
    }
  });

  await prisma.assessmentRequest.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      status: AssessmentStatus.COMPLETED,
      academicConcern:
        "Requires structured support to improve writing confidence.",
      preferredAssessmentDate: addDays(-6),
      preferredAssessmentTime: "6:30 PM",
      timezone: "Europe/London",
      scheduledAt: addDays(-5, 9),
      meetingLink: "https://meet.example.com/topmox-zara-completed",
      notes: "Assessment completed; admin preparing final recommendation.",
      subjects: {
        connect: [{ id: english.id }]
      }
    }
  });

  const assessmentPlanRecommended = await prisma.assessmentRequest.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentAdebola.id,
      status: AssessmentStatus.PLAN_RECOMMENDED,
      academicConcern:
        "Needs stronger numeracy fundamentals and better study discipline.",
      preferredAssessmentDate: addDays(-10),
      preferredAssessmentTime: "5:00 PM",
      timezone: "Africa/Lagos",
      scheduledAt: addDays(-9, 8),
      meetingLink: "https://meet.example.com/topmox-adebola-assessment",
      notes: "Parent interested in 3 sessions per week.",
      internalNotes: "Assessment indicates good potential with consistency.",
      subjects: {
        connect: [{ id: mathematics.id }, { id: science.id }]
      }
    }
  });

  const assessmentConverted = await prisma.assessmentRequest.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      status: AssessmentStatus.CONVERTED,
      academicConcern: "Exam strategy and time management under pressure.",
      preferredAssessmentDate: addDays(-14),
      preferredAssessmentTime: "7:00 PM",
      timezone: "America/Toronto",
      scheduledAt: addDays(-13, 12),
      meetingLink: "https://meet.example.com/topmox-ethan-assessment",
      notes: "Parent accepted recommendation and moved to enrollment.",
      internalNotes: "Conversion complete after follow-up call.",
      subjects: {
        connect: [{ id: mathematics.id }, { id: science.id }]
      }
    }
  });

  await prisma.assessmentOutcome.create({
    data: {
      assessmentRequestId: assessmentPlanRecommended.id,
      recommendedPlanId: plansBySlug["growth-plan"].id,
      academicLevelSummary:
        "Solid baseline understanding with notable gaps in multi-step reasoning.",
      strengths:
        "Attentive during guided problem-solving and willing to practice.",
      weakAreas: "Fractions, word problems, and science application questions.",
      recommendedSubjects: ["Mathematics", "Science"],
      recommendedWeeklyLessonCount: 3,
      parentFacingSummary:
        "Adebola can improve quickly with structured weekly support, consistent homework review, and accountability.",
      internalAdminNotes: "Parent appears committed and responsive on WhatsApp."
    }
  });

  await prisma.assessmentOutcome.create({
    data: {
      assessmentRequestId: assessmentConverted.id,
      recommendedPlanId: plansBySlug["exam-prep-intensive"].id,
      academicLevelSummary:
        "Strong conceptual understanding but weak time management in timed assessments.",
      strengths:
        "Good recall in science and willingness to ask clarifying questions.",
      weakAreas: "Pacing, exam strategy, and stress response during tests.",
      recommendedSubjects: ["Mathematics", "Science"],
      recommendedWeeklyLessonCount: 4,
      parentFacingSummary:
        "Ethan should move to an intensive exam-prep structure to improve speed, precision, and confidence.",
      internalAdminNotes:
        "Parent requested measurable monthly tracking and regular progress communication."
    }
  });

  const enrollmentActive = await prisma.enrollment.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentAdebola.id,
      tutoringPlanId: plansBySlug["growth-plan"].id,
      assignedTutorId: tutorMath.id,
      status: EnrollmentStatus.ACTIVE,
      startDate: addDays(-20),
      notes: "Sessions aligned to school timetable and monthly report cycle."
    }
  });

  const enrollmentPendingPayment = await prisma.enrollment.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      tutoringPlanId: plansBySlug["starter-support"].id,
      assignedTutorId: tutorEnglish.id,
      status: EnrollmentStatus.PENDING_PAYMENT,
      startDate: addDays(4),
      notes: "Enrollment to activate immediately after payment verification."
    }
  });

  const enrollmentPaused = await prisma.enrollment.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      tutoringPlanId: plansBySlug["exam-prep-intensive"].id,
      assignedTutorId: tutorMath.id,
      status: EnrollmentStatus.PAUSED,
      startDate: addDays(-40),
      notes: "Paused for two weeks due to travel; to resume next cycle."
    }
  });

  const paymentPaid = await prisma.payment.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentAdebola.id,
      enrollmentId: enrollmentActive.id,
      amount: "180000.00",
      currency: "NGN",
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      reference: "TOPMOX-NG-2026-0001",
      proofUrl: "https://files.example.com/payments/topmox-ng-2026-0001",
      adminNote: "Verified by admin. Enrollment remains active.",
      paidAt: addDays(-18)
    }
  });

  const paymentAwaiting = await prisma.payment.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      enrollmentId: enrollmentPendingPayment.id,
      amount: "350.00",
      currency: "GBP",
      status: PaymentStatus.AWAITING_VERIFICATION,
      paymentMethod: PaymentMethod.CARD,
      reference: "TOPMOX-UK-2026-041",
      proofUrl: "https://files.example.com/payments/topmox-uk-2026-041",
      adminNote: "Awaiting bank confirmation from provider."
    }
  });

  const paymentPending = await prisma.payment.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      enrollmentId: enrollmentPaused.id,
      amount: "420.00",
      currency: "CAD",
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.PAYMENT_GATEWAY_PLACEHOLDER,
      reference: "TOPMOX-CA-2026-015"
    }
  });

  const paymentFailed = await prisma.payment.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      enrollmentId: enrollmentPaused.id,
      amount: "420.00",
      currency: "CAD",
      status: PaymentStatus.FAILED,
      paymentMethod: PaymentMethod.CARD,
      reference: "TOPMOX-CA-2026-014",
      adminNote:
        "Card authorization failed. Parent advised to retry with bank transfer."
    }
  });

  const lessonUpcomingMath = await prisma.lesson.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentAdebola.id,
      tutorId: tutorMath.id,
      subjectId: mathematics.id,
      enrollmentId: enrollmentActive.id,
      title: "Fractions and Word Problems",
      startTime: addDays(1, 8),
      endTime: addDays(1, 9),
      timezone: "Africa/Lagos",
      meetingLink: "https://meet.example.com/topmox-lesson-adebola-math",
      status: LessonStatus.SCHEDULED
    }
  });

  await prisma.lesson.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      tutorId: tutorEnglish.id,
      subjectId: english.id,
      enrollmentId: enrollmentPendingPayment.id,
      title: "Essay Structure Foundations",
      startTime: addDays(2, 10),
      endTime: addDays(2, 11),
      timezone: "Europe/London",
      meetingLink: "https://meet.example.com/topmox-lesson-zara-english",
      status: LessonStatus.SCHEDULED
    }
  });

  await prisma.lesson.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      tutorId: tutorMath.id,
      subjectId: science.id,
      enrollmentId: enrollmentPaused.id,
      title: "Science Revision Strategy",
      startTime: addDays(3, 12),
      endTime: addDays(3, 13),
      timezone: "America/Toronto",
      meetingLink: "https://meet.example.com/topmox-lesson-ethan-science",
      status: LessonStatus.SCHEDULED
    }
  });

  const lessonCompletedScience = await prisma.lesson.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentAdebola.id,
      tutorId: tutorMath.id,
      subjectId: science.id,
      enrollmentId: enrollmentActive.id,
      title: "States of Matter and Applications",
      startTime: addDays(-4, 8),
      endTime: addDays(-4, 9),
      timezone: "Africa/Lagos",
      meetingLink: "https://meet.example.com/topmox-lesson-adebola-science",
      status: LessonStatus.COMPLETED,
      attendanceMarkedAt: addDays(-4, 9),
      attended: true,
      lessonNotes:
        "Good participation. Needs more practice with application questions.",
      concernFlag: false
    }
  });

  const lessonCompletedReading = await prisma.lesson.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      tutorId: tutorEnglish.id,
      subjectId: reading.id,
      enrollmentId: enrollmentPendingPayment.id,
      title: "Reading Comprehension Strategies",
      startTime: addDays(-6, 9),
      endTime: addDays(-6, 10),
      timezone: "Europe/London",
      meetingLink: "https://meet.example.com/topmox-lesson-zara-reading",
      status: LessonStatus.COMPLETED,
      attendanceMarkedAt: addDays(-6, 10),
      attended: true,
      lessonNotes: "Improving inference skills. Homework quality has improved.",
      concernFlag: false
    }
  });

  const lessonCompletedMath = await prisma.lesson.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      tutorId: tutorMath.id,
      subjectId: mathematics.id,
      enrollmentId: enrollmentPaused.id,
      title: "Timed Algebra Practice",
      startTime: addDays(-8, 12),
      endTime: addDays(-8, 13),
      timezone: "America/Toronto",
      meetingLink: "https://meet.example.com/topmox-lesson-ethan-math",
      status: LessonStatus.COMPLETED,
      attendanceMarkedAt: addDays(-8, 13),
      attended: true,
      lessonNotes: "Accuracy is good, but time pacing still needs attention.",
      concernFlag: true,
      concernNote:
        "Student slows down significantly in the final third of timed tasks."
    }
  });

  const lessonCancelled = await prisma.lesson.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentChiamaka.id,
      tutorId: tutorEnglish.id,
      subjectId: reading.id,
      title: "Foundational Reading Fluency",
      startTime: addDays(-1, 8),
      endTime: addDays(-1, 9),
      timezone: "Africa/Lagos",
      meetingLink: "https://meet.example.com/topmox-lesson-chiamaka-reading",
      status: LessonStatus.CANCELLED,
      concernFlag: false
    }
  });

  await prisma.homework.create({
    data: {
      studentId: studentAdebola.id,
      tutorId: tutorMath.id,
      lessonId: lessonUpcomingMath.id,
      title: "Fraction Drill Set A",
      description: "Complete 20 fraction questions and show full workings.",
      dueDate: addDays(4),
      status: HomeworkStatus.ASSIGNED
    }
  });

  await prisma.homework.create({
    data: {
      studentId: studentAdebola.id,
      tutorId: tutorMath.id,
      lessonId: lessonCompletedScience.id,
      title: "States of Matter Worksheet",
      description: "Answer the application questions in sections B and C.",
      dueDate: addDays(-2),
      status: HomeworkStatus.SUBMITTED
    }
  });

  await prisma.homework.create({
    data: {
      studentId: studentZara.id,
      tutorId: tutorEnglish.id,
      lessonId: lessonCompletedReading.id,
      title: "Inference Practice Passage",
      description: "Read the passage and answer all inference-based questions.",
      dueDate: addDays(-3),
      status: HomeworkStatus.REVIEWED
    }
  });

  await prisma.homework.create({
    data: {
      studentId: studentEthan.id,
      tutorId: tutorMath.id,
      lessonId: lessonCompletedMath.id,
      title: "Timed Algebra Past Questions",
      description: "Solve five algebra past questions in 25 minutes.",
      dueDate: addDays(-5),
      status: HomeworkStatus.OVERDUE
    }
  });

  await prisma.progressReport.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentAdebola.id,
      tutorId: tutorMath.id,
      enrollmentId: enrollmentActive.id,
      reportingMonth: new Date("2026-04-01T00:00:00.000Z"),
      subjectsCovered: "Mathematics and Science",
      attendanceSummary: "Attended 8 of 8 scheduled lessons",
      strengths: "Improving confidence in multi-step problem solving",
      areasNeedingImprovement:
        "Still needs support with speed and precision in word problems",
      homeworkCompletion: "Completed 85% of assigned tasks",
      tutorComments: "Progress is positive with strong parent involvement.",
      recommendedNextSteps:
        "Continue Growth Plan and increase timed drills twice weekly.",
      parentActionPoints:
        "Monitor homework timing and encourage daily revision routine.",
      overallProgressStatus: ProgressStatus.ON_TRACK,
      status: ReportStatus.PUBLISHED,
      publishedAt: addDays(-3),
      linkedSubjects: {
        connect: [{ id: mathematics.id }, { id: science.id }]
      }
    }
  });

  await prisma.progressReport.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      tutorId: tutorEnglish.id,
      enrollmentId: enrollmentPendingPayment.id,
      reportingMonth: new Date("2026-04-01T00:00:00.000Z"),
      subjectsCovered: "English and Reading",
      attendanceSummary: "Attended 4 of 5 sessions",
      strengths: "Better paragraph structure and increased class participation",
      areasNeedingImprovement: "Needs consistency in planning before writing",
      homeworkCompletion: "Submitted most tasks, but some were late",
      tutorComments: "Good potential with stronger routine enforcement.",
      recommendedNextSteps:
        "Maintain weekly writing tasks and guided reading summaries.",
      parentActionPoints:
        "Review writing plans with child before each school assignment.",
      overallProgressStatus: ProgressStatus.IMPROVING,
      status: ReportStatus.DRAFT,
      linkedSubjects: {
        connect: [{ id: english.id }, { id: reading.id }]
      }
    }
  });

  await prisma.progressReport.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      tutorId: tutorMath.id,
      enrollmentId: enrollmentPaused.id,
      reportingMonth: new Date("2026-04-01T00:00:00.000Z"),
      subjectsCovered: "Mathematics and Science",
      attendanceSummary: "Attended 6 of 8 sessions",
      strengths: "Strong conceptual grasp in science topics",
      areasNeedingImprovement: "Time pressure handling and exam pacing",
      homeworkCompletion: "Completion dropped due to travel schedule",
      tutorComments:
        "Needs consistency and timed practice once sessions resume.",
      recommendedNextSteps:
        "Resume intensive schedule and re-baseline with a mock test.",
      parentActionPoints:
        "Create a weekly study timetable to rebuild consistency.",
      overallProgressStatus: ProgressStatus.NEEDS_ATTENTION,
      status: ReportStatus.REVIEW,
      linkedSubjects: {
        connect: [{ id: mathematics.id }, { id: science.id }]
      }
    }
  });

  const supportOpen = await prisma.supportRequest.create({
    data: {
      parentId: parentNigeria.id,
      studentId: studentChiamaka.id,
      lessonId: lessonCancelled.id,
      subject: "Reschedule cancelled reading lesson",
      message:
        "Please help us reschedule the missed reading session for this week.",
      status: SupportStatus.OPEN
    }
  });

  const supportInReview = await prisma.supportRequest.create({
    data: {
      parentId: parentUk.id,
      studentId: studentZara.id,
      paymentId: paymentAwaiting.id,
      subject: "Payment verification timeline",
      message:
        "Kindly confirm when our submitted card payment will be verified.",
      adminReply:
        "We are verifying with the payment provider and will update within 24 hours.",
      status: SupportStatus.IN_REVIEW
    }
  });

  const supportResolved = await prisma.supportRequest.create({
    data: {
      parentId: parentCanada.id,
      studentId: studentEthan.id,
      assessmentRequestId: assessmentConverted.id,
      subject: "Assessment follow-up summary",
      message:
        "Can we receive the exam strategy summary from the assessment session?",
      adminReply:
        "Shared with parent by email along with plan recommendation details.",
      status: SupportStatus.RESOLVED
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: NotificationType.ASSESSMENT_SUBMITTED,
        title: "New assessment request",
        message: "Chiamaka Bello has a new assessment request awaiting review.",
        href: "/admin/assessments"
      },
      {
        userId: adminUser.id,
        type: NotificationType.PAYMENT_SUBMITTED,
        title: "Payment awaiting verification",
        message: "Bola Okafor submitted payment proof for verification.",
        href: "/admin/payments"
      },
      {
        userId: parentNigeriaUser.id,
        type: NotificationType.PLAN_RECOMMENDED,
        title: "Plan recommendation ready",
        message: "A Growth Plan recommendation is ready for Adebola.",
        href: "/parent/assessments"
      },
      {
        userId: parentUkUser.id,
        type: NotificationType.ASSESSMENT_SCHEDULED,
        title: "Assessment scheduled",
        message:
          "Zara's assessment is scheduled. Please check the meeting link.",
        href: "/parent/assessments"
      },
      {
        userId: tutorMathUser.id,
        type: NotificationType.LESSON_SCHEDULED,
        title: "New lesson assigned",
        message: "A new mathematics lesson has been assigned to you.",
        href: "/tutor/lessons"
      },
      {
        userId: tutorEnglishUser.id,
        type: NotificationType.REPORT_PUBLISHED,
        title: "Parent report published",
        message: "A published report is now visible to the parent dashboard.",
        href: "/tutor/reports"
      }
    ]
  });

  await prisma.communicationLog.createMany({
    data: [
      {
        type: CommunicationLogType.CALL,
        message:
          "Called Ngozi Akinyemi to discuss Adebola's learning plan and lesson cadence.",
        parentId: parentNigeria.id,
        studentId: studentAdebola.id,
        createdById: adminUser.id
      },
      {
        type: CommunicationLogType.WHATSAPP,
        message:
          "Sent assessment scheduling reminder to Bola Okafor via WhatsApp.",
        parentId: parentUk.id,
        studentId: studentZara.id,
        assessmentRequestId: assessmentScheduled.id,
        createdById: adminUser.id
      },
      {
        type: CommunicationLogType.EMAIL,
        message: "Emailed Ada Mensah with exam prep onboarding details.",
        parentId: parentCanada.id,
        studentId: studentEthan.id,
        createdById: adminUser.id
      },
      {
        type: CommunicationLogType.INTERNAL_NOTE,
        message:
          "Internal note: prioritize Nigerian diaspora families requesting after-school slots.",
        parentId: parentNigeria.id,
        createdById: adminUser.id
      },
      {
        type: CommunicationLogType.PAYMENT_FOLLOW_UP,
        message:
          "Followed up with UK parent regarding pending payment verification.",
        parentId: parentUk.id,
        paymentId: paymentAwaiting.id,
        supportRequestId: supportInReview.id,
        createdById: adminUser.id
      },
      {
        type: CommunicationLogType.ACADEMIC_FOLLOW_UP,
        message:
          "Reviewed concern flag from Ethan's timed algebra lesson and planned intervention.",
        parentId: parentCanada.id,
        studentId: studentEthan.id,
        lessonId: lessonCompletedMath.id,
        supportRequestId: supportResolved.id,
        createdById: adminUser.id
      }
    ]
  });

  console.log("TopMox Phase 2 seed complete.");
  console.log(
    [
      "Users: 6",
      "Students: 4",
      "Assessments: 5",
      "Enrollments: 3",
      "Lessons: 7",
      "Reports: 3",
      "Support requests: 3",
      "Communication logs: 6"
    ].join(" | ")
  );
  console.log(
    `References: ${assessmentPending.id}, ${supportOpen.id}, ${paymentPaid.id}, ${paymentPending.id}, ${paymentFailed.id}`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
