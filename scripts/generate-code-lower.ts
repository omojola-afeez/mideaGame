import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById, type BandId } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Code and AI starter bank for the lower age bands.
 * Eight questions per level, twenty four in total. The live game never calls an AI service.
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
const SUBJECT_PREFIX = "COD";
const OUT = path.resolve("src/server/data/questions/7-9/code-ai");
const AUTHOR = "AI draft v1";

function ref(band: BandId): string {
  return band === "4-6" ? "NERDC Nursery 2 Computer Studies, computers" : "NERDC Primary 3 Computer Studies, computers";
}

// ---------------------------------------------------------------------------
// Band 7-9 (Explorers, Primary 2 to 4). Reading grade <= 3.5.
// ---------------------------------------------------------------------------
const BAND_7_9_BRONZE: Draft[] = [
  { text: "What is a computer?", correct: "A machine that follows instructions", distractors: ["A type of bird", "A garden tool", "A kind of fruit"], explanation: "A computer does the jobs people give it by following instructions.", ref: "NERDC Primary 3 Computer Studies, computers" },
  { text: "Which part of the computer helps you type?", correct: "The keyboard", distractors: ["The screen", "The speaker", "The mouse pad"], explanation: "A keyboard has keys used for typing letters and numbers.", ref: "NERDC Primary 3 Computer Studies, input devices" },
  { text: "Which part shows pictures and words?", correct: "The screen", distractors: ["The keyboard", "The plug", "The mouse"], explanation: "The screen displays words, pictures and games.", ref: "NERDC Primary 3 Computer Studies, output devices" },
  { text: "What is a robot?", correct: "A machine that does work for people", distractors: ["A toy that sings", "A story book", "A cooking pot"], explanation: "A robot is a machine built to help people with tasks.", ref: "NERDC Primary 3 Computer Studies, robots" },
  { text: "What is a program?", correct: "A set of instructions for a computer", distractors: ["A lunch menu", "A sports score", "A list of names"], explanation: "A program tells the computer the steps to follow.", ref: "NERDC Primary 3 Computer Studies, programs" },
  { text: "Which device moves the pointer on the screen?", correct: "The mouse", distractors: ["The monitor", "The keyboard", "The printer"], explanation: "A mouse moves the pointer and lets you click things.", ref: "NERDC Primary 3 Computer Studies, input devices" },
  { text: "What does a printer do?", correct: "Puts words on paper", distractors: ["Plays music", "Cooks food", "Cuts paper"], explanation: "A printer prints your work onto paper.", ref: "NERDC Primary 3 Computer Studies, output devices" },
  { text: "What is a computer game?", correct: "A game played on a computer", distractors: ["A board game", "A football match", "A card game"], explanation: "A computer game is an app you play on a computer.", ref: "NERDC Primary 3 Computer Studies, games" },
];

const BAND_7_9_SILVER: Draft[] = [
  { text: "A robot moves 2 steps, then again. How many steps is that?", correct: "4 steps", distractors: ["2 steps", "3 steps", "5 steps"], explanation: "Two steps twice means 2 plus 2, which is 4 steps.", ref: "NERDC Primary 3 Computer Studies, counting steps" },
  { text: "Which of these is best done by a computer?", correct: "Adding many numbers quickly", distractors: ["Climbing a tree", "Cooking rice", "Singing a song"], explanation: "Computers add many numbers far faster than people can.", ref: "NERDC Primary 3 Computer Studies, uses of computers" },
  { text: "Why is a keyboard useful?", correct: "It lets you type words fast", distractors: ["It plays songs", "It keeps you warm", "It cleans the desk"], explanation: "Keyboard keys let you type letters into the computer.", ref: "NERDC Primary 3 Computer Studies, keyboard" },
  { text: "What should you not share online?", correct: "Your home address", distractors: ["A story you like", "Your favourite colour", "A puzzle"], explanation: "Keep your address private so strangers cannot reach you.", ref: "NERDC Primary 3 Computer Studies, online safety" },
  { text: "What does a mouse help you do?", correct: "Point and click on the screen", distractors: ["Type your name", "Print a picture", "Listen to music"], explanation: "A mouse moves the pointer and clicks on items.", ref: "NERDC Primary 3 Computer Studies, mouse" },
  { text: "What is a bug in a program?", correct: "A mistake in the instructions", distractors: ["A small animal", "A broken screen", "A loud noise"], explanation: "A bug is a mistake that makes a program misbehave.", ref: "NERDC Primary 3 Computer Studies, bugs" },
  { text: "Which step repeats again and again?", correct: "Clap, clap, clap", distractors: ["Clap once", "Sit down", "Look away"], explanation: "Clap, clap, clap is the same step done again and again.", ref: "NERDC Primary 3 Computer Studies, loops" },
  { text: "Who should check what a computer tells you?", correct: "You or a trusted adult", distractors: ["Nobody", "Anyone online", "A random stranger"], explanation: "Computers can be wrong, so check important answers.", ref: "NERDC Primary 3 Computer Studies, checking outputs" },
];

const BAND_7_9_GOLD: Draft[] = [
  { text: "A robot turns left, then forward. It does this 3 times. How many turns is that?", correct: "3 turns", distractors: ["2 turns", "4 turns", "6 turns"], explanation: "One turn repeated three times is three turns.", ref: "NERDC Primary 4 Computer Studies, loops" },
  { text: "Why is it good to test a program before using it?", correct: "To find and fix mistakes", distractors: ["To make it faster", "To add more colours", "To share it online"], explanation: "Testing reveals mistakes so they can be fixed early.", ref: "NERDC Primary 4 Computer Studies, testing" },
  { text: "Which of these is a sensible use of AI?", correct: "Suggesting songs you may enjoy", distractors: ["Cooking your dinner", "Carrying you home", "Doing your homework for you"], explanation: "AI can suggest things, but it cannot do your work for you.", ref: "NERDC Primary 4 Computer Studies, uses of AI" },
  { text: "A computer gives a wrong answer. Why?", correct: "Its instructions are wrong", distractors: ["Its desk is wrong", "Its colour is wrong", "Its plug is wrong"], explanation: "Computers follow their instructions, so wrong steps give wrong answers.", ref: "NERDC Primary 4 Computer Studies, errors" },
  { text: "Why should you not trust everything an AI says?", correct: "AI can be wrong", distractors: ["AI is always bored", "AI only tells jokes", "AI needs money"], explanation: "AI makes mistakes, so important answers should be checked.", ref: "NERDC Primary 4 Computer Studies, AI limits" },
  { text: "A robot is told: if the ball is red, pick it up. The ball is blue. What does the robot do?", correct: "Does not pick it up", distractors: ["Picks it up anyway", "Runs away", "Asks for help"], explanation: "The condition only applies to red balls, so it leaves the blue ball.", ref: "NERDC Primary 4 Computer Studies, conditions" },
  { text: "Why keep your password private?", correct: "So strangers cannot use your account", distractors: ["So you forget it less", "So the computer runs faster", "So your friends can help"], explanation: "A password keeps your account safe from strangers.", ref: "NERDC Primary 4 Computer Studies, passwords" },
  { text: "Which job could a computer do faster than a person?", correct: "Adding thousands of numbers", distractors: ["Drawing a picture by hand", "Cooking a meal", "Planting yams"], explanation: "Computers handle thousands of sums in a second.", ref: "NERDC Primary 4 Computer Studies, computer speed" },
];

// ---------------------------------------------------------------------------
// Band 4-6 (Sprouts, Nursery to Primary 1). Reading grade <= 1.5. Very simple.
// ---------------------------------------------------------------------------
const BAND_4_6_BRONZE: Draft[] = [
  { text: "What is a computer?", correct: "A machine", distractors: ["A bird", "A tree", "A stone"], explanation: "A computer is a smart machine.", ref: ref("4-6") },
  { text: "What do we use a computer for?", correct: "Learning", distractors: ["Sleeping", "Eating", "Swimming"], explanation: "Computers help us learn and play.", ref: ref("4-6") },
  { text: "Which part do you press to type?", correct: "The keyboard", distractors: ["The screen", "The mouse", "The plug"], explanation: "You press keys on the keyboard.", ref: ref("4-6") },
  { text: "Which part shows pictures?", correct: "The screen", distractors: ["The mouse", "The keyboard", "The cable"], explanation: "The screen shows words and pictures.", ref: ref("4-6") },
  { text: "What is a robot?", correct: "A helper machine", distractors: ["A pet dog", "A cooking pot", "A story book"], explanation: "A robot is a smart helper machine.", ref: ref("4-6") },
  { text: "What can a computer do?", correct: "Add numbers", distractors: ["Fly a plane", "Grow food", "Build a house"], explanation: "Computers can add numbers quickly.", ref: ref("4-6") },
  { text: "Which one is a computer?", correct: "A laptop", distractors: ["A banana", "A chair", "A bag"], explanation: "A laptop is a small computer.", ref: ref("4-6") },
  { text: "What do you click with?", correct: "A mouse", distractors: ["A fork", "A drum", "A shoe"], explanation: "A mouse helps you click on the screen.", ref: ref("4-6") },
];

const BAND_4_6_SILVER: Draft[] = [
  { text: "A computer helps you do what?", correct: "Add up numbers", distractors: ["Climb a ladder", "Boil water", "Wash clothes"], explanation: "Computers are very good at adding numbers.", ref: ref("4-6") },
  { text: "Which part do you move to see things move on the screen?", correct: "The mouse", distractors: ["The cable", "The speaker", "The plug"], explanation: "Moving the mouse moves the pointer.", ref: ref("4-6") },
  { text: "What should you do with a computer?", correct: "Use it kindly", distractors: ["Throw it", "Bite it", "Break it"], explanation: "Be gentle with computers.", ref: ref("4-6") },
  { text: "What does a screen show?", correct: "Words and pictures", distractors: ["Only silence", "Only heat", "Only smell"], explanation: "The screen shows words, pictures and games.", ref: ref("4-6") },
  { text: "Why do people like computers?", correct: "They help with work", distractors: ["They are noisy", "They are big", "They are heavy"], explanation: "Computers help people work and learn.", ref: ref("4-6") },
  { text: "Which one is not a computer?", correct: "A spoon", distractors: ["A laptop", "A tablet", "A phone"], explanation: "A spoon is not a computer.", ref: ref("4-6") },
  { text: "What keeps your computer safe?", correct: "A password", distractors: ["A sticker", "A crayon", "A spoon"], explanation: "A password stops others using it.", ref: ref("4-6") },
  { text: "A robot can do what?", correct: "Repeat a task", distractors: ["Sleep for you", "Eat for you", "Walk for you"], explanation: "Robots can repeat the same job again and again.", ref: ref("4-6") },
];

const BAND_4_6_GOLD: Draft[] = [
  { text: "Why is a computer fast?", correct: "It does sums quickly", distractors: ["It is big", "It is heavy", "It is quiet"], explanation: "Computers do sums far faster than people.", ref: ref("4-6") },
  { text: "Why do we not share our password?", correct: "To keep things safe", distractors: ["To lose it", "To forget it", "To share it"], explanation: "A password keeps your things safe.", ref: ref("4-6") },
  { text: "A robot follows what?", correct: "Instructions", distractors: ["Feelings", "Dreams", "Songs"], explanation: "Robots do what we tell them.", ref: ref("4-6") },
  { text: "What must a computer have to work?", correct: "Instructions", distractors: ["A hat", "A toy", "A snack"], explanation: "A computer needs instructions to do any job.", ref: ref("4-6") },
  { text: "Why is it nice to ask before using a computer?", correct: "Grown-ups help us use it well", distractors: ["So we press more keys", "So we break it", "So we lose the mouse"], explanation: "A grown-up can keep you safe and help you learn.", ref: ref("4-6") },
  { text: "What must a computer obey?", correct: "Instructions", distractors: ["Feelings", "Dreams", "Songs"], explanation: "A computer follows the steps people give it.", ref: ref("4-6") },
  { text: "Which is kind to the computer?", correct: "Being gentle with it", distractors: ["Hitting it", "Throwing it", "Dropping it"], explanation: "Be gentle and the computer works well.", ref: ref("4-6") },
  { text: "Why should you ask before you share a photo?", correct: "Not everyone has permission", distractors: ["So it looks nice", "So it grows", "So it flies"], explanation: "Always ask before you share a photo of someone.", ref: ref("4-6") },
];

const LEVELS: Record<BandId, Record<Level, Draft[]>> = {
  "4-6": { bronze: BAND_4_6_BRONZE, silver: BAND_4_6_SILVER, gold: BAND_4_6_GOLD },
  "7-9": { bronze: BAND_7_9_BRONZE, silver: BAND_7_9_SILVER, gold: BAND_7_9_GOLD },
  "10-12": { bronze: [], silver: [], gold: [] },
};

const TOPIC = TOPICS.find((t) => t.id === "code-and-ai")!;

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

const BAND_IDS: Array<"4-6" | "7-9"> = ["4-6", "7-9"];

for (const bandId of BAND_IDS) {
  const band = bandById(bandId)!;
  const out = path.resolve(`src/server/data/questions/${bandId}/code-ai`);
  mkdirSync(out, { recursive: true });
  const questions: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = LEVELS[bandId][level];
    if (drafts.length !== 8) {
      console.error(`${bandId} ${level}: expected 8, found ${drafts.length}`);
      process.exitCode = 1;
      continue;
    }
    drafts.forEach((d, i) => {
      const index = i % 4;
      questions.push({
        code: `${band.token}-${SUBJECT_PREFIX}-COD-${LEVEL_LETTER[level]}-${String(i + 1).padStart(3, "0")}`,
        band: band.id,
        subject: "code-ai",
        topic: "code-and-ai",
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
  const file: TopicFile = { band: band.id, subject: "code-ai", topic: "code-and-ai", title: TOPIC.label, questions };
  const issues = validateTopicFile(file, {});
  const bad = issues.filter((i) => i.severity === "error");
  if (!isClean(issues)) {
    process.exitCode = 1;
    console.error(`\n${bandId}/code-and-ai: ${bad.length} errors`);
    for (const issue of bad.slice(0, 12)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
  } else {
    console.log(`${bandId}/code-and-ai: ${questions.length} questions clean`);
  }
  writeFileSync(path.join(out, "code-and-ai.json"), JSON.stringify(file, null, 2) + "\n");
}
