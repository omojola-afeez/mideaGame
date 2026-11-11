export const GAME_NAME = "Brainwave Quest";
export const ROOM_TYPE = "quest";
export const PROGRESS_KEY = "brainwave-quest-progress-v1";

export const BAND_IDS = ["4-6", "7-9", "10-12"] as const;
export type BandId = (typeof BAND_IDS)[number];

export interface BandDef {
  id: BandId;
  label: string;
  ages: string;
  classes: string;
  /** Flesch-Kincaid grade ceiling for questions in this band. */
  readingGrade: number;
  /** Short token used as the leading segment of a question code, for example 7-ENG-COM-B-001. */
  token: string;
}

/**
 * Three age bands. A child picks one at sign up and only ever sees questions
 * from that band, so a five year old never meets a Primary 6 passage.
 */
export const BANDS: readonly BandDef[] = [
  { id: "4-6", label: "Sprouts", ages: "4 to 6", classes: "Nursery 1 to Primary 1", readingGrade: 1.5, token: "4" },
  { id: "7-9", label: "Explorers", ages: "7 to 9", classes: "Primary 2 to 4", readingGrade: 3.5, token: "7" },
  { id: "10-12", label: "Adventurers", ages: "10 to 12", classes: "Primary 5 to 6", readingGrade: 6.5, token: "10" },
];

export function bandById(id: string): BandDef | undefined {
  return BANDS.find((b) => b.id === id);
}

/** The band a question code belongs to, read from its leading token. */
export function bandTokenFor(code: string): string | undefined {
  return code.split("-")[0];
}

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

export type SubjectId =
  | "english"
  | "mathematics"
  | "science"
  | "home-economics"
  | "social-studies"
  | "arabic"
  | "code-ai";
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
  | "living-things"
  | "matter"
  | "energy"
  | "earth-space"
  | "body-health"
  | "nutrition"
  | "home-care"
  | "food-cook"
  | "family"
  | "community"
  | "civic"
  | "culture"
  | "arabic-alphabet"
  | "arabic-words"
  | "arabic-reading"
  | "arabic-numbers"
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
  {
    id: "science",
    label: "Integrated Science",
    short: "Science",
    emoji: "🔬",
    blurb: "Living things, matter and energy",
    tone: "mint",
  },
  {
    id: "home-economics",
    label: "Home Economics",
    short: "Home Econ",
    emoji: "🍽️",
    blurb: "Food, nutrition and home care",
    tone: "violet",
  },
  {
    id: "social-studies",
    label: "Social Studies",
    short: "Social",
    emoji: "🌍",
    blurb: "Family, community and our country",
    tone: "cyan",
  },
  {
    id: "arabic",
    label: "Arabic",
    short: "Arabic",
    emoji: "🕌",
    blurb: "Letters, words and reading",
    tone: "violet",
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
  {
    id: "living-things",
    subjectId: "science",
    label: "Life lane",
    blurb: "Plants, animals and how they live",
    emoji: "🌱",
    codePrefix: "LIV",
    order: 1,
  },
  {
    id: "matter",
    subjectId: "science",
    label: "Matter marsh",
    blurb: "Solids, liquids, mixtures and materials",
    emoji: "🧪",
    codePrefix: "MAT",
    order: 2,
  },
  {
    id: "energy",
    subjectId: "science",
    label: "Energy edge",
    blurb: "Light, heat, sound and force",
    emoji: "⚡",
    codePrefix: "ENE",
    order: 3,
  },
  {
    id: "earth-space",
    subjectId: "science",
    label: "Sky summit",
    blurb: "Earth, weather, water and space",
    emoji: "🌏",
    codePrefix: "EAR",
    order: 4,
  },
  {
    id: "body-health",
    subjectId: "science",
    label: "Body bay",
    blurb: "Bodies, the senses and staying healthy",
    emoji: "🫀",
    codePrefix: "BOD",
    order: 5,
  },
  {
    id: "nutrition",
    subjectId: "home-economics",
    label: "Food field",
    blurb: "Food groups and eating well",
    emoji: "🥗",
    codePrefix: "NUT",
    order: 1,
  },
  {
    id: "home-care",
    subjectId: "home-economics",
    label: "Home harbour",
    blurb: "Cleaning, safety and caring for a home",
    emoji: "🏠",
    codePrefix: "HOM",
    order: 2,
  },
  {
    id: "food-cook",
    subjectId: "home-economics",
    label: "Kitchen cove",
    blurb: "Cooking tools, steps and simple recipes",
    emoji: "🍳",
    codePrefix: "COO",
    order: 3,
  },
  {
    id: "family",
    subjectId: "social-studies",
    label: "Family forest",
    blurb: "Family, roles and people who help us",
    emoji: "👨‍👩‍👧",
    codePrefix: "FAM",
    order: 1,
  },
  {
    id: "community",
    subjectId: "social-studies",
    label: "Community coast",
    blurb: "Markets, roads and places around us",
    emoji: "🏘️",
    codePrefix: "COM",
    order: 2,
  },
  {
    id: "civic",
    subjectId: "social-studies",
    label: "Duty dunes",
    blurb: "Rules, honesty and being a good citizen",
    emoji: "🤝",
    codePrefix: "CIV",
    order: 3,
  },
  {
    id: "culture",
    subjectId: "social-studies",
    label: "Culture crests",
    blurb: "Languages, festivals and Nigerian heritage",
    emoji: "🎭",
    codePrefix: "CUL",
    order: 4,
  },
  {
    id: "arabic-alphabet",
    subjectId: "arabic",
    label: "Letter lagoon",
    blurb: "Arabic letters and how they sound",
    emoji: "🅰️",
    codePrefix: "ARA",
    order: 1,
  },
  {
    id: "arabic-words",
    subjectId: "arabic",
    label: "Word waters",
    blurb: "Everyday words and simple phrases",
    emoji: "💬",
    codePrefix: "WRD",
    order: 2,
  },
  {
    id: "arabic-reading",
    subjectId: "arabic",
    label: "Read reef",
    blurb: "Short passages and understanding",
    emoji: "📖",
    codePrefix: "RED",
    order: 3,
  },
  {
    id: "arabic-numbers",
    subjectId: "arabic",
    label: "Number nest",
    blurb: "Numbers and counting in Arabic",
    emoji: "🔢",
    codePrefix: "NUM",
    order: 4,
  },
];

export const SUBJECT_PREFIX: Record<SubjectId, string> = {
  english: "ENG",
  mathematics: "MAT",
  science: "SCI",
  "home-economics": "HEC",
  "social-studies": "SOC",
  arabic: "ARB",
  "code-ai": "COD",
};

export const TOPICS_BY_SUBJECT: Record<SubjectId, readonly TopicDef[]> = {
  english: TOPICS.filter((t) => t.subjectId === "english"),
  mathematics: TOPICS.filter((t) => t.subjectId === "mathematics"),
  science: TOPICS.filter((t) => t.subjectId === "science"),
  "home-economics": TOPICS.filter((t) => t.subjectId === "home-economics"),
  "social-studies": TOPICS.filter((t) => t.subjectId === "social-studies"),
  arabic: TOPICS.filter((t) => t.subjectId === "arabic"),
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