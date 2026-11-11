export const GAME_NAME = "Brainwave Quest";
export const ROOM_TYPE = "quest";
export const PROGRESS_KEY = "brainwave-quest-progress-v1";

/** Phase 1 is Explorers only: ages 9 to 11, Primary 4 to 6. */
export const BAND = {
  id: "explorers",
  label: "Explorers",
  ages: "9 to 11",
  classes: "Primary 4 to 6",
  readingGrade: 6.5,
} as const;

export const LEVELS = ["bronze", "silver", "gold"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

export const LEVEL_BLURBS: Record<Level, string> = {
  bronze: "Remember one fact or one step.",
  silver: "Use the fact in a short problem.",
  gold: "Combine two ideas or explain why.",
};

export const LEVEL_ORDER: Record<Level, number> = { bronze: 0, silver: 1, gold: 2 };

export type SubjectId = "english" | "mathematics" | "code-ai";
export type TopicId =
  | "comprehension"
  | "grammar"
  | "tenses"
  | "punctuation"
  | "spelling"
  | "vocabulary"
  | "figures"
  | "writing"
  | "number"
  | "addsub"
  | "muldiv"
  | "fractions"
  | "decimals"
  | "geometry"
  | "measurement"
  | "money-data"
  | "code-and-ai";

export interface SubjectDef {
  id: SubjectId;
  label: string;
  short: string;
  emoji: string;
  blurb: string;
  /** Tailwind token name used by the map. */
  tone: "cyan" | "violet" | "mint";
}

export interface TopicDef {
  id: TopicId;
  subjectId: SubjectId;
  label: string;
  blurb: string;
  emoji: string;
  /** Three letters used in question codes, for example ENG-COM-B-001. */
  codePrefix: string;
  order: number;
}

export const SUBJECTS: readonly SubjectDef[] = [
  {
    id: "english",
    label: "English language",
    short: "English",
    emoji: "📚",
    blurb: "Reading, words and writing",
    tone: "cyan",
  },
  {
    id: "mathematics",
    label: "Mathematics",
    short: "Maths",
    emoji: "➗",
    blurb: "Numbers, shapes and money",
    tone: "violet",
  },
  {
    id: "code-ai",
    label: "Code and AI",
    short: "Code",
    emoji: "🤖",
    blurb: "How computers and AI work",
    tone: "mint",
  },
];

export const TOPICS: readonly TopicDef[] = [
  {
    id: "comprehension",
    subjectId: "english",
    label: "Reading detective",
    blurb: "Read a short passage and find the answer",
    emoji: "🔎",
    codePrefix: "COM",
    order: 1,
  },
  {
    id: "grammar",
    subjectId: "english",
    label: "Grammar garden",
    blurb: "Nouns, verbs, pronouns and more",
    emoji: "🧩",
    codePrefix: "GRA",
    order: 2,
  },
  {
    id: "tenses",
    subjectId: "english",
    label: "Time travellers",
    blurb: "Past, present and future",
    emoji: "⏳",
    codePrefix: "TEN",
    order: 3,
  },
  {
    id: "punctuation",
    subjectId: "english",
    label: "Punctuation point",
    blurb: "Full stops, commas and capital letters",
    emoji: "✏️",
    codePrefix: "PUN",
    order: 4,
  },
  {
    id: "spelling",
    subjectId: "english",
    label: "Spelling shore",
    blurb: "Common words and tricky sounds",
    emoji: "🔤",
    codePrefix: "SPE",
    order: 5,
  },
  {
    id: "vocabulary",
    subjectId: "english",
    label: "Word workshop",
    blurb: "What words mean and how to use them",
    emoji: "💬",
    codePrefix: "VOC",
    order: 6,
  },
  {
    id: "figures",
    subjectId: "english",
    label: "Figure forest",
    blurb: "Similes, idioms and word pictures",
    emoji: "🎭",
    codePrefix: "FIG",
    order: 7,
  },
  {
    id: "writing",
    subjectId: "english",
    label: "Story studio",
    blurb: "Build clear sentences and paragraphs",
    emoji: "📝",
    codePrefix: "WRI",
    order: 8,
  },
  {
    id: "number",
    subjectId: "mathematics",
    label: "Number nook",
    blurb: "Place value, rounding and counting",
    emoji: "🔢",
    codePrefix: "NUM",
    order: 1,
  },
  {
    id: "addsub",
    subjectId: "mathematics",
    label: "Add and subtract",
    blurb: "Sums, differences and word problems",
    emoji: "➕",
    codePrefix: "ADD",
    order: 2,
  },
  {
    id: "muldiv",
    subjectId: "mathematics",
    label: "Multiply and divide",
    blurb: "Times tables and sharing",
    emoji: "✖️",
    codePrefix: "MUL",
    order: 3,
  },
  {
    id: "fractions",
    subjectId: "mathematics",
    label: "Fraction falls",
    blurb: "Halves, quarters and equal parts",
    emoji: "🍕",
    codePrefix: "FRA",
    order: 4,
  },
  {
    id: "decimals",
    subjectId: "mathematics",
    label: "Decimal dunes",
    blurb: "Decimals, money and percentages",
    emoji: "💯",
    codePrefix: "DEC",
    order: 5,
  },
  {
    id: "geometry",
    subjectId: "mathematics",
    label: "Shape summit",
    blurb: "Angles, lines and solid shapes",
    emoji: "🔺",
    codePrefix: "GEO",
    order: 6,
  },
  {
    id: "measurement",
    subjectId: "mathematics",
    label: "Measure meadows",
    blurb: "Length, mass, time and area",
    emoji: "📏",
    codePrefix: "MEA",
    order: 7,
  },
  {
    id: "money-data",
    subjectId: "mathematics",
    label: "Money market",
    blurb: "Naira, change and simple charts",
    emoji: "💰",
    codePrefix: "MON",
    order: 8,
  },
  {
    id: "code-and-ai",
    subjectId: "code-ai",
    label: "Robot ridge",
    blurb: "Steps, loops, choices and AI",
    emoji: "🤖",
    codePrefix: "COD",
    order: 1,
  },
];

export const SUBJECT_PREFIX: Record<SubjectId, string> = {
  english: "ENG",
  mathematics: "MAT",
  "code-ai": "COD",
};

export const TOPICS_BY_SUBJECT: Record<SubjectId, readonly TopicDef[]> = {
  english: TOPICS.filter((t) => t.subjectId === "english"),
  mathematics: TOPICS.filter((t) => t.subjectId === "mathematics"),
  "code-ai": TOPICS.filter((t) => t.subjectId === "code-ai"),
};

export function topicById(id: string): TopicDef | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function subjectById(id: string): SubjectDef | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export const ROUND = {
  size: 8,
  /** At most this many spaced review questions can enter one round. */
  maxReviews: 3,
  questionSeconds: 25,
  /** Untimed mode still has a safety limit so a room cannot sit open forever. */
  untimedSeconds: 180,
  /** A child can read the explanation for this long before the next question auto-opens. */
  revealHoldMs: 60_000,
  answerGraceMs: 300,
} as const;

export const SCORING = {
  base: 100,
  maxSpeedBonus: 50,
  streakStep: 10,
  streakFreeAnswers: 1,
  streakCap: 30,
} as const;

export const REWARDS = {
  threeStarsAt: 7,
  twoStarsAt: 5,
  oneStarAt: 3,
  baseCoins: 10,
  coinsPerCorrect: 2,
} as const;

export const REVIEW_INTERVALS_DAYS = [1, 3, 7] as const;

export const LIMITS = {
  nameMin: 2,
  nameMax: 16,
  avatarCount: 12,
  optionCount: 4,
  noteMax: 400,
  maxRooms: 100,
  maxMessagesPerSecond: 20,
} as const;

export const TIMING = {
  idleRoomMs: 30 * 60 * 1000,
  idleCheckMs: 30_000,
  reconnectWindowSeconds: 30,
  syncIntervalMs: 20_000,
} as const;

export const ERROR_CODES = {
  badName: 4101,
  rateLimited: 4102,
  badRequest: 4103,
  roomBusy: 4104,
  roomClosed: 4105,
  matchInProgress: 4106,
} as const;

export const ERROR_MESSAGES = {
  BAD_NAME: "Pick a nickname with 2 to 16 letters, numbers or spaces.",
  RATE_LIMITED: "Too many tries. Wait a minute and try again.",
  BAD_REQUEST: "That request was not valid.",
  ROOM_BUSY: "The game is busy. Try again in a minute.",
  ROOM_CLOSED: "This round has closed. Start a new one.",
  MATCH_IN_PROGRESS: "A round is already open.",
} as const;
export type ErrorKey = keyof typeof ERROR_MESSAGES;

/** Fixed avatar set. Children never upload a photo. */
export const AVATARS = [
  { emoji: "🦁", label: "Lion" },
  { emoji: "🐘", label: "Elephant" },
  { emoji: "🦒", label: "Giraffe" },
  { emoji: "🐆", label: "Leopard" },
  { emoji: "🦅", label: "Eagle" },
  { emoji: "🐬", label: "Dolphin" },
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "🐢", label: "Tortoise" },
  { emoji: "🦜", label: "Parrot" },
  { emoji: "🐝", label: "Bee" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🐐", label: "Goat" },
] as const;

export const NICKNAME_ADJECTIVES = [
  "Brave",
  "Bright",
  "Swift",
  "Kind",
  "Clever",
  "Bold",
  "Calm",
  "Happy",
  "Sharp",
  "Sunny",
  "Wise",
  "Quick",
] as const;

export const NICKNAME_ANIMALS = [
  "Lion",
  "Eagle",
  "Dolphin",
  "Leopard",
  "Parrot",
  "Tortoise",
  "Butterfly",
  "Fox",
  "Bee",
  "Goat",
  "Giraffe",
  "Elephant",
] as const;

export function makeNickname(random: () => number = Math.random): string {
  const a = NICKNAME_ADJECTIVES[Math.floor(random() * NICKNAME_ADJECTIVES.length)] ?? "Brave";
  const b = NICKNAME_ANIMALS[Math.floor(random() * NICKNAME_ANIMALS.length)] ?? "Lion";
  const n = 1 + Math.floor(random() * 98);
  return `${a} ${b} ${n}`;
}

export const MSG = {
  // client to server
  sync: "sync",
  startRound: "start_round",
  answer: "answer",
  next: "next",
  leave: "leave_room",
  // server to client
  syncReply: "sync_reply",
  answerAck: "answer_ack",
  rejected: "rejected",
} as const;