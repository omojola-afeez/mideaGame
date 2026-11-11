import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/** Integrated Science body-health topic for band 10-12. Hand authored, checked by the validator. */

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
const REF = "NERDC Primary 5 Integrated Science, the human body";

const BRONZE: Draft[] = [
  { text: "Which organ pumps blood around the body?", correct: "The heart", distractors: ["The lungs", "The liver", "The stomach"], explanation: "The heart pumps blood to every part of the body.", ref: REF },
  { text: "Which organs help us breathe?", correct: "The lungs", distractors: ["The kidneys", "The heart", "The brain"], explanation: "The lungs take in oxygen and let out carbon dioxide.", ref: REF },
  { text: "How many senses do people have?", correct: "Five", distractors: ["Three", "Four", "Seven"], explanation: "Sight, hearing, touch, taste and smell.", ref: REF },
  { text: "Which sense do you use to see colours?", correct: "Sight", distractors: ["Smell", "Touch", "Hearing"], explanation: "The eyes use the sense of sight to see colours.", ref: REF },
  { text: "Which organ thinks and controls the body?", correct: "The brain", distractors: ["The heart", "The stomach", "The lungs"], explanation: "The brain controls movement, feelings and thinking.", ref: REF },
  { text: "What does the skin protect?", correct: "The body inside", distractors: ["The clothes", "The hair", "The shoes"], explanation: "Skin protects the organs and tissues underneath it.", ref: REF },
  { text: "Which organ turns food into energy?", correct: "The stomach", distractors: ["The lungs", "The eyes", "The skin"], explanation: "The stomach helps break food into small parts the body can use.", ref: REF },
  { text: "Why do we need to sleep?", correct: "So our bodies can rest and repair", distractors: ["To grow taller overnight", "To lose weight", "To avoid homework"], explanation: "Sleep lets the body and brain rest and repair.", ref: REF },
];

const SILVER: Draft[] = [
  { text: "Why do we need to wash our hands before meals?", correct: "To remove germs", distractors: ["To stay cool", "To smell nice", "To keep skin soft"], explanation: "Washing hands removes germs that can make us ill.", ref: REF },
  { text: "What does a balanced diet include?", correct: "Many different kinds of food", distractors: ["Only rice and beans", "Only fruits", "Only snacks"], explanation: "A balanced diet gives the body many nutrients from different foods.", ref: REF },
  { text: "Why is exercise good for the body?", correct: "It keeps the heart and muscles strong", distractors: ["It makes us sleepy", "It stops us eating", "It makes skin darker"], explanation: "Exercise strengthens the heart, muscles and bones.", ref: REF },
  { text: "How does the body get rid of waste liquid?", correct: "Through urine", distractors: ["Through sweat only", "Through tears", "Through saliva"], explanation: "The kidneys filter waste from the blood into urine.", ref: REF },
  { text: "Why is clean drinking water important?", correct: "It prevents sickness from dirty water", distractors: ["It tastes sweet", "It makes us stronger", "It is free"], explanation: "Unsafe water carries germs that cause diarrhoea and other illness.", ref: REF },
  { text: "What happens when you do not get enough vitamins?", correct: "You can fall ill more often", distractors: ["You grow faster", "You never feel tired", "Your bones grow stronger"], explanation: "Vitamins help the body fight illness, so too little makes us sick.", ref: REF },
  { text: "Why should we brush our teeth twice a day?", correct: "To remove food and keep gums healthy", distractors: ["To make teeth whiter", "To smell like mint", "To clean the tongue"], explanation: "Brushing removes leftover food and plaque that decay teeth.", ref: REF },
  { text: "How do vaccines protect the body?", correct: "They teach the body to fight diseases", distractors: ["They make you taller", "They cure old injuries", "They stop hunger"], explanation: "Vaccines train the immune system to recognise and fight germs.", ref: REF },
];

const GOLD: Draft[] = [
  { text: "Why does the body need a mix of foods, not just one type?", correct: "Different foods give different nutrients", distractors: ["To make meals colourful", "To save money", "To avoid cooking"], explanation: "No single food has everything the body needs, so we mix foods.", ref: REF },
  { text: "How does sleep improve learning and memory?", correct: "The brain sorts and stores memories while we rest", distractors: ["It stretches the brain", "It cools the body down", "It cleans the eyes"], explanation: "During sleep the brain files away the day's learning.", ref: REF },
  { text: "Why is smoking harmful to the lungs?", correct: "The smoke damages lung tissue and makes breathing hard", distractors: ["It builds up cough sweets", "It keeps lungs warm", "It makes the voice deeper"], explanation: "Smoke carries chemicals that injure lungs and raise disease risk.", ref: REF },
  { text: "Which habit best protects the eyes in bright sun?", correct: "Wearing a hat or shades outdoors", distractors: ["Staring at the sun", "Closing one eye", "Rubbing them often"], explanation: "Shade protects the eyes from strong sunlight that harms sight.", ref: REF },
  { text: "How can a school stop the spread of germs?", correct: "Clean hands, clean classrooms and clean water", distractors: ["By buying more fans", "By painting the walls", "By planting more trees"], explanation: "Hygiene like hand washing and clean toilets stops germs spreading.", ref: REF },
  { text: "Why is exercise good for children?", correct: "It builds strong bones and a healthy heart", distractors: ["It shortens the day", "It reduces appetite", "It speeds up growing"], explanation: "Activity strengthens bones, muscles and the heart during growth.", ref: REF },
  { text: "What does the liver do in the body?", correct: "It filters blood and stores energy", distractors: ["It pumps blood", "It digests food in the mouth", "It breathes for us"], explanation: "The liver filters blood, makes bile and stores sugar for energy.", ref: REF },
  { text: "Why should children drink enough clean water daily?", correct: "It keeps the body cool and blood flowing", distractors: ["It replaces breakfast", "It makes teeth whiter", "It increases weight"], explanation: "Water cools the body, carries nutrients and removes waste.", ref: REF },
];

const LEVELS: Record<Level, Draft[]> = { bronze: BRONZE, silver: SILVER, gold: GOLD };

const LEVEL_NUM: Record<Level, number[]> = {
  bronze: [1, 2, 3, 4, 5, 6, 7, 8],
  silver: [1, 2, 3, 4, 5, 6, 7, 8],
  gold: [1, 2, 3, 4, 5, 6, 7, 8],
};

function optionsFor(correct: string, distractors: string[], index: number): string[] {
  const options = [...distractors];
  options.splice(index, 0, correct);
  return options;
}

const questions: Question[] = [];
for (const level of ["bronze", "silver", "gold"] as const) {
  const drafts = LEVELS[level];
  if (drafts.length !== 8) throw new Error(`${level} needs 8 drafts, found ${drafts.length}`);
  drafts.forEach((d, i) => {
    const index = i % 4;
    questions.push({
      code: `${BAND.token}-${SUBJECT_PREFIX}-BOD-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
      band: BAND.id,
      subject: "science",
      topic: "body-health",
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

const topic = TOPICS.find((t) => t.id === "body-health")!;
const file: TopicFile = { band: BAND.id, subject: "science", topic: "body-health", title: topic.label, questions };

mkdirSync(OUT, { recursive: true });
const issues = validateTopicFile(file, {});
const bad = issues.filter((i) => i.severity === "error");
if (!isClean(issues)) {
  process.exitCode = 1;
  for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code} [${issue.field ?? ""}] ${issue.message}`);
} else {
  console.log(`body-health: ${questions.length} questions clean`);
}
writeFileSync(path.join(OUT, "body-health.json"), JSON.stringify(file, null, 2) + "\n");
