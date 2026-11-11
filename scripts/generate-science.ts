import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Integrated Science starter bank. Written by hand, checked by the validator.
 * Eight questions per level, twenty four per topic. The live game never calls an AI service.
 */

type Level = "bronze" | "silver" | "gold";
interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
  ref: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "SCI";
const OUT = path.resolve("src/server/data/questions/10-12/science");
const BAND = bandById("10-12")!;
const AUTHOR = "AI draft v1";

const REFS = {
  "living-things": "NERDC Primary 5 Integrated Science, living things",
  matter: "NERDC Primary 5 Integrated Science, matter and materials",
  energy: "NERDC Primary 5 Integrated Science, energy and force",
  "earth-space": "NERDC Primary 5 Integrated Science, earth and space",
  "body-health": "NERDC Primary 5 Integrated Science, the human body",
};

const LIVING_BRONZE: Draft[] = [
  {
    text: "Which of these is a living thing?",
    correct: "A mango tree",
    distractors: ["A bicycle", "A stone", "A plate"],
    explanation: "A mango tree grows and makes its own food.",
    ref: REFS["living-things"],
  },
  {
    text: "What do plants need from sunlight to make food?",
    correct: "Energy",
    distractors: ["Water", "Oxygen", "Carbon"],
    explanation: "Sunlight gives plants the energy to make food.",
    ref: REFS["living-things"],
  },
  {
    text: "Which part of a plant takes in water from the soil?",
    correct: "The roots",
    distractors: ["The leaves", "The flowers", "The stem"],
    explanation: "Roots pull water from the soil into the plant.",
    ref: REFS["living-things"],
  },
  {
    text: "What do animals breathe in to stay alive?",
    correct: "Oxygen",
    distractors: ["Carbon dioxide", "Nitrogen", "Helium"],
    explanation: "Animals need oxygen from the air to live.",
    ref: REFS["living-things"],
  },
  {
    text: "Which of these is not a living thing?",
    correct: "A chair",
    distractors: ["A dog", "A mango tree", "A fish"],
    explanation: "A chair is made by people and cannot grow.",
    ref: REFS["living-things"],
  },
  {
    text: "What do herbivores eat?",
    correct: "Plants",
    distractors: ["Meat", "Fish", "Bones"],
    explanation: "Herbivores eat only plants.",
    ref: REFS["living-things"],
  },
  {
    text: "What gas do green plants give out in sunlight?",
    correct: "Oxygen",
    distractors: ["Carbon", "Nitrogen", "Steam"],
    explanation: "Plants give out oxygen when they make food.",
    ref: REFS["living-things"],
  },
  {
    text: "Which organ pumps blood around the body?",
    correct: "The heart",
    distractors: ["The lungs", "The liver", "The stomach"],
    explanation: "The heart pumps blood to all parts of the body.",
    ref: REFS["living-things"],
  },
];

const LIVING_SILVER: Draft[] = [
  {
    text: "Why do animals need to eat food?",
    correct: "To get energy and grow",
    distractors: ["To change colour", "To sleep better", "To make noise"],
    explanation: "Food gives animals energy to live and grow.",
    ref: REFS["living-things"],
  },
  {
    text: "Why do plant eaters have flat teeth?",
    correct: "To grind tough leaves",
    distractors: ["To tear meat", "To bite bones", "To catch fish"],
    explanation: "Flat teeth help plant eaters chew grass and leaves.",
    ref: REFS["living-things"],
  },
  {
    text: "What happens to plants that get no sunlight?",
    correct: "They cannot make food",
    distractors: ["They grow faster", "They turn blue", "They bloom more"],
    explanation: "Plants need sunlight to make food by photosynthesis.",
    ref: REFS["living-things"],
  },
  {
    text: "Why do frogs live near water?",
    correct: "To keep their skin moist",
    distractors: ["To drink salty water", "To find stones", "To fly longer"],
    explanation: "Frogs breathe through their moist skin, so they stay near water.",
    ref: REFS["living-things"],
  },
  {
    text: "Which gas do plants take in from the air?",
    correct: "Carbon dioxide",
    distractors: ["Oxygen", "Nitrogen", "Steam"],
    explanation: "Plants take in carbon dioxide and release oxygen.",
    ref: REFS["living-things"],
  },
  {
    text: "What does a food chain show?",
    correct: "Who eats who in nature",
    distractors: ["How to cook food", "Where to buy fish", "How plants grow"],
    explanation: "A food chain shows how energy passes from one living thing to another.",
    ref: REFS["living-things"],
  },
  {
    text: "Why do farmers plant trees in place of forests that were cut down?",
    correct: "To replace the trees for the future",
    distractors: ["To make the farm bigger", "To block the road", "To sell the shade"],
    explanation: "Replanting replaces trees so forests can recover.",
    ref: REFS["living-things"],
  },
  {
    text: "Which living thing makes its own food?",
    correct: "A green plant",
    distractors: ["A goat", "An eagle", "A farmer"],
    explanation: "Green plants make their own food using sunlight.",
    ref: REFS["living-things"],
  },
];

function optionsFor(correct: string, pool: readonly string[], index: number): string[] {
  const seen = new Set([correct]);
  const wrong: string[] = [];
  for (const candidate of pool) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    wrong.push(candidate);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) throw new Error(`not enough distractors for ${correct}`);
  const options = [...wrong];
  options.splice(index, 0, correct);
  return options;
}

const LIVING_GOLD: Draft[] = [
  {
    text: "Why are food chains important?",
    correct: "They show how living things depend on each other",
    distractors: ["They help animals sleep", "They make farming easier", "They stop rain"],
    explanation: "Food chains link plants and animals, so each depends on others for food.",
    ref: REFS["living-things"],
  },
  {
    text: "What would happen if all the grass in a field disappeared?",
    correct: "Grass-eating animals would have no food",
    distractors: ["Nothing would change", "The soil would freeze", "Birds would stop singing"],
    explanation: "Herbivores eat grass, so losing it would starve them and the meat-eaters that follow.",
    ref: REFS["living-things"],
  },
  {
    text: "How do thick forests help the environment?",
    correct: "They clean the air and give homes to animals",
    distractors: ["They block the roads", "They make the air dirtier", "They dry up rivers"],
    explanation: "Forests filter the air and shelter many plants and animals.",
    ref: REFS["living-things"],
  },
  {
    text: "Why must farmers avoid cutting down large forests?",
    correct: "It destroys homes for animals and soil health",
    distractors: ["It makes farming faster", "It increases rainfall", "It cools the earth"],
    explanation: "Large-scale clearing removes habitats and washes away rich soil.",
    ref: REFS["living-things"],
  },
  {
    text: "How are a leaf and a solar panel alike?",
    correct: "Both capture energy from sunlight",
    distractors: ["Both move by themselves", "Both grow taller", "Both make sound"],
    explanation: "A leaf and a solar panel both change sunlight into useful energy.",
    ref: REFS["living-things"],
  },
  {
    text: "Why are mushrooms and worms important in a forest?",
    correct: "They break down dead things for the soil",
    distractors: ["They sing at night", "They eat only fruit", "They hold up the trees"],
    explanation: "Mushrooms and worms turn dead matter into food for the soil.",
    ref: REFS["living-things"],
  },
  {
    text: "Why can a rabbit not be both a predator and prey?",
    correct: "A rabbit is hunted, it does not hunt others",
    distractors: ["A rabbit is too slow to hunt", "A rabbit has no teeth", "A rabbit eats stones"],
    explanation: "A rabbit is prey because it is eaten and does not hunt other animals.",
    ref: REFS["living-things"],
  },
  {
    text: "Which is the best way to protect a forest?",
    correct: "Plant new trees when others are cut down",
    distractors: ["Burn the forest", "Build houses inside", "Drain its rivers"],
    explanation: "Replanting replaces trees faster than they are lost, keeping the forest alive.",
    ref: REFS["living-things"],
  },
];

const LEVEL_NUM: Record<Level, number[]> = {
  bronze: [1, 2, 3, 4, 5, 6, 7, 8],
  silver: [1, 2, 3, 4, 5, 6, 7, 8],
  gold: [1, 2, 3, 4, 5, 6, 7, 8],
};

function toQuestions(topicId: string, prefix: string, levels: Record<Level, Draft[]>): Question[] {
  const out: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${BAND.token}-${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: BAND.id,
        subject: "science",
        topic: topicId as Question["topic"],
        level,
        text: d.text,
        options: optionsFor(d.correct, d.distractors, index),
        correctIndex: index,
        explanation: d.explanation,
        curriculumRef: d.ref,
        author: AUTHOR,
        reviewer: null,
        status: "draft",
      });
    });
  }
  return out;
}

interface TopicDef {
  id: string;
  prefix: string;
  levels: Record<Level, Draft[]>;
}

const BUILDERS: Record<string, TopicDef> = {
  "living-things": {
    id: "living-things",
    prefix: "LIV",
    levels: { bronze: LIVING_BRONZE, silver: LIVING_SILVER, gold: LIVING_GOLD },
  },
};

let errors = 0;
mkdirSync(OUT, { recursive: true });
for (const topicId of Object.keys(BUILDERS)) {
  const builder = BUILDERS[topicId]!;
  const topic = TOPICS.find((t) => t.id === builder.id);
  if (!topic) throw new Error(`unknown topic ${builder.id}`);
  const questions = toQuestions(builder.id, builder.prefix, builder.levels);
  const file: TopicFile = { band: BAND.id, subject: "science", topic: builder.id as never, title: topic.label, questions };
  const issues = validateTopicFile(file, {});
  const bad = issues.filter((i) => i.severity === "error");
  if (!isClean(issues)) {
    errors += bad.length;
    console.error(`\n${builder.id}: ${bad.length} errors`);
    for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
  } else {
    console.log(`${builder.id}: ${questions.length} questions clean`);
  }
  writeFileSync(path.join(OUT, `${builder.id}.json`), JSON.stringify(file, null, 2) + "\n");
}

if (errors > 0) process.exitCode = 1;
