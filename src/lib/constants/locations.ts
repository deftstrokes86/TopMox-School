export const REGION_COOKIE_NAME = "topmox_region";

export const REGION_CODES = [
  "global",
  "nigeria",
  "united-states",
  "canada",
  "australia",
  "united-kingdom",
  "europe",
  "uae"
] as const;

export type RegionCode = (typeof REGION_CODES)[number];

export type RegionCurrency =
  | "USD"
  | "NGN"
  | "CAD"
  | "AUD"
  | "GBP"
  | "EUR"
  | "AED";

export type RegionConfig = {
  code: RegionCode;
  name: string;
  slug: string;
  flag: string;
  countryCodes: string[];
  continentCode?: string;
  currency: RegionCurrency;
  currencySymbol: string;
  timezoneExamples: string[];
  headline: string;
  shortDescription: string;
  parentPainPoints: string[];
  offerBenefits: string[];
  subjectsFocus: string[];
  paymentNotes: string;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  flutterwaveEnabledDefault: boolean;
  manualPaymentEnabledDefault: boolean;
};

export const DEFAULT_REGION_CODE: RegionCode = "nigeria";

const EUROPE_COUNTRY_CODES = [
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK"
];

export const REGION_CONFIGS: Record<RegionCode, RegionConfig> = {
  global: {
    code: "global",
    name: "Global",
    slug: "global",
    flag: "\u{1F30D}",
    countryCodes: [],
    currency: "USD",
    currencySymbol: "$",
    timezoneExamples: ["UTC", "Etc/UTC"],
    headline: "School-backed online tutoring for families wherever they are.",
    shortDescription:
      "TopMox supports parents in Nigeria and abroad with assessment-led tutoring, live lessons, homework visibility, and progress reporting.",
    parentPainPoints: [
      "Finding trustworthy online support can feel uncertain.",
      "Parents need clarity before choosing a tutoring plan.",
      "Families in different countries need flexible coordination."
    ],
    offerBenefits: [
      "Assessment-first recommendations before plan acceptance.",
      "Structured lessons from a school-backed tutoring team.",
      "Parent visibility through lessons, homework, and reports."
    ],
    subjectsFocus: [
      "Mathematics",
      "English",
      "Science",
      "Reading and comprehension",
      "Homework support"
    ],
    paymentNotes:
      "TopMox confirms pricing and payment guidance after assessment so each family gets the support path that fits their country and plan.",
    faq: [
      {
        question: "Can TopMox support families outside Nigeria?",
        answer:
          "Yes. The online tutoring model is designed for families in Nigeria and abroad, with scheduling handled around family context and tutor availability."
      },
      {
        question: "How does TopMox support families in different countries?",
        answer:
          "TopMox starts with the child's needs, then confirms lesson rhythm, subjects, pricing, and payment guidance for the family's country."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  nigeria: {
    code: "nigeria",
    name: "Nigeria",
    slug: "nigeria",
    flag: "\u{1F1F3}\u{1F1EC}",
    countryCodes: ["NG"],
    continentCode: "AF",
    currency: "NGN",
    currencySymbol: "\u20A6",
    timezoneExamples: ["Africa/Lagos"],
    headline: "School-backed tutoring support for families in Nigeria.",
    shortDescription:
      "TopMox helps Nigerian parents move from concern to a structured academic support plan with tutors, homework follow-through, and progress visibility.",
    parentPainPoints: [
      "Homework pressure can become stressful without steady support.",
      "Parents want trusted tutoring that is more structured than random lessons.",
      "Children may need help with core subjects before exam pressure builds."
    ],
    offerBenefits: [
      "Backed by an existing school with academic discipline.",
      "Clear support for Mathematics, English, Science, and homework.",
      "Parent dashboards and reports keep families informed."
    ],
    subjectsFocus: [
      "Mathematics",
      "English",
      "Science",
      "Reading and comprehension",
      "Exam-focused support where available"
    ],
    paymentNotes:
      "Families in Nigeria can discuss plans in NGN. Final pricing and payment instructions are confirmed after the child assessment.",
    faq: [
      {
        question: "Can TopMox help with homework and exam-focused support?",
        answer:
          "Yes, TopMox can support homework routines and exam-focused preparation where available, while avoiding guaranteed exam outcome promises."
      },
      {
        question: "How will I know what my child is doing?",
        answer:
          "Parents can follow lessons, homework, tutor notes, and progress reports so support feels clear and accountable."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  "united-states": {
    code: "united-states",
    name: "United States",
    slug: "united-states",
    flag: "\u{1F1FA}\u{1F1F8}",
    countryCodes: ["US"],
    continentCode: "NA",
    currency: "USD",
    currencySymbol: "$",
    timezoneExamples: [
      "America/New_York",
      "America/Chicago",
      "America/Los_Angeles"
    ],
    headline: "Online tutoring support for US-based families and diaspora parents.",
    shortDescription:
      "TopMox gives families in the United States a guided after-school support path with reading, maths, homework, and visible parent updates.",
    parentPainPoints: [
      "Busy after-school schedules make consistency difficult.",
      "Parents want reading and maths confidence without guesswork.",
      "Diaspora families often value structured communication and accountability."
    ],
    offerBenefits: [
      "Flexible online coordination across US family routines.",
      "Assessment-led support before a tutoring plan is accepted.",
      "Progress visibility that helps parents see what is happening."
    ],
    subjectsFocus: [
      "Maths confidence",
      "Reading support",
      "English communication",
      "Science foundations",
      "Homework follow-through"
    ],
    paymentNotes:
      "Families in the United States can discuss plans in USD. TopMox confirms final pricing and payment instructions after assessment.",
    faq: [
      {
        question: "Can lessons support after-school routines in the United States?",
        answer:
          "Yes. Lessons are coordinated online around family and tutor availability, with support focused on reading, maths, homework, and confidence."
      },
      {
        question: "How will I know what my child is working on?",
        answer:
          "Parents can see lesson context, homework, notes, and progress reporting from the TopMox parent experience."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  canada: {
    code: "canada",
    name: "Canada",
    slug: "canada",
    flag: "\u{1F1E8}\u{1F1E6}",
    countryCodes: ["CA"],
    continentCode: "NA",
    currency: "CAD",
    currencySymbol: "CA$",
    timezoneExamples: ["America/Toronto", "America/Vancouver"],
    headline: "Consistent online tutoring support for families in Canada.",
    shortDescription:
      "TopMox supports Canadian and diaspora families with structured online lessons, homework support, and practical progress updates.",
    parentPainPoints: [
      "Children may need steady support between school and home routines.",
      "Parents want confidence and consistency without overloading the child.",
      "Families need flexible lessons that fit around daily life."
    ],
    offerBenefits: [
      "Assessment-first recommendations for better fit.",
      "Homework and core-subject support with clear next steps.",
      "Parent-facing reports that make progress easier to understand."
    ],
    subjectsFocus: [
      "Mathematics",
      "English",
      "Reading and comprehension",
      "Science",
      "Homework support"
    ],
    paymentNotes:
      "Families in Canada can discuss plans in CAD. Final pricing and payment instructions are confirmed after assessment.",
    faq: [
      {
        question: "Can TopMox support homework consistency for families in Canada?",
        answer:
          "Yes. TopMox focuses on consistent routines, homework follow-through, and core subject support without overclaiming province-specific curriculum coverage."
      },
      {
        question: "How are progress updates shared?",
        answer:
          "Parents can follow lesson activity, homework, tutor notes, and progress reports so support remains easy to understand."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  australia: {
    code: "australia",
    name: "Australia",
    slug: "australia",
    flag: "\u{1F1E6}\u{1F1FA}",
    countryCodes: ["AU"],
    continentCode: "OC",
    currency: "AUD",
    currencySymbol: "A$",
    timezoneExamples: ["Australia/Sydney", "Australia/Perth"],
    headline: "Tutoring support for families in Australia.",
    shortDescription:
      "TopMox helps families abroad access structured academic help, progress reporting, and online tutoring coordination.",
    parentPainPoints: [
      "Distance can make tutoring coordination feel difficult.",
      "Families need clear reports so support feels accountable.",
      "Children benefit from structure between school and home study."
    ],
    offerBenefits: [
      "Online scheduling designed to respect family routines.",
      "Structured lessons and homework support.",
      "Progress reporting so parents can see the learning path."
    ],
    subjectsFocus: [
      "Mathematics",
      "English",
      "Science",
      "Reading and comprehension",
      "Homework support"
    ],
    paymentNotes:
      "Families in Australia can discuss plans in AUD. TopMox confirms final pricing and payment instructions after assessment.",
    faq: [
      {
        question: "Can TopMox work around family schedules in Australia?",
        answer:
          "Yes. Lesson times are confirmed around family and tutor availability so online support can fit normal routines."
      },
      {
        question: "What subjects are available for Australian families?",
        answer:
          "TopMox can support Mathematics, English, Science, reading and comprehension, and homework routines."
      }
    ],
    flutterwaveEnabledDefault: false,
    manualPaymentEnabledDefault: true
  },
  "united-kingdom": {
    code: "united-kingdom",
    name: "United Kingdom",
    slug: "united-kingdom",
    flag: "\u{1F1EC}\u{1F1E7}",
    countryCodes: ["GB", "UK"],
    continentCode: "EU",
    currency: "GBP",
    currencySymbol: "\u00A3",
    timezoneExamples: ["Europe/London"],
    headline: "Structured online tutoring for UK-based families.",
    shortDescription:
      "TopMox supports UK-based and Nigerian/African diaspora families with maths, English, reading, homework support, and visible progress updates.",
    parentPainPoints: [
      "Parents want reliable after-school structure without confusion.",
      "Children may need steady help with maths, English, or reading confidence.",
      "Families value clear updates and culturally aware communication."
    ],
    offerBenefits: [
      "Assessment-first support before choosing a plan.",
      "Maths, English, reading, and homework support.",
      "Parent progress visibility and structured lesson follow-up."
    ],
    subjectsFocus: [
      "Maths",
      "English",
      "Reading and comprehension",
      "Homework support",
      "Exam-focused support where available"
    ],
    paymentNotes:
      "Families in the United Kingdom can discuss plans in GBP. Final pricing and payment instructions are confirmed after assessment.",
    faq: [
      {
        question: "Can TopMox help with maths, English, and reading?",
        answer:
          "Yes. TopMox can support maths, English, reading, homework routines, and exam-focused support where available."
      },
      {
        question: "Is exam-focused support available?",
        answer:
          "Exam-focused support may be available where it fits the child's needs, but TopMox does not guarantee 11+ or GCSE outcomes."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  europe: {
    code: "europe",
    name: "Europe",
    slug: "europe",
    flag: "\u{1F1EA}\u{1F1FA}",
    countryCodes: EUROPE_COUNTRY_CODES,
    continentCode: "EU",
    currency: "EUR",
    currencySymbol: "\u20AC",
    timezoneExamples: ["Europe/Paris", "Europe/Berlin", "Europe/Madrid"],
    headline: "Flexible online tutoring support for families across Europe.",
    shortDescription:
      "TopMox helps international and diaspora families across Europe access structured English, maths, science, and homework support online.",
    parentPainPoints: [
      "Curriculum and language contexts can differ across countries.",
      "Parents need clear support without claims that overreach local schooling.",
      "Families need flexible online lessons and simple progress updates."
    ],
    offerBenefits: [
      "Structured tutoring with parent-safe progress visibility.",
      "Support across English, maths, science, and homework routines.",
      "Clear guidance for families living across different school systems."
    ],
    subjectsFocus: [
      "English",
      "Mathematics",
      "Science",
      "Reading and comprehension",
      "Homework support"
    ],
    paymentNotes:
      "Families across Europe can discuss plans in EUR. Final pricing and payment instructions are confirmed after assessment.",
    faq: [
      {
        question: "Can TopMox support families across different European school systems?",
        answer:
          "TopMox supports core academic needs and will confirm local curriculum expectations with each family before recommending a plan."
      },
      {
        question: "What does the assessment help clarify?",
        answer:
          "The assessment helps TopMox understand subject gaps, confidence needs, homework routines, and the best tutoring pace."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  uae: {
    code: "uae",
    name: "UAE",
    slug: "uae",
    flag: "\u{1F1E6}\u{1F1EA}",
    countryCodes: ["AE"],
    continentCode: "AS",
    currency: "AED",
    currencySymbol: "\u062F.\u0625",
    timezoneExamples: ["Asia/Dubai"],
    headline: "Online tutoring support for expat families in the UAE.",
    shortDescription:
      "TopMox gives UAE-based families structured support across English, maths, science, homework, and parent reporting.",
    parentPainPoints: [
      "Busy family schedules need weekend or evening coordination.",
      "Parents want clear reporting rather than vague lesson updates.",
      "Expat families often need practical academic support across contexts."
    ],
    offerBenefits: [
      "Evening and weekend lesson coordination.",
      "Structured support across core subjects.",
      "Parent reporting that keeps families informed."
    ],
    subjectsFocus: [
      "English",
      "Mathematics",
      "Science",
      "Reading and comprehension",
      "Homework support"
    ],
    paymentNotes:
      "Families in the UAE can discuss plans in AED. TopMox confirms final pricing and payment instructions after assessment.",
    faq: [
      {
        question: "Can lessons fit around evenings or weekends in the UAE?",
        answer:
          "Yes. Scheduling is confirmed around family and tutor availability, including evening or weekend options where practical."
      },
      {
        question: "How do parents see progress?",
        answer:
          "Parents can follow lessons, homework, notes, and progress reports so support feels visible rather than vague."
      }
    ],
    flutterwaveEnabledDefault: false,
    manualPaymentEnabledDefault: true
  }
};

export const REGION_OPTIONS = REGION_CODES.map((code) => REGION_CONFIGS[code]);

export const PUBLIC_REGION_OPTIONS = REGION_OPTIONS.filter(
  (region) => region.code !== "global"
);

export function isRegionCode(value: string | null | undefined): value is RegionCode {
  return Boolean(value && REGION_CODES.includes(value as RegionCode));
}

export function getRegionConfig(
  regionCode: string | null | undefined
): RegionConfig {
  return isRegionCode(regionCode)
    ? REGION_CONFIGS[regionCode]
    : REGION_CONFIGS[DEFAULT_REGION_CODE];
}
