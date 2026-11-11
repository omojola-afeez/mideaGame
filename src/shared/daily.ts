import type { Level, SubjectId, TopicId } from "./constants";

export interface RoundPartInput {
  subject: SubjectId;
  topic: TopicId;
  level: Level;
  count: number;
  reviewCodes?: string[];
  excludeCodes?: string[];
}

const ENGLISH_ORDER: TopicId[] = [
  "comprehension",
  "grammar",
  "tenses",
  "punctuation",
  "spelling",
  "vocabulary",
  "figures",
  "writing",
];

const MATH_ORDER: TopicId[] = [
  "number",
  "addsub",
  "muldiv",
  "fractions",
  "decimals",
  "geometry",
  "measurement",
  "money-data",
];

/** Ten questions across English, Mathematics and the Code and AI sample. */
export function dailyPlan(day: string, levelFor: (topic: TopicId) => Level): RoundPartInput[] {
  const stamp = Date.parse(`${day}T00:00:00Z`);
  const n = Number.isFinite(stamp) ? Math.floor(stamp / 86_400_000) : 0;
  const e1 = ENGLISH_ORDER[((n % ENGLISH_ORDER.length) + ENGLISH_ORDER.length) % ENGLISH_ORDER.length] ?? "grammar";
  const e2 =
    ENGLISH_ORDER[((n + 1) % ENGLISH_ORDER.length + ENGLISH_ORDER.length) % ENGLISH_ORDER.length] ?? "comprehension";
  const m = MATH_ORDER[((n * 3) % MATH_ORDER.length + MATH_ORDER.length) % MATH_ORDER.length] ?? "number";

  return [
    { subject: "english", topic: e1, level: levelFor(e1), count: 3, reviewCodes: [], excludeCodes: [] },
    { subject: "english", topic: e2, level: levelFor(e2), count: 3, reviewCodes: [], excludeCodes: [] },
    { subject: "mathematics", topic: m, level: levelFor(m), count: 2, reviewCodes: [], excludeCodes: [] },
    {
      subject: "code-ai",
      topic: "code-and-ai",
      level: levelFor("code-and-ai"),
      count: 2,
      reviewCodes: [],
      excludeCodes: [],
    },
  ];
}

export function isDaily(subject: string, topic: string): boolean {
  return subject === "mixed" || topic === "daily";
}