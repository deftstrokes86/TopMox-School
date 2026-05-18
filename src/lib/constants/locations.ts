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
      "USD is shown only when Global is manually selected. If no region can be resolved, TopMox falls back to Nigeria with NGN. Final payment options depend on country, currency, and Flutterwave account configuration.",
    faq: [
      {
        question: "Can TopMox support families outside Nigeria?",
        answer:
          "Yes. The online tutoring model is designed for families in Nigeria and abroad, with scheduling handled around family context and tutor availability."
      },
      {
        question: "Will I be redirected automatically to a country page?",
        answer:
          "No. TopMox uses soft personalization and always lets you choose your preferred region manually."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  nigeria: {
    code: "nigeria",
    name: "Nigeria",
    slug: "nigeria",
    countryCodes: ["NG"],
    continentCode: "AF",
    currency: "NGN",
    currencySymbol: "₦",
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
      "NGN is shown for Nigeria. Flutterwave checkout and manual payment fallback remain available based on TopMox account configuration.",
    faq: [
      {
        question: "Does TopMox guarantee WAEC, NECO, or JAMB results?",
        answer:
          "No. TopMox provides structured academic support and exam-focused help where available, but does not guarantee exam outcomes."
      },
      {
        question: "Can parents track homework and progress?",
        answer:
          "Yes. The platform is designed to show lessons, homework, tutor notes, and progress reports."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  "united-states": {
    code: "united-states",
    name: "United States",
    slug: "united-states",
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
      "Flexible online coordination across US time zones.",
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
      "USD is shown for the United States. Payment options depend on currency, location, and Flutterwave account configuration.",
    faq: [
      {
        question: "Does TopMox claim certified US curriculum coverage?",
        answer:
          "No. TopMox provides structured academic support and parent visibility, but specific curriculum certification should be confirmed before launch."
      },
      {
        question: "Can lessons work around US time zones?",
        answer:
          "Scheduling is online and timezone-aware, subject to tutor availability."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  canada: {
    code: "canada",
    name: "Canada",
    slug: "canada",
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
      "CAD is shown for Canada. Final payment options depend on Flutterwave account configuration and manual fallback remains available.",
    faq: [
      {
        question: "Does TopMox guarantee province-specific curriculum mastery?",
        answer:
          "No. TopMox offers structured academic support and should confirm province-specific curriculum scope with families when needed."
      },
      {
        question: "Can parents see lesson follow-up?",
        answer:
          "Yes. Lesson visibility, homework, notes, and progress reports are part of the support model."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  australia: {
    code: "australia",
    name: "Australia",
    slug: "australia",
    countryCodes: ["AU"],
    continentCode: "OC",
    currency: "AUD",
    currencySymbol: "A$",
    timezoneExamples: ["Australia/Sydney", "Australia/Perth"],
    headline: "Timezone-aware tutoring support for families in Australia.",
    shortDescription:
      "TopMox helps families abroad access structured academic help, progress reporting, and online tutoring coordination.",
    parentPainPoints: [
      "Time-zone distance can make tutoring coordination feel difficult.",
      "Families need clear reports so support feels accountable.",
      "Children benefit from structure between school and home study."
    ],
    offerBenefits: [
      "Online scheduling designed to respect family time zones.",
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
      "AUD is shown for your region. Live Flutterwave collection in AUD should be confirmed before launch. Manual or fallback payment options may be used if needed.",
    faq: [
      {
        question: "Is AUD Flutterwave checkout enabled automatically?",
        answer:
          "No. AUD is displayed for regional clarity, but live Flutterwave collection should be confirmed in the TopMox Flutterwave account before launch."
      },
      {
        question: "What happens if online checkout is not enabled?",
        answer:
          "Manual payment fallback or another TopMox-approved fallback can be used if TopMox confirms that path operationally."
      }
    ],
    flutterwaveEnabledDefault: false,
    manualPaymentEnabledDefault: true
  },
  "united-kingdom": {
    code: "united-kingdom",
    name: "United Kingdom",
    slug: "united-kingdom",
    countryCodes: ["GB", "UK"],
    continentCode: "EU",
    currency: "GBP",
    currencySymbol: "£",
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
      "GBP is shown for the United Kingdom. Flutterwave checkout depends on account configuration and manual payment fallback remains available.",
    faq: [
      {
        question: "Does TopMox guarantee 11+ or GCSE outcomes?",
        answer:
          "No. TopMox can provide exam-focused support where available, but does not guarantee exam outcomes."
      },
      {
        question: "Is this suitable for diaspora families?",
        answer:
          "Yes. The support model is designed for families who value school-backed structure and parent visibility."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  europe: {
    code: "europe",
    name: "Europe",
    slug: "europe",
    countryCodes: EUROPE_COUNTRY_CODES,
    continentCode: "EU",
    currency: "EUR",
    currencySymbol: "€",
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
      "Manual region switching so families are never trapped by detection."
    ],
    subjectsFocus: [
      "English",
      "Mathematics",
      "Science",
      "Reading and comprehension",
      "Homework support"
    ],
    paymentNotes:
      "EUR is shown for Europe. Payment options depend on currency, country, and Flutterwave account configuration.",
    faq: [
      {
        question: "Does TopMox cover every European curriculum?",
        answer:
          "No. TopMox supports core academic needs and should confirm local curriculum expectations with each family."
      },
      {
        question: "Can I choose a different region manually?",
        answer:
          "Yes. The region switcher lets families choose the region that best matches their payment and support context."
      }
    ],
    flutterwaveEnabledDefault: true,
    manualPaymentEnabledDefault: true
  },
  uae: {
    code: "uae",
    name: "UAE",
    slug: "uae",
    countryCodes: ["AE"],
    continentCode: "AS",
    currency: "AED",
    currencySymbol: "د.إ",
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
      "Timezone-aware lesson coordination.",
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
      "AED is shown for your region. Live Flutterwave collection in AED should be confirmed before launch. Manual or fallback payment options may be used if needed.",
    faq: [
      {
        question: "Is AED Flutterwave checkout enabled automatically?",
        answer:
          "No. AED is displayed for regional clarity, but live Flutterwave collection should be confirmed in the TopMox Flutterwave account before launch."
      },
      {
        question: "Can TopMox support evening or weekend schedules?",
        answer:
          "Scheduling is handled online and should be confirmed based on tutor availability and family timezone."
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
