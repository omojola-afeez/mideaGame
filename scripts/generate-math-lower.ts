import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { BandId } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Mathematics starter bank for the two lower age bands (4-6 Sprouts and 7-9 Explorers).
 * Written by hand, checked by the validator. Every arithmetic answer is an
 * expression evaluated at generation time, never typed by hand.
 * The live game never calls an AI service.
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
const SUBJECT_PREFIX = "MAT";
const AUTHOR = "AI draft v1";
const BAND_IDS = ["4-6", "7-9"] as const;

/** Topic code prefixes required for question codes. */
const TOPIC_PREFIX: Record<string, string> = {
  number: "NUM",
  addsub: "ADD",
  muldiv: "MUL",
  fractions: "FRA",
  decimals: "DEC",
  geometry: "GEO",
  measurement: "MEA",
  "money-data": "MON",
};

const TOPIC_PHRASE: Record<string, string> = {
  number: "numbers and counting",
  addsub: "addition and subtraction",
  muldiv: "multiplication and division",
  fractions: "fractions",
  decimals: "decimals and money",
  geometry: "shapes and solids",
  measurement: "measurement",
  "money-data": "money and simple charts",
};

/** NERDC class phrase per band. Band 4-6 spans Nursery 2 and Primary 1. */
function classFor(band: BandId, level: Level): string {
  if (band === "4-6") return level === "bronze" ? "Nursery 2" : "Primary 1";
  return "Primary 3";
}

function ref(band: BandId, level: Level, topic: string): string {
  return `NERDC ${classFor(band, level)} Mathematics, ${TOPIC_PHRASE[topic]}`;
}

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

const LEVEL_NUM: Record<Level, number[]> = {
  bronze: [1, 2, 3, 4, 5, 6, 7, 8],
  silver: [1, 2, 3, 4, 5, 6, 7, 8],
  gold: [1, 2, 3, 4, 5, 6, 7, 8],
};

function toQuestions(
  bandId: BandId,
  topicId: string,
  prefix: string,
  levels: Record<Level, Draft[]>,
): Question[] {
  const band = bandById(bandId)!;
  const out: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${bandId} ${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${band.token}-${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: band.id,
        subject: "mathematics",
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

/* ------------------------------------------------------------------ */
/* Band 4-6 (Sprouts, Nursery 2 to Primary 1)                          */
/* ------------------------------------------------------------------ */

const R46 = (level: Level, topic: string) => ref("4-6", level, topic);

const SPROUTS_NUMBER: Record<Level, Draft[]> = {
  bronze: [
    { text: "What comes after 5?", correct: String(5 + 1), distractors: ["4", "7", "8"], explanation: "The next number after 5 is 6.", ref: R46("bronze", "number") },
    { text: "What comes before 9?", correct: String(9 - 1), distractors: ["10", "7", "9"], explanation: "The number before 9 is 8.", ref: R46("bronze", "number") },
    { text: "Fingers on one hand?", correct: "5", distractors: ["4", "6", "10"], explanation: "One hand has 5 fingers.", ref: R46("bronze", "number") },
    { text: "What is 3 more than 4?", correct: String(4 + 3), distractors: ["6", "5", "8"], explanation: "4 plus 3 is 7.", ref: R46("bronze", "number") },
    { text: "How many tens make 20?", correct: String(20 / 10), distractors: ["1", "10", "4"], explanation: "Ten and ten make twenty.", ref: R46("bronze", "number") },
    { text: "Which number is bigger, 6 or 9?", correct: "9", distractors: ["6", "They are the same", "10"], explanation: "9 is greater than 6.", ref: R46("bronze", "number") },
    { text: "What is ten plus three?", correct: String(10 + 3), distractors: ["10", "30", "11"], explanation: "10 plus 3 makes 13.", ref: R46("bronze", "number") },
    { text: "What is 7 in words?", correct: "Seven", distractors: ["Six", "Eight", "Nine"], explanation: "7 is written as seven.", ref: R46("bronze", "number") },
  ],
  silver: [
    { text: "Which number is the greatest: 12, 21, 9, 18?", correct: "21", distractors: ["12", "18", "9"], explanation: "21 is bigger than the rest.", ref: R46("silver", "number") },
    { text: "Write 15 in words.", correct: "Fifteen", distractors: ["Thirteen", "Fourteen", "Sixteen"], explanation: "15 is written as fifteen.", ref: R46("silver", "number") },
    { text: "How many tens are in 40?", correct: String(40 / 10), distractors: ["2", "10", "14"], explanation: "Forty is made of 4 tens.", ref: R46("silver", "number") },
    { text: "What comes next: 5, 10, 15, ...?", correct: String(15 + 5), distractors: ["16", "18", "25"], explanation: "The pattern adds 5 each time.", ref: R46("silver", "number") },
    { text: "Which number is smaller, 14 or 41?", correct: "14", distractors: ["41", "They are the same", "44"], explanation: "14 is less than 41.", ref: R46("silver", "number") },
    { text: "Round 8 to the nearest 10.", correct: "10", distractors: ["0", "8", "100"], explanation: "8 is closer to 10 than to 0.", ref: R46("silver", "number") },
    { text: "How many ones are in 17?", correct: "7", distractors: ["1", "10", "17"], explanation: "17 has 1 ten and 7 ones.", ref: R46("silver", "number") },
    { text: "What is 25 in tens and ones?", correct: "2 tens and 5 ones", distractors: ["5 tens and 2 ones", "2 tens and 2 ones", "5 tens and 5 ones"], explanation: "25 is made of 2 tens and 5 ones.", ref: R46("silver", "number") },
  ],
  gold: [
    { text: "How many more is 9 than 5?", correct: String(9 - 5), distractors: ["5", "3", "14"], explanation: "9 minus 5 is 4.", ref: R46("gold", "number") },
    { text: "What number is 10 more than 8?", correct: String(8 + 10), distractors: ["16", "10", "28"], explanation: "8 plus 10 is 18.", ref: R46("gold", "number") },
    { text: "Which is even?", correct: "8", distractors: ["3", "5", "7"], explanation: "8 splits into two equal groups.", ref: R46("gold", "number") },
    { text: "Which is odd?", correct: "9", distractors: ["2", "4", "6"], explanation: "9 leaves 1 when split into two.", ref: R46("gold", "number") },
    { text: "What comes next: 10, 20, 30, ...?", correct: String(30 + 10), distractors: ["31", "35", "50"], explanation: "The pattern adds 10 each time.", ref: R46("gold", "number") },
    { text: "How many ones are in 23?", correct: "3", distractors: ["2", "13", "20"], explanation: "23 has 2 tens and 3 ones.", ref: R46("gold", "number") },
    { text: "Which number is the smallest: 15, 5, 25, 10?", correct: "5", distractors: ["10", "15", "25"], explanation: "5 is less than all the rest.", ref: R46("gold", "number") },
    { text: "Write 40 in words.", correct: "Forty", distractors: ["Four", "Fourteen", "Four hundred"], explanation: "40 is written as forty.", ref: R46("gold", "number") },
  ],
};

const SPROUTS_ADDSUB: Record<Level, Draft[]> = {
  bronze: [
    { text: "What is 3 + 2?", correct: String(3 + 2), distractors: ["4", "6", "1"], explanation: "3 plus 2 is 5.", ref: R46("bronze", "addsub") },
    { text: "What is 5 + 4?", correct: String(5 + 4), distractors: ["8", "10", "7"], explanation: "5 plus 4 is 9.", ref: R46("bronze", "addsub") },
    { text: "What is 7 - 2?", correct: String(7 - 2), distractors: ["4", "6", "9"], explanation: "7 take away 2 is 5.", ref: R46("bronze", "addsub") },
    { text: "What is 10 - 4?", correct: String(10 - 4), distractors: ["5", "7", "4"], explanation: "10 take away 4 is 6.", ref: R46("bronze", "addsub") },
    { text: "What is 6 + 3?", correct: String(6 + 3), distractors: ["8", "10", "3"], explanation: "6 plus 3 is 9.", ref: R46("bronze", "addsub") },
    { text: "What is 8 - 3?", correct: String(8 - 3), distractors: ["4", "6", "11"], explanation: "8 take away 3 is 5.", ref: R46("bronze", "addsub") },
    { text: "What is 2 + 7?", correct: String(2 + 7), distractors: ["8", "10", "5"], explanation: "2 plus 7 is 9.", ref: R46("bronze", "addsub") },
    { text: "What is 9 - 5?", correct: String(9 - 5), distractors: ["3", "5", "14"], explanation: "9 take away 5 is 4.", ref: R46("bronze", "addsub") },
  ],
  silver: [
    { text: "What is 12 + 5?", correct: String(12 + 5), distractors: ["16", "18", "15"], explanation: "12 plus 5 is 17.", ref: R46("silver", "addsub") },
    { text: "What is 15 - 6?", correct: String(15 - 6), distractors: ["8", "10", "21"], explanation: "15 take away 6 is 9.", ref: R46("silver", "addsub") },
    { text: "Ada has 4 mangoes. She buys 3 more. How many mangoes does she have?", correct: String(4 + 3), distractors: ["6", "8", "1"], explanation: "4 plus 3 is 7 mangoes.", ref: R46("silver", "addsub") },
    { text: "What is 20 + 8?", correct: String(20 + 8), distractors: ["27", "29", "100"], explanation: "20 plus 8 is 28.", ref: R46("silver", "addsub") },
    { text: "What is 18 - 9?", correct: String(18 - 9), distractors: ["8", "10", "27"], explanation: "18 take away 9 is 9.", ref: R46("silver", "addsub") },
    { text: "There are 10 birds. 3 fly away. How many are left?", correct: String(10 - 3), distractors: ["6", "13", "3"], explanation: "10 minus 3 is 7 birds.", ref: R46("silver", "addsub") },
    { text: "What is 14 + 4?", correct: String(14 + 4), distractors: ["17", "19", "10"], explanation: "14 plus 4 is 18.", ref: R46("silver", "addsub") },
    { text: "What is 16 - 7?", correct: String(16 - 7), distractors: ["8", "10", "23"], explanation: "16 take away 7 is 9.", ref: R46("silver", "addsub") },
  ],
  gold: [
    { text: "What is 11 + 7?", correct: String(11 + 7), distractors: ["17", "19", "16"], explanation: "11 plus 7 is 18.", ref: R46("gold", "addsub") },
    { text: "What is 13 - 6?", correct: String(13 - 6), distractors: ["6", "8", "19"], explanation: "13 take away 6 is 7.", ref: R46("gold", "addsub") },
    { text: "Chinedu has 9 marbles. He gives 4 away. How many does he keep?", correct: String(9 - 4), distractors: ["4", "6", "13"], explanation: "9 minus 4 is 5 marbles.", ref: R46("gold", "addsub") },
    { text: "What is 20 - 12?", correct: String(20 - 12), distractors: ["7", "9", "12"], explanation: "20 take away 12 is 8.", ref: R46("gold", "addsub") },
    { text: "What is 8 + 9?", correct: String(8 + 9), distractors: ["16", "18", "15"], explanation: "8 plus 9 is 17.", ref: R46("gold", "addsub") },
    { text: "Bola has 6 oranges. Her mum gives her 5 more. How many does she have?", correct: String(6 + 5), distractors: ["10", "12", "3"], explanation: "6 plus 5 is 11 oranges.", ref: R46("gold", "addsub") },
    { text: "What is 15 - 8?", correct: String(15 - 8), distractors: ["6", "8", "23"], explanation: "15 take away 8 is 7.", ref: R46("gold", "addsub") },
    { text: "What is 9 + 6?", correct: String(9 + 6), distractors: ["14", "16", "3"], explanation: "9 plus 6 is 15.", ref: R46("gold", "addsub") },
  ],
};

const SPROUTS_MULDIV: Record<Level, Draft[]> = {
  bronze: [
    { text: "Count by 2s: 2, 4, 6, ...?", correct: String(6 + 2), distractors: ["7", "9", "10"], explanation: "2, 4, 6, 8 counts by 2s.", ref: R46("bronze", "muldiv") },
    { text: "What is 1 group of 4?", correct: "4", distractors: ["1", "8", "5"], explanation: "1 group of 4 is just 4.", ref: R46("bronze", "muldiv") },
    { text: "Share 4 sweets between 2 children. How many does each get?", correct: String(4 / 2), distractors: ["1", "3", "4"], explanation: "4 shared by 2 is 2 each.", ref: R46("bronze", "muldiv") },
    { text: "What is 5 + 5?", correct: String(5 + 5), distractors: ["8", "9", "12"], explanation: "5 plus 5 is 10.", ref: R46("bronze", "muldiv") },
    { text: "Count by 5s: 5, 10, 15, ...?", correct: String(15 + 5), distractors: ["16", "18", "25"], explanation: "5, 10, 15, 20 counts by 5s.", ref: R46("bronze", "muldiv") },
    { text: "What is 2 groups of 2?", correct: String(2 * 2), distractors: ["2", "6", "3"], explanation: "2 groups of 2 is 4.", ref: R46("bronze", "muldiv") },
    { text: "Share 6 biscuits between 2 friends. How many each?", correct: String(6 / 2), distractors: ["2", "4", "6"], explanation: "6 shared by 2 is 3 each.", ref: R46("bronze", "muldiv") },
    { text: "What is 10 + 10?", correct: String(10 + 10), distractors: ["11", "100", "12"], explanation: "10 plus 10 is 20.", ref: R46("bronze", "muldiv") },
  ],
  silver: [
    { text: "What is 2 × 3?", correct: String(2 * 3), distractors: ["5", "8", "4"], explanation: "2 groups of 3 is 6.", ref: R46("silver", "muldiv") },
    { text: "What is 2 × 4?", correct: String(2 * 4), distractors: ["6", "10", "4"], explanation: "2 groups of 4 is 8.", ref: R46("silver", "muldiv") },
    { text: "What is 5 × 2?", correct: String(5 * 2), distractors: ["7", "12", "8"], explanation: "5 groups of 2 is 10.", ref: R46("silver", "muldiv") },
    { text: "What is 10 × 2?", correct: String(10 * 2), distractors: ["12", "100", "5"], explanation: "10 groups of 2 is 20.", ref: R46("silver", "muldiv") },
    { text: "What is 6 ÷ 2?", correct: String(6 / 2), distractors: ["2", "4", "12"], explanation: "6 shared into 2 groups is 3.", ref: R46("silver", "muldiv") },
    { text: "What is 8 ÷ 2?", correct: String(8 / 2), distractors: ["2", "3", "6"], explanation: "8 shared into 2 groups is 4.", ref: R46("silver", "muldiv") },
    { text: "What is 4 × 2?", correct: String(4 * 2), distractors: ["6", "10", "2"], explanation: "4 groups of 2 is 8.", ref: R46("silver", "muldiv") },
    { text: "Share 10 mangoes between 5 children. How many each?", correct: String(10 / 5), distractors: ["5", "3", "10"], explanation: "10 shared by 5 is 2 each.", ref: R46("silver", "muldiv") },
  ],
  gold: [
    { text: "Bola has 3 bags. 2 eggs in each. How many eggs?", correct: String(3 * 2), distractors: ["5", "8", "4"], explanation: "3 bags of 2 eggs is 6 eggs.", ref: R46("gold", "muldiv") },
    { text: "Share 15 sweets among 5 kids. How many each?", correct: String(15 / 5), distractors: ["5", "2", "10"], explanation: "15 shared by 5 is 3 each.", ref: R46("gold", "muldiv") },
    { text: "What is 2 × 6?", correct: String(2 * 6), distractors: ["8", "10", "14"], explanation: "2 groups of 6 is 12.", ref: R46("gold", "muldiv") },
    { text: "What is 5 × 4?", correct: String(5 * 4), distractors: ["15", "25", "9"], explanation: "5 groups of 4 is 20.", ref: R46("gold", "muldiv") },
    { text: "There are 4 tables. Each table has 2 chairs. How many chairs?", correct: String(4 * 2), distractors: ["6", "10", "4"], explanation: "4 tables of 2 chairs is 8.", ref: R46("gold", "muldiv") },
    { text: "What is 20 ÷ 2?", correct: String(20 / 2), distractors: ["4", "5", "2"], explanation: "20 shared into 2 groups is 10.", ref: R46("gold", "muldiv") },
    { text: "What is 10 ÷ 5?", correct: String(10 / 5), distractors: ["5", "3", "10"], explanation: "10 shared by 5 is 2.", ref: R46("gold", "muldiv") },
    { text: "What is 2 × 10?", correct: String(2 * 10), distractors: ["12", "100", "5"], explanation: "2 groups of 10 is 20.", ref: R46("gold", "muldiv") },
  ],
};

const SPROUTS_FRACTIONS: Record<Level, Draft[]> = {
  bronze: [
    { text: "Halves in one whole?", correct: "2", distractors: ["1", "3", "4"], explanation: "Two halves make one whole.", ref: R46("bronze", "fractions") },
    { text: "A pizza is cut into 2 equal parts. What is one part called?", correct: "One half", distractors: ["One quarter", "One whole", "One third"], explanation: "One of two equal parts is a half.", ref: R46("bronze", "fractions") },
    { text: "What is half of 2?", correct: String(2 / 2), distractors: ["2", "4", "0"], explanation: "Half of 2 is 1.", ref: R46("bronze", "fractions") },
    { text: "Quarters in one whole?", correct: "4", distractors: ["2", "3", "8"], explanation: "Four quarters make one whole.", ref: R46("bronze", "fractions") },
    { text: "What is half of 4?", correct: String(4 / 2), distractors: ["1", "4", "8"], explanation: "Half of 4 is 2.", ref: R46("bronze", "fractions") },
    { text: "What is one half of 10?", correct: String(10 / 2), distractors: ["2", "4", "10"], explanation: "Half of 10 is 5.", ref: R46("bronze", "fractions") },
    { text: "Which fraction shows one half?", correct: "1/2", distractors: ["1/4", "1/3", "2/2"], explanation: "1/2 means one of two equal parts.", ref: R46("bronze", "fractions") },
    { text: "What is a quarter of 4?", correct: String(4 / 4), distractors: ["2", "4", "16"], explanation: "A quarter of 4 is 1.", ref: R46("bronze", "fractions") },
  ],
  silver: [
    { text: "What is half of 6?", correct: String(6 / 2), distractors: ["2", "4", "12"], explanation: "Half of 6 is 3.", ref: R46("silver", "fractions") },
    { text: "What is half of 8?", correct: String(8 / 2), distractors: ["2", "3", "16"], explanation: "Half of 8 is 4.", ref: R46("silver", "fractions") },
    { text: "What is half of 20?", correct: String(20 / 2), distractors: ["5", "4", "40"], explanation: "Half of 20 is 10.", ref: R46("silver", "fractions") },
    { text: "Quarters in one half?", correct: "2", distractors: ["1", "4", "8"], explanation: "Two quarters make one half.", ref: R46("silver", "fractions") },
    { text: "What is a quarter of 8?", correct: String(8 / 4), distractors: ["4", "1", "16"], explanation: "A quarter of 8 is 2.", ref: R46("silver", "fractions") },
    { text: "Fraction with 4 equal parts?", correct: "1/4", distractors: ["1/2", "3/4", "1/3"], explanation: "1/4 means one of four equal parts.", ref: R46("silver", "fractions") },
    { text: "A cake has 4 equal parts. One part is what?", correct: "1/4", distractors: ["1/2", "3/4", "4/4"], explanation: "One of four equal parts is 1/4.", ref: R46("silver", "fractions") },
    { text: "What is half of 12?", correct: String(12 / 2), distractors: ["4", "3", "8"], explanation: "Half of 12 is 6.", ref: R46("silver", "fractions") },
  ],
  gold: [
    { text: "What is half of 16?", correct: String(16 / 2), distractors: ["4", "6", "32"], explanation: "Half of 16 is 8.", ref: R46("gold", "fractions") },
    { text: "What is half of 18?", correct: String(18 / 2), distractors: ["8", "10", "36"], explanation: "Half of 18 is 9.", ref: R46("gold", "fractions") },
    { text: "Ngozi ate 1 of 4 slices. How much did she eat?", correct: "1/4", distractors: ["1/2", "3/4", "1/3"], explanation: "One slice of four is 1/4.", ref: R46("gold", "fractions") },
    { text: "Which is bigger, 1/2 or 1/4?", correct: "1/2", distractors: ["1/4", "They are the same", "1/3"], explanation: "A half is bigger than a quarter.", ref: R46("gold", "fractions") },
    { text: "What is a quarter of 20?", correct: String(20 / 4), distractors: ["4", "10", "2"], explanation: "A quarter of 20 is 5.", ref: R46("gold", "fractions") },
    { text: "How many quarters are in 3/4?", correct: "3", distractors: ["1", "2", "4"], explanation: "Three quarters has 3 quarters.", ref: R46("gold", "fractions") },
    { text: "What is half of 14?", correct: String(14 / 2), distractors: ["6", "8", "28"], explanation: "Half of 14 is 7.", ref: R46("gold", "fractions") },
    { text: "Which fraction is bigger: 1/4 or 3/4?", correct: "3/4", distractors: ["1/4", "They are the same", "2/4"], explanation: "3 of 4 parts is more than 1.", ref: R46("gold", "fractions") },
  ],
};

const SPROUTS_DECIMALS: Record<Level, Draft[]> = {
  bronze: [
    { text: "How many kobo make ₦1?", correct: "100", distractors: ["50", "10", "1000"], explanation: "₦1 is 100 kobo.", ref: R46("bronze", "decimals") },
    { text: "50 kobo is what part of ₦1?", correct: "Half", distractors: ["Quarter", "Whole", "Double"], explanation: "50 kobo is half of 100 kobo.", ref: R46("bronze", "decimals") },
    { text: "Which shows ₦1.50?", correct: "₦1.50", distractors: ["₦150", "₦0.15", "₦15.00"], explanation: "One naira fifty is ₦1.50.", ref: R46("bronze", "decimals") },
    { text: "Which is more: 50 kobo or 100 kobo?", correct: "100 kobo", distractors: ["50 kobo", "They are the same", "25 kobo"], explanation: "100 kobo is more than 50 kobo.", ref: R46("bronze", "decimals") },
    { text: "How many 50 kobo coins make ₦1?", correct: String(100 / 50), distractors: ["1", "4", "5"], explanation: "50k and 50k makes 100k.", ref: R46("bronze", "decimals") },
    { text: "How many kobo are in ₦2?", correct: String(2 * 100), distractors: ["100", "20", "2000"], explanation: "₦2 is 200 kobo.", ref: R46("bronze", "decimals") },
    { text: "Which is the same as half of ₦2?", correct: "₦1", distractors: ["₦2", "₦1.50", "50 k"], explanation: "Half of ₦2 is ₦1.", ref: R46("bronze", "decimals") },
    { text: "What is 10 k plus 10 k?", correct: "20 k", distractors: ["10 k", "100 k", "5 k"], explanation: "10 k plus 10 k is 20 k.", ref: R46("bronze", "decimals") },
  ],
  silver: [
    { text: "What is half of ₦4?", correct: "₦2", distractors: ["₦1", "₦4", "₦8"], explanation: "Half of ₦4 is ₦2.", ref: R46("silver", "decimals") },
    { text: "How many 20 kobo coins make ₦1?", correct: String(100 / 20), distractors: ["4", "10", "2"], explanation: "5 coins of 20 k make 100 k.", ref: R46("silver", "decimals") },
    { text: "Which is 0.5?", correct: "One half", distractors: ["One quarter", "One third", "One tenth"], explanation: "0.5 means one half.", ref: R46("silver", "decimals") },
    { text: "What is 0.5 + 0.5?", correct: "1", distractors: ["0.10", "10", "1.5"], explanation: "0.5 plus 0.5 makes 1.", ref: R46("silver", "decimals") },
    { text: "Which is bigger: ₦1.50 or ₦1.20?", correct: "₦1.50", distractors: ["₦1.20", "They are the same", "₦1.05"], explanation: "₦1.50 is more than ₦1.20.", ref: R46("silver", "decimals") },
    { text: "How many kobo are in ₦1.50?", correct: String(150), distractors: ["100", "50", "15"], explanation: "₦1.50 is 150 kobo.", ref: R46("silver", "decimals") },
    { text: "What is ₦5 - ₦2?", correct: "₦3", distractors: ["₦2", "₦4", "₦7"], explanation: "₦5 take away ₦2 is ₦3.", ref: R46("silver", "decimals") },
    { text: "What is ₦2.50 + ₦1.50?", correct: "₦4.00", distractors: ["₦3.50", "₦3.00", "₦5.00"], explanation: "₦2.50 plus ₦1.50 is ₦4.00.", ref: R46("silver", "decimals") },
  ],
  gold: [
    { text: "What is ₦3.25 + ₦1.25?", correct: "₦4.50", distractors: ["₦4.00", "₦5.50", "₦4.75"], explanation: "₦3.25 plus ₦1.25 is ₦4.50.", ref: R46("gold", "decimals") },
    { text: "What is ₦5.00 - ₦2.50?", correct: "₦2.50", distractors: ["₦2.00", "₦3.50", "₦7.50"], explanation: "₦5.00 minus ₦2.50 is ₦2.50.", ref: R46("gold", "decimals") },
    { text: "Write ₦2.25 with digits.", correct: "₦2.25", distractors: ["₦2.50", "₦22.5", "₦0.25"], explanation: "Two naira twenty-five kobo is ₦2.25.", ref: R46("gold", "decimals") },
    { text: "What is half of ₦6?", correct: "₦3", distractors: ["₦2", "₦4", "₦12"], explanation: "Half of ₦6 is ₦3.", ref: R46("gold", "decimals") },
    { text: "What is 0.5 + 0.5 + 0.5?", correct: "1.5", distractors: ["1.0", "15", "2.0"], explanation: "Three halves make 1 and a half.", ref: R46("gold", "decimals") },
    { text: "Which is less: ₦1.75 or ₦1.25?", correct: "₦1.25", distractors: ["₦1.75", "They are the same", "₦1.50"], explanation: "₦1.25 is less than ₦1.75.", ref: R46("gold", "decimals") },
    { text: "How many 25 kobo coins make ₦1?", correct: String(100 / 25), distractors: ["2", "5", "10"], explanation: "Four 25 k coins make 100 k.", ref: R46("gold", "decimals") },
    { text: "What is ₦4.50 + ₦2.00?", correct: "₦6.50", distractors: ["₦6.00", "₦5.50", "₦7.50"], explanation: "₦4.50 plus ₦2.00 is ₦6.50.", ref: R46("gold", "decimals") },
  ],
};

const SPROUTS_GEOMETRY: Record<Level, Draft[]> = {
  bronze: [
    { text: "Sides on a triangle?", correct: "3", distractors: ["2", "4", "5"], explanation: "A triangle has 3 sides.", ref: R46("bronze", "geometry") },
    { text: "Sides on a square?", correct: "4", distractors: ["3", "5", "6"], explanation: "A square has 4 sides.", ref: R46("bronze", "geometry") },
    { text: "Corners on a circle?", correct: "0", distractors: ["1", "2", "4"], explanation: "A circle is round, with no corners.", ref: R46("bronze", "geometry") },
    { text: "Which shape has no corners?", correct: "Circle", distractors: ["Square", "Triangle", "Rectangle"], explanation: "A circle has no corners.", ref: R46("bronze", "geometry") },
    { text: "Corners on a triangle?", correct: "3", distractors: ["4", "2", "5"], explanation: "A triangle has 3 corners.", ref: R46("bronze", "geometry") },
    { text: "What shape is a door?", correct: "Rectangle", distractors: ["Circle", "Oval", "Triangle"], explanation: "Most doors are rectangles.", ref: R46("bronze", "geometry") },
    { text: "Straight sides on a circle?", correct: "0", distractors: ["1", "2", "4"], explanation: "A circle has no straight sides.", ref: R46("bronze", "geometry") },
    { text: "A coin is shaped like what?", correct: "Circle", distractors: ["Square", "Triangle", "Rectangle"], explanation: "A coin is round like a circle.", ref: R46("bronze", "geometry") },
  ],
  silver: [
    { text: "Corners on a square?", correct: "4", distractors: ["3", "5", "0"], explanation: "A square has 4 corners.", ref: R46("silver", "geometry") },
    { text: "Sides of a rectangle. Count them.", correct: "4", distractors: ["3", "6", "5"], explanation: "A rectangle has 4 sides.", ref: R46("silver", "geometry") },
    { text: "Flat shape with 4 equal sides?", correct: "Square", distractors: ["Rectangle", "Circle", "Triangle"], explanation: "All 4 sides are equal in a square.", ref: R46("silver", "geometry") },
    { text: "Corners of a rectangle. Count them.", correct: "4", distractors: ["2", "3", "6"], explanation: "A rectangle has 4 corners.", ref: R46("silver", "geometry") },
    { text: "Which shape has 3 sides?", correct: "Triangle", distractors: ["Square", "Circle", "Pentagon"], explanation: "A triangle has 3 sides.", ref: R46("silver", "geometry") },
    { text: "Which solid is a die?", correct: "Cube", distractors: ["Sphere", "Cone", "Cylinder"], explanation: "A die is cube shaped.", ref: R46("silver", "geometry") },
    { text: "Faces on a cube?", correct: "6", distractors: ["4", "8", "12"], explanation: "A cube has 6 flat faces.", ref: R46("silver", "geometry") },
    { text: "Which shape is round?", correct: "Circle", distractors: ["Square", "Triangle", "Rectangle"], explanation: "A circle is round.", ref: R46("silver", "geometry") },
  ],
  gold: [
    { text: "Which solid has 6 flat faces?", correct: "Cube", distractors: ["Sphere", "Cone", "Cylinder"], explanation: "A cube has 6 flat faces.", ref: R46("gold", "geometry") },
    { text: "Which flat shape has 4 equal sides?", correct: "Square", distractors: ["Rectangle", "Triangle", "Circle"], explanation: "A square has 4 equal sides.", ref: R46("gold", "geometry") },
    { text: "Corners on a box?", correct: "8", distractors: ["6", "4", "12"], explanation: "A cuboid has 8 corners.", ref: R46("gold", "geometry") },
    { text: "A wheel is shaped like which flat shape?", correct: "Circle", distractors: ["Square", "Triangle", "Oval"], explanation: "A wheel is round like a circle.", ref: R46("gold", "geometry") },
    { text: "Which shape has no straight sides?", correct: "Circle", distractors: ["Square", "Triangle", "Rectangle"], explanation: "A circle has only a curved side.", ref: R46("gold", "geometry") },
    { text: "Edges on a cube?", correct: "12", distractors: ["6", "8", "4"], explanation: "A cube has 12 edges.", ref: R46("gold", "geometry") },
    { text: "Equal sides of a square. Count them.", correct: "4", distractors: ["2", "3", "8"], explanation: "A square has 4 equal sides.", ref: R46("gold", "geometry") },
    { text: "Which flat shape has 4 sides but not all equal?", correct: "Rectangle", distractors: ["Square", "Triangle", "Circle"], explanation: "A rectangle has 4 sides, not all equal.", ref: R46("gold", "geometry") },
  ],
};

const SPROUTS_MEASUREMENT: Record<Level, Draft[]> = {
  bronze: [
    { text: "What do we use to measure length?", correct: "A ruler", distractors: ["A clock", "A scale", "A spoon"], explanation: "A ruler measures length.", ref: R46("bronze", "measurement") },
    { text: "Which is longer? A pencil or a table?", correct: "A table", distractors: ["A pencil", "They are the same", "A rubber"], explanation: "A table is much longer than a pencil.", ref: R46("bronze", "measurement") },
    { text: "We use a clock to tell what?", correct: "The time", distractors: ["The weather", "The weight", "The colour"], explanation: "A clock tells the time.", ref: R46("bronze", "measurement") },
    { text: "Minutes in 1 hour?", correct: "60", distractors: ["30", "100", "24"], explanation: "One hour has 60 minutes.", ref: R46("bronze", "measurement") },
    { text: "Which is heavier? A stone or a feather?", correct: "A stone", distractors: ["A feather", "They are the same", "A leaf"], explanation: "A stone is much heavier than a feather.", ref: R46("bronze", "measurement") },
    { text: "How many days are in a week?", correct: "7", distractors: ["5", "6", "10"], explanation: "A week has 7 days.", ref: R46("bronze", "measurement") },
    { text: "Metre or cm?", correct: "A metre", distractors: ["A centimetre", "They are the same", "A millimetre"], explanation: "1 metre is 100 centimetres.", ref: R46("bronze", "measurement") },
    { text: "Which is lighter, a book or a bag of rice?", correct: "A book", distractors: ["A bag of rice", "They are the same", "A chair"], explanation: "A book is lighter than a bag of rice.", ref: R46("bronze", "measurement") },
  ],
  silver: [
    { text: "One minute has 60 of what?", correct: "Seconds", distractors: ["Hours", "Days", "Weeks"], explanation: "One minute has 60 seconds.", ref: R46("silver", "measurement") },
    { text: "How many hours are in one day?", correct: "24", distractors: ["12", "60", "7"], explanation: "One day has 24 hours.", ref: R46("silver", "measurement") },
    { text: "Which is shorter, 5 cm or 10 cm?", correct: "5 cm", distractors: ["10 cm", "They are the same", "15 cm"], explanation: "5 cm is shorter than 10 cm.", ref: R46("silver", "measurement") },
    { text: "Which is heavier, 1 kg of rice or 2 kg of rice?", correct: "2 kg of rice", distractors: ["1 kg of rice", "They are the same", "Half kg of rice"], explanation: "2 kg is heavier than 1 kg.", ref: R46("silver", "measurement") },
    { text: "What do we use to weigh things?", correct: "A scale", distractors: ["A ruler", "A clock", "A cup"], explanation: "A scale measures weight.", ref: R46("silver", "measurement") },
    { text: "1 km = how many metres?", correct: "1000", distractors: ["100", "10", "10000"], explanation: "1 kilometre is 1000 metres.", ref: R46("silver", "measurement") },
    { text: "Which takes longer, 1 minute or 1 hour?", correct: "1 hour", distractors: ["1 minute", "They are the same", "1 second"], explanation: "1 hour is 60 minutes.", ref: R46("silver", "measurement") },
    { text: "How many days are in a month?", correct: "About 30", distractors: ["7", "10", "60"], explanation: "A month is about 30 days.", ref: R46("silver", "measurement") },
  ],
  gold: [
    { text: "1 cm has how many mm?", correct: "10", distractors: ["5", "100", "2"], explanation: "1 cm has 10 mm.", ref: R46("gold", "measurement") },
    { text: "Lunch is at 12:00. It is 11:30 now. How many minutes to lunch?", correct: "30", distractors: ["60", "15", "90"], explanation: "From 11:30 to 12:00 is 30 minutes.", ref: R46("gold", "measurement") },
    { text: "What is 2 hours in minutes?", correct: String(2 * 60), distractors: ["60", "100", "200"], explanation: "2 hours is 120 minutes.", ref: R46("gold", "measurement") },
    { text: "A rope is 3 m long. Another is 2 m. What is the total?", correct: "5 m", distractors: ["6 m", "4 m", "1 m"], explanation: "3 m plus 2 m is 5 m.", ref: R46("gold", "measurement") },
    { text: "Which is lighter, 500 g or 1 kg?", correct: "500 g", distractors: ["1 kg", "They are the same", "2 kg"], explanation: "500 g is half a kilo.", ref: R46("gold", "measurement") },
    { text: "How many weeks are in one month?", correct: "4", distractors: ["2", "6", "8"], explanation: "A month is about 4 weeks.", ref: R46("gold", "measurement") },
    { text: "What do we use to measure time?", correct: "A clock", distractors: ["A ruler", "A scale", "A cup"], explanation: "A clock tells us the time.", ref: R46("gold", "measurement") },
    { text: "A shop opens at 8 am. It closes at 6 pm. How many hours was it open?", correct: "10 hours", distractors: ["8 hours", "6 hours", "12 hours"], explanation: "From 8 am to 6 pm is 10 hours.", ref: R46("gold", "measurement") },
  ],
};

const SPROUTS_MONEY_DATA: Record<Level, Draft[]> = {
  bronze: [
    { text: "Which note is worth more, ₦5 or ₦10?", correct: "₦10", distractors: ["₦5", "They are the same", "₦1"], explanation: "₦10 is more than ₦5.", ref: R46("bronze", "money-data") },
    { text: "What is 5 k + 5 k?", correct: "10 k", distractors: ["5 k", "50 k", "100 k"], explanation: "5 k plus 5 k is 10 k.", ref: R46("bronze", "money-data") },
    { text: "Which is a note, not a coin?", correct: "₦100", distractors: ["50 k", "10 k", "25 k"], explanation: "₦100 is a note.", ref: R46("bronze", "money-data") },
    { text: "What is ₦2 + ₦3?", correct: `₦${2 + 3}`, distractors: ["₦4", "₦6", "₦23"], explanation: "₦2 plus ₦3 is ₦5.", ref: R46("bronze", "money-data") },
    { text: "Which coin is worth the least?", correct: "5 k", distractors: ["10 k", "25 k", "50 k"], explanation: "5 k is the smallest coin.", ref: R46("bronze", "money-data") },
    { text: "What is ₦5 - ₦1?", correct: "₦4", distractors: ["₦5", "₦6", "₦3"], explanation: "₦5 take away ₦1 is ₦4.", ref: R46("bronze", "money-data") },
    { text: "An orange costs ₦2. How much are 2 oranges?", correct: "₦4", distractors: ["₦2", "₦3", "₦6"], explanation: "2 oranges at ₦2 is ₦4.", ref: R46("bronze", "money-data") },
    { text: "What is 25 k + 25 k?", correct: "50 k", distractors: ["25 k", "75 k", "100 k"], explanation: "25 k plus 25 k is 50 k.", ref: R46("bronze", "money-data") },
  ],
  silver: [
    { text: "What is ₦10 + ₦10?", correct: "₦20", distractors: ["₦10", "₦100", "₦30"], explanation: "₦10 plus ₦10 is ₦20.", ref: R46("silver", "money-data") },
    { text: "What is ₦50 - ₦20?", correct: "₦30", distractors: ["₦20", "₦50", "₦70"], explanation: "₦50 take away ₦20 is ₦30.", ref: R46("silver", "money-data") },
    { text: "A pencil costs ₦5. A ruler costs ₦3. What is the total?", correct: "₦8", distractors: ["₦7", "₦9", "₦2"], explanation: "₦5 plus ₦3 is ₦8.", ref: R46("silver", "money-data") },
    { text: "How many 10 k coins make 50 k?", correct: String(50 / 10), distractors: ["2", "4", "10"], explanation: "5 coins of 10 k make 50 k.", ref: R46("silver", "money-data") },
    { text: "Which is more: ₦100 or ₦50?", correct: "₦100", distractors: ["₦50", "They are the same", "₦5"], explanation: "₦100 is more than ₦50.", ref: R46("silver", "money-data") },
    { text: "Bread costs ₦20. You pay with ₦50. What is your change?", correct: "₦30", distractors: ["₦20", "₦50", "₦70"], explanation: "₦50 minus ₦20 is ₦30.", ref: R46("silver", "money-data") },
    { text: "What is ₦20 + ₦20 + ₦20?", correct: "₦60", distractors: ["₦40", "₦80", "₦200"], explanation: "Three lots of ₦20 is ₦60.", ref: R46("silver", "money-data") },
    { text: "How many 25 k coins make ₦1?", correct: String(100 / 25), distractors: ["2", "5", "10"], explanation: "Four 25 k coins make 100 k.", ref: R46("silver", "money-data") },
  ],
  gold: [
    { text: "Musa buys a biscuit for ₦15. He pays with ₦20. What is his change?", correct: "₦5", distractors: ["₦15", "₦20", "₦10"], explanation: "₦20 minus ₦15 is ₦5.", ref: R46("gold", "money-data") },
    { text: "What is ₦100 - ₦40?", correct: "₦60", distractors: ["₦40", "₦100", "₦140"], explanation: "₦100 minus ₦40 is ₦60.", ref: R46("gold", "money-data") },
    { text: "Rice costs ₦30. Beans cost ₦25. What is the total?", correct: "₦55", distractors: ["₦50", "₦60", "₦5"], explanation: "₦30 plus ₦25 is ₦55.", ref: R46("gold", "money-data") },
    { text: "How many ₦10 notes make ₦100?", correct: String(100 / 10), distractors: ["5", "100", "20"], explanation: "10 notes of ₦10 make ₦100.", ref: R46("gold", "money-data") },
    { text: "A book costs ₦45. You give ₦50. What is the change?", correct: "₦5", distractors: ["₦45", "₦50", "₦95"], explanation: "₦50 minus ₦45 is ₦5.", ref: R46("gold", "money-data") },
    { text: "What is ₦200 + ₦300?", correct: "₦500", distractors: ["₦400", "₦600", "₦800"], explanation: "₦200 plus ₦300 is ₦500.", ref: R46("gold", "money-data") },
    { text: "3 mangoes cost ₦30. How much is one mango?", correct: "₦10", distractors: ["₦3", "₦15", "₦30"], explanation: "₦30 shared by 3 is ₦10.", ref: R46("gold", "money-data") },
    { text: "Which note is worth the most?", correct: "₦200", distractors: ["₦100", "₦50", "₦10"], explanation: "₦200 is the highest note listed.", ref: R46("gold", "money-data") },
  ],
};

/* ------------------------------------------------------------------ */
/* Band 7-9 (Explorers, Primary 3)                                    */
/* ------------------------------------------------------------------ */

const R79 = (level: Level, topic: string) => ref("7-9", level, topic);

const EXPLORERS_NUMBER: Record<Level, Draft[]> = {
  bronze: [
    { text: "What is the place value of 5 in 352?", correct: "50", distractors: ["5", "500", "0"], explanation: "5 is in the tens place, so it is 50.", ref: R79("bronze", "number") },
    { text: "Write 346 in words.", correct: "Three hundred and forty-six", distractors: ["Three hundred and sixty-four", "Four hundred and thirty-six", "Three hundred and forty"], explanation: "346 is three hundred and forty-six.", ref: R79("bronze", "number") },
    { text: "Which number is the greatest: 245, 524, 452, 542?", correct: "542", distractors: ["245", "452", "524"], explanation: "542 is bigger than the rest.", ref: R79("bronze", "number") },
    { text: "Round 47 to the nearest 10.", correct: "50", distractors: ["40", "45", "60"], explanation: "47 is closer to 50 than to 40.", ref: R79("bronze", "number") },
    { text: "Is 64 even or odd?", correct: "Even", distractors: ["Odd", "Both", "Neither"], explanation: "64 splits into two equal groups.", ref: R79("bronze", "number") },
    { text: "What comes after 999?", correct: "1,000", distractors: ["100", "10,000", "998"], explanation: "1000 comes after 999.", ref: R79("bronze", "number") },
    { text: "What is the place value of 7 in 721?", correct: "700", distractors: ["7", "70", "7,000"], explanation: "7 is in the hundreds place.", ref: R79("bronze", "number") },
    { text: "Write 508 in words.", correct: "Five hundred and eight", distractors: ["Five hundred and eighty", "Five hundred and eighteen", "Five hundred"], explanation: "508 is five hundred and eight.", ref: R79("bronze", "number") },
  ],
  silver: [
    { text: "What is 256 + 100?", correct: String(256 + 100), distractors: ["456", "266", "156"], explanation: "256 plus 100 is 356.", ref: R79("silver", "number") },
    { text: "Round 128 to the nearest 100.", correct: "100", distractors: ["200", "130", "120"], explanation: "128 is closer to 100 than to 200.", ref: R79("silver", "number") },
    { text: "Which number is the smallest: 305, 350, 530, 503?", correct: "305", distractors: ["350", "503", "530"], explanation: "305 is less than the rest.", ref: R79("silver", "number") },
    { text: "What is 90 + 90?", correct: String(90 + 90), distractors: ["160", "170", "190"], explanation: "90 plus 90 is 180.", ref: R79("silver", "number") },
    { text: "Is 217 odd or even?", correct: "Odd", distractors: ["Even", "Both", "Neither"], explanation: "217 leaves 1 when split into two.", ref: R79("silver", "number") },
    { text: "What is 1,000 - 1?", correct: String(1000 - 1), distractors: ["1,001", "990", "100"], explanation: "1000 take away 1 is 999.", ref: R79("silver", "number") },
    { text: "What comes next: 125, 150, 175, ...?", correct: String(175 + 25), distractors: ["180", "225", "190"], explanation: "The pattern adds 25 each time.", ref: R79("silver", "number") },
    { text: "Round 63 to the nearest 10.", correct: "60", distractors: ["70", "50", "65"], explanation: "63 is closer to 60 than to 70.", ref: R79("silver", "number") },
  ],
  gold: [
    { text: "What is 465 + 38?", correct: String(465 + 38), distractors: ["493", "513", "403"], explanation: "465 plus 38 is 503.", ref: R79("gold", "number") },
    { text: "What is 700 - 245?", correct: String(700 - 245), distractors: ["445", "465", "555"], explanation: "700 take away 245 is 455.", ref: R79("gold", "number") },
    { text: "Greatest 3-digit number from 2, 9, 4?", correct: "942", distractors: ["924", "294", "492"], explanation: "Put the biggest digits first: 942.", ref: R79("gold", "number") },
    { text: "Round 275 to the nearest 100.", correct: "300", distractors: ["200", "250", "280"], explanation: "275 is closer to 300 than to 200.", ref: R79("gold", "number") },
    { text: "What is 32 × 10?", correct: String(32 * 10), distractors: ["302", "3200", "230"], explanation: "32 times 10 is 320.", ref: R79("gold", "number") },
    { text: "How many tens are in 480?", correct: String(480 / 10), distractors: ["8", "4", "408"], explanation: "480 is made of 48 tens.", ref: R79("gold", "number") },
    { text: "What is 6 × 100?", correct: String(6 * 100), distractors: ["60", "6,000", "106"], explanation: "6 times 100 is 600.", ref: R79("gold", "number") },
    { text: "What number is halfway between 40 and 60?", correct: "50", distractors: ["45", "55", "20"], explanation: "50 is exactly between 40 and 60.", ref: R79("gold", "number") },
  ],
};

const EXPLORERS_ADDSUB: Record<Level, Draft[]> = {
  bronze: [
    { text: "What is 25 + 30?", correct: String(25 + 30), distractors: ["45", "65", "75"], explanation: "25 plus 30 is 55.", ref: R79("bronze", "addsub") },
    { text: "What is 48 - 20?", correct: String(48 - 20), distractors: ["18", "38", "68"], explanation: "48 take away 20 is 28.", ref: R79("bronze", "addsub") },
    { text: "What is 60 + 35?", correct: String(60 + 35), distractors: ["85", "105", "90"], explanation: "60 plus 35 is 95.", ref: R79("bronze", "addsub") },
    { text: "What is 72 - 30?", correct: String(72 - 30), distractors: ["32", "52", "45"], explanation: "72 take away 30 is 42.", ref: R79("bronze", "addsub") },
    { text: "What is 15 + 27?", correct: String(15 + 27), distractors: ["32", "52", "47"], explanation: "15 plus 27 is 42.", ref: R79("bronze", "addsub") },
    { text: "What is 90 - 45?", correct: String(90 - 45), distractors: ["40", "55", "35"], explanation: "90 take away 45 is 45.", ref: R79("bronze", "addsub") },
    { text: "What is 36 + 28?", correct: String(36 + 28), distractors: ["54", "74", "62"], explanation: "36 plus 28 is 64.", ref: R79("bronze", "addsub") },
    { text: "What is 55 - 17?", correct: String(55 - 17), distractors: ["28", "48", "42"], explanation: "55 take away 17 is 38.", ref: R79("bronze", "addsub") },
  ],
  silver: [
    { text: "What is 125 + 234?", correct: String(125 + 234), distractors: ["349", "369", "459"], explanation: "125 plus 234 is 359.", ref: R79("silver", "addsub") },
    { text: "What is 340 - 125?", correct: String(340 - 125), distractors: ["225", "205", "235"], explanation: "340 take away 125 is 215.", ref: R79("silver", "addsub") },
    { text: "A farmer has 245 eggs. He sells 120. How many eggs are left?", correct: String(245 - 120), distractors: ["115", "135", "225"], explanation: "245 minus 120 is 125 eggs.", ref: R79("silver", "addsub") },
    { text: "What is 500 - 275?", correct: String(500 - 275), distractors: ["235", "215", "325"], explanation: "500 take away 275 is 225.", ref: R79("silver", "addsub") },
    { text: "What is 178 + 145?", correct: String(178 + 145), distractors: ["313", "333", "223"], explanation: "178 plus 145 is 323.", ref: R79("silver", "addsub") },
    { text: "Tunde has ₦85. He spends ₦40. How much does he have?", correct: `₦${85 - 40}`, distractors: ["₦40", "₦50", "₦125"], explanation: "₦85 minus ₦40 is ₦45.", ref: R79("silver", "addsub") },
    { text: "What is 600 + 350?", correct: String(600 + 350), distractors: ["850", "1,050", "955"], explanation: "600 plus 350 is 950.", ref: R79("silver", "addsub") },
    { text: "What is 403 - 150?", correct: String(403 - 150), distractors: ["243", "263", "353"], explanation: "403 take away 150 is 253.", ref: R79("silver", "addsub") },
  ],
  gold: [
    { text: "What is 268 + 475?", correct: String(268 + 475), distractors: ["733", "753", "643"], explanation: "268 plus 475 is 743.", ref: R79("gold", "addsub") },
    { text: "What is 901 - 356?", correct: String(901 - 356), distractors: ["555", "535", "645"], explanation: "901 take away 356 is 545.", ref: R79("gold", "addsub") },
    { text: "A shop has 324 bags of rice. It sells 178. How many are left?", correct: String(324 - 178), distractors: ["156", "136", "246"], explanation: "324 minus 178 is 146 bags.", ref: R79("gold", "addsub") },
    { text: "What is 152 + 276 + 100?", correct: String(152 + 276 + 100), distractors: ["428", "518", "628"], explanation: "152 plus 276 is 428, plus 100 is 528.", ref: R79("gold", "addsub") },
    { text: "What is 1,000 - 487?", correct: String(1000 - 487), distractors: ["523", "503", "487"], explanation: "1000 take away 487 is 513.", ref: R79("gold", "addsub") },
    { text: "Amaka reads 45 pages on Monday and 38 on Tuesday. How many pages in all?", correct: String(45 + 38), distractors: ["73", "93", "85"], explanation: "45 plus 38 is 83 pages.", ref: R79("gold", "addsub") },
    { text: "What is 729 - 268?", correct: String(729 - 268), distractors: ["471", "451", "569"], explanation: "729 take away 268 is 461.", ref: R79("gold", "addsub") },
    { text: "Chinwe buys 2 books. One costs ₦120, the other ₦85. What is the total?", correct: `₦${120 + 85}`, distractors: ["₦195", "₦215", "₦185"], explanation: "₦120 plus ₦85 is ₦205.", ref: R79("gold", "addsub") },
  ],
};

const EXPLORERS_MULDIV: Record<Level, Draft[]> = {
  bronze: [
    { text: "What is 2 × 6?", correct: String(2 * 6), distractors: ["10", "14", "8"], explanation: "2 times 6 is 12.", ref: R79("bronze", "muldiv") },
    { text: "What is 5 × 3?", correct: String(5 * 3), distractors: ["10", "20", "8"], explanation: "5 times 3 is 15.", ref: R79("bronze", "muldiv") },
    { text: "What is 10 × 4?", correct: String(10 * 4), distractors: ["14", "400", "20"], explanation: "10 times 4 is 40.", ref: R79("bronze", "muldiv") },
    { text: "What is 5 × 5?", correct: String(5 * 5), distractors: ["10", "20", "35"], explanation: "5 times 5 is 25.", ref: R79("bronze", "muldiv") },
    { text: "What is 2 × 9?", correct: String(2 * 9), distractors: ["11", "16", "20"], explanation: "2 times 9 is 18.", ref: R79("bronze", "muldiv") },
    { text: "What is 10 × 7?", correct: String(10 * 7), distractors: ["17", "700", "60"], explanation: "10 times 7 is 70.", ref: R79("bronze", "muldiv") },
    { text: "What is 5 × 8?", correct: String(5 * 8), distractors: ["30", "45", "35"], explanation: "5 times 8 is 40.", ref: R79("bronze", "muldiv") },
    { text: "What is 2 × 7?", correct: String(2 * 7), distractors: ["9", "16", "12"], explanation: "2 times 7 is 14.", ref: R79("bronze", "muldiv") },
  ],
  silver: [
    { text: "What is 12 ÷ 2?", correct: String(12 / 2), distractors: ["5", "7", "10"], explanation: "12 shared into 2 groups is 6.", ref: R79("silver", "muldiv") },
    { text: "What is 30 ÷ 5?", correct: String(30 / 5), distractors: ["5", "7", "10"], explanation: "30 shared by 5 is 6.", ref: R79("silver", "muldiv") },
    { text: "What is 40 ÷ 10?", correct: String(40 / 10), distractors: ["10", "5", "8"], explanation: "40 shared by 10 is 4.", ref: R79("silver", "muldiv") },
    { text: "What is 5 × 6?", correct: String(5 * 6), distractors: ["11", "25", "35"], explanation: "5 times 6 is 30.", ref: R79("silver", "muldiv") },
    { text: "What is 2 × 12?", correct: String(2 * 12), distractors: ["14", "22", "26"], explanation: "2 times 12 is 24.", ref: R79("silver", "muldiv") },
    { text: "What is 50 ÷ 5?", correct: String(50 / 5), distractors: ["5", "15", "25"], explanation: "50 shared by 5 is 10.", ref: R79("silver", "muldiv") },
    { text: "What is 10 × 9?", correct: String(10 * 9), distractors: ["19", "900", "80"], explanation: "10 times 9 is 90.", ref: R79("silver", "muldiv") },
    { text: "What is 14 ÷ 2?", correct: String(14 / 2), distractors: ["6", "8", "12"], explanation: "14 shared into 2 groups is 7.", ref: R79("silver", "muldiv") },
  ],
  gold: [
    { text: "What is 5 × 7?", correct: String(5 * 7), distractors: ["30", "40", "25"], explanation: "5 times 7 is 35.", ref: R79("gold", "muldiv") },
    { text: "There are 24 oranges in 2 baskets equally. How many in each?", correct: String(24 / 2), distractors: ["10", "14", "8"], explanation: "24 shared into 2 is 12 each.", ref: R79("gold", "muldiv") },
    { text: "What is 100 ÷ 10?", correct: String(100 / 10), distractors: ["1", "100", "5"], explanation: "100 shared by 10 is 10.", ref: R79("gold", "muldiv") },
    { text: "A class has 5 rows. Each row has 6 seats. How many seats?", correct: String(5 * 6), distractors: ["11", "25", "35"], explanation: "5 rows of 6 seats is 30.", ref: R79("gold", "muldiv") },
    { text: "What is 45 ÷ 5?", correct: String(45 / 5), distractors: ["5", "8", "10"], explanation: "45 shared by 5 is 9.", ref: R79("gold", "muldiv") },
    { text: "What is 3 × 10?", correct: String(3 * 10), distractors: ["13", "40", "310"], explanation: "3 times 10 is 30.", ref: R79("gold", "muldiv") },
    { text: "What is 60 ÷ 10?", correct: String(60 / 10), distractors: ["10", "5", "3"], explanation: "60 shared by 10 is 6.", ref: R79("gold", "muldiv") },
    { text: "Bags of rice cost ₦500 each. What is the cost of 2 bags?", correct: `₦${500 * 2}`, distractors: ["₦700", "₦500", "₦1,500"], explanation: "2 bags at ₦500 is ₦1000.", ref: R79("gold", "muldiv") },
  ],
};

const EXPLORERS_FRACTIONS: Record<Level, Draft[]> = {
  bronze: [
    { text: "What is one half of 10?", correct: String(10 / 2), distractors: ["2", "10", "4"], explanation: "Half of 10 is 5.", ref: R79("bronze", "fractions") },
    { text: "What is one quarter of 20?", correct: String(20 / 4), distractors: ["4", "10", "2"], explanation: "A quarter of 20 is 5.", ref: R79("bronze", "fractions") },
    { text: "Which fraction means one of 2 equal parts?", correct: "1/2", distractors: ["1/4", "1/3", "2/3"], explanation: "1 of 2 equal parts is 1/2.", ref: R79("bronze", "fractions") },
    { text: "What is half of 8?", correct: String(8 / 2), distractors: ["2", "3", "6"], explanation: "Half of 8 is 4.", ref: R79("bronze", "fractions") },
    { text: "Which is bigger, 1/2 or 1/4?", correct: "1/2", distractors: ["1/4", "They are the same", "1/3"], explanation: "A half is bigger than a quarter.", ref: R79("bronze", "fractions") },
    { text: "How many quarters make one half?", correct: "2", distractors: ["1", "4", "8"], explanation: "Two quarters make one half.", ref: R79("bronze", "fractions") },
    { text: "What is half of 100?", correct: String(100 / 2), distractors: ["25", "10", "100"], explanation: "Half of 100 is 50.", ref: R79("bronze", "fractions") },
    { text: "Fraction with 4 equal parts?", correct: "1/4", distractors: ["1/2", "3/4", "1/3"], explanation: "1/4 means one of four equal parts.", ref: R79("bronze", "fractions") },
  ],
  silver: [
    { text: "What is one third of 9?", correct: String(9 / 3), distractors: ["2", "6", "1"], explanation: "A third of 9 is 3.", ref: R79("silver", "fractions") },
    { text: "What is one half of 50?", correct: String(50 / 2), distractors: ["20", "10", "30"], explanation: "Half of 50 is 25.", ref: R79("silver", "fractions") },
    { text: "Which fraction is equal to 2/4?", correct: "1/2", distractors: ["1/4", "3/4", "2/3"], explanation: "2 of 4 parts is the same as 1 of 2.", ref: R79("silver", "fractions") },
    { text: "What is a quarter of 100?", correct: String(100 / 4), distractors: ["20", "50", "10"], explanation: "A quarter of 100 is 25.", ref: R79("silver", "fractions") },
    { text: "How many thirds make one whole?", correct: "3", distractors: ["2", "4", "6"], explanation: "Three thirds make one whole.", ref: R79("silver", "fractions") },
    { text: "Which is smallest: 1/2, 1/3 or 1/4?", correct: "1/4", distractors: ["1/2", "1/3", "They are equal"], explanation: "More parts means each part is smaller.", ref: R79("silver", "fractions") },
    { text: "What is half of 36?", correct: String(36 / 2), distractors: ["16", "20", "12"], explanation: "Half of 36 is 18.", ref: R79("silver", "fractions") },
    { text: "Which fraction is bigger: 2/4 or 3/4?", correct: "3/4", distractors: ["2/4", "They are the same", "1/4"], explanation: "3 of 4 parts is more than 2.", ref: R79("silver", "fractions") },
  ],
  gold: [
    { text: "What is 1/2 of ₦100?", correct: "₦50", distractors: ["₦25", "₦20", "₦75"], explanation: "Half of ₦100 is ₦50.", ref: R79("gold", "fractions") },
    { text: "A pie is cut into 4 equal parts. Bola eats 3. How much is left?", correct: "1/4", distractors: ["3/4", "1/2", "2/4"], explanation: "4 parts minus 3 eaten leaves 1/4.", ref: R79("gold", "fractions") },
    { text: "Which fraction is equal to 2/6?", correct: "1/3", distractors: ["1/2", "2/3", "1/6"], explanation: "2 of 6 parts is the same as 1 of 3.", ref: R79("gold", "fractions") },
    { text: "What is 3/4 of 20?", correct: String((3 * 20) / 4), distractors: ["10", "5", "12"], explanation: "A quarter of 20 is 5, times 3 is 15.", ref: R79("gold", "fractions") },
    { text: "Chidi has 12 marbles. He gives half away. How many does he keep?", correct: String(12 / 2), distractors: ["4", "8", "12"], explanation: "Half of 12 is 6.", ref: R79("gold", "fractions") },
    { text: "Arrange 1/4, 1/2 and 3/4 from small to large.", correct: "1/4, 1/2, 3/4", distractors: ["3/4, 1/2, 1/4", "1/2, 1/4, 3/4", "1/2, 3/4, 1/4"], explanation: "The quarters grow from 1 to 2 to 3.", ref: R79("gold", "fractions") },
    { text: "What is 2/5 of 10?", correct: String((2 * 10) / 5), distractors: ["2", "5", "8"], explanation: "A fifth of 10 is 2, times 2 is 4.", ref: R79("gold", "fractions") },
    { text: "Which is closer to 1: 3/4 or 1/4?", correct: "3/4", distractors: ["1/4", "They are the same", "1/2"], explanation: "3 of 4 parts is nearly one whole.", ref: R79("gold", "fractions") },
  ],
};

const EXPLORERS_DECIMALS: Record<Level, Draft[]> = {
  bronze: [
    { text: "What is 0.5 as a fraction?", correct: "1/2", distractors: ["1/4", "1/5", "2/5"], explanation: "0.5 means 5 tenths, half of 1.", ref: R79("bronze", "decimals") },
    { text: "What is ₦1.50 + ₦0.50?", correct: "₦2.00", distractors: ["₦1.50", "₦2.50", "₦1.00"], explanation: "₦1.50 plus ₦0.50 is ₦2.00.", ref: R79("bronze", "decimals") },
    { text: "How many kobo are in ₦1.50?", correct: "150", distractors: ["100", "50", "15"], explanation: "₦1.50 is 150 kobo.", ref: R79("bronze", "decimals") },
    { text: "Which is the biggest: 0.5, 1.5 or 2.5?", correct: "2.5", distractors: ["0.5", "1.5", "0.2"], explanation: "2.5 is bigger than 1.5 and 0.5.", ref: R79("bronze", "decimals") },
    { text: "What is 1.0 + 0.5?", correct: "1.5", distractors: ["1.0", "2.0", "0.15"], explanation: "1 plus a half is 1.5.", ref: R79("bronze", "decimals") },
    { text: "Write one and a half with digits.", correct: "1.5", distractors: ["1.2", "0.5", "1.1"], explanation: "One and a half is written 1.5.", ref: R79("bronze", "decimals") },
    { text: "What is 0.5 + 0.5?", correct: "1", distractors: ["0.10", "10", "1.5"], explanation: "0.5 plus 0.5 makes 1.", ref: R79("bronze", "decimals") },
    { text: "Which shows twenty-five kobo?", correct: "₦0.25", distractors: ["₦25.00", "₦2.50", "₦0.52"], explanation: "Twenty-five kobo is ₦0.25.", ref: R79("bronze", "decimals") },
  ],
  silver: [
    { text: "What is 2.5 + 1.5?", correct: "4", distractors: ["3", "5", "4.5"], explanation: "2.5 plus 1.5 is 4.", ref: R79("silver", "decimals") },
    { text: "What is 5.0 - 2.5?", correct: "2.5", distractors: ["2.0", "3.0", "7.5"], explanation: "5 minus 2.5 is 2.5.", ref: R79("silver", "decimals") },
    { text: "Which is smaller: 1.2 or 1.8?", correct: "1.2", distractors: ["1.8", "They are the same", "2.1"], explanation: "1.2 is less than 1.8.", ref: R79("silver", "decimals") },
    { text: "What is ₦10.50 + ₦2.50?", correct: "₦13.00", distractors: ["₦12.50", "₦12.00", "₦13.50"], explanation: "₦10.50 plus ₦2.50 is ₦13.00.", ref: R79("silver", "decimals") },
    { text: "Write 3/10 as a decimal.", correct: "0.3", distractors: ["0.03", "3.0", "0.13"], explanation: "3 tenths is written 0.3.", ref: R79("silver", "decimals") },
    { text: "What is 0.2 + 0.3?", correct: "0.5", distractors: ["0.6", "0.23", "1.0"], explanation: "2 tenths plus 3 tenths is 0.5.", ref: R79("silver", "decimals") },
    { text: "What is 10 - 3.5?", correct: "6.5", distractors: ["7.0", "7.5", "13.5"], explanation: "10 minus 3.5 is 6.5.", ref: R79("silver", "decimals") },
    { text: "How much is ₦20.75 + ₦4.25?", correct: "₦25.00", distractors: ["₦24.00", "₦25.50", "₦26.00"], explanation: "₦20.75 plus ₦4.25 is ₦25.00.", ref: R79("silver", "decimals") },
  ],
  gold: [
    { text: "What is 4.2 + 3.5?", correct: "7.7", distractors: ["7.2", "6.7", "8.7"], explanation: "4.2 plus 3.5 is 7.7.", ref: R79("gold", "decimals") },
    { text: "What is 10.0 - 4.5?", correct: "5.5", distractors: ["6.5", "5.0", "14.5"], explanation: "10 minus 4.5 is 5.5.", ref: R79("gold", "decimals") },
    { text: "Write 7/10 as a decimal.", correct: "0.7", distractors: ["0.07", "7.0", "0.17"], explanation: "7 tenths is written 0.7.", ref: R79("gold", "decimals") },
    { text: "A loaf costs ₦350. You pay ₦500. What is your change?", correct: "₦150", distractors: ["₦100", "₦250", "₦850"], explanation: "₦500 minus ₦350 is ₦150.", ref: R79("gold", "decimals") },
    { text: "What is 1.5 + 2.5 + 1.0?", correct: "5", distractors: ["4", "6", "5.5"], explanation: "1.5 plus 2.5 is 4, plus 1 is 5.", ref: R79("gold", "decimals") },
    { text: "Which is biggest: 3.25, 3.05, 3.50 or 3.15?", correct: "3.50", distractors: ["3.25", "3.05", "3.15"], explanation: "3.50 is biggest after the point.", ref: R79("gold", "decimals") },
    { text: "What is 0.4 + 0.4 + 0.2?", correct: "1", distractors: ["0.8", "1.2", "0.10"], explanation: "0.4 plus 0.4 is 0.8, plus 0.2 is 1.", ref: R79("gold", "decimals") },
    { text: "Round 4.6 to the nearest whole number.", correct: "5", distractors: ["4", "6", "46"], explanation: "4.6 is closer to 5 than to 4.", ref: R79("gold", "decimals") },
  ],
};

const EXPLORERS_GEOMETRY: Record<Level, Draft[]> = {
  bronze: [
    { text: "Name a 6-sided shape.", correct: "6", distractors: ["5", "8", "7"], explanation: "A hexagon has 6 sides.", ref: R79("bronze", "geometry") },
    { text: "Name a 5-sided shape.", correct: "5", distractors: ["4", "6", "3"], explanation: "A pentagon has 5 corners.", ref: R79("bronze", "geometry") },
    { text: "What is a 3-sided shape?", correct: "Triangle", distractors: ["Square", "Pentagon", "Hexagon"], explanation: "A 3-sided polygon is a triangle.", ref: R79("bronze", "geometry") },
    { text: "How many fold lines does a square have?", correct: "4", distractors: ["2", "1", "8"], explanation: "A square has 4 lines of symmetry.", ref: R79("bronze", "geometry") },
    { text: "What shape has 5 sides?", correct: "Pentagon", distractors: ["Hexagon", "Square", "Triangle"], explanation: "A pentagon has 5 sides.", ref: R79("bronze", "geometry") },
    { text: "Faces on a cube?", correct: "6", distractors: ["4", "8", "12"], explanation: "A cube has 6 flat faces.", ref: R79("bronze", "geometry") },
    { text: "Not all sides are equal. What shape is it?", correct: "Rectangle", distractors: ["Square", "Triangle", "Circle"], explanation: "A rectangle has two pairs of equal sides.", ref: R79("bronze", "geometry") },
    { text: "What shape has 8 sides?", correct: "Octagon", distractors: ["Hexagon", "Pentagon", "Square"], explanation: "An octagon has 8 sides.", ref: R79("bronze", "geometry") },
  ],
  silver: [
    { text: "A square has sides of 4 cm. What is its perimeter?", correct: "16 cm", distractors: ["8 cm", "12 cm", "20 cm"], explanation: "4 + 4 + 4 + 4 is 16 cm.", ref: R79("silver", "geometry") },
    { text: "Right angles in a rectangle?", correct: "4", distractors: ["2", "6", "0"], explanation: "A rectangle has 4 right angles.", ref: R79("silver", "geometry") },
    { text: "Which solid has 2 flat faces and a curve?", correct: "Cylinder", distractors: ["Cuboid", "Sphere", "Pyramid"], explanation: "A cylinder has 2 flat faces and a curved face.", ref: R79("silver", "geometry") },
    { text: "What is the perimeter of a rectangle 6 cm by 4 cm?", correct: "20 cm", distractors: ["10 cm", "24 cm", "12 cm"], explanation: "6 + 4 + 6 + 4 is 20 cm.", ref: R79("silver", "geometry") },
    { text: "An angle less than 90 degrees is?", correct: "Acute angle", distractors: ["Obtuse angle", "Right angle", "Straight angle"], explanation: "Less than 90 degrees is an acute angle.", ref: R79("silver", "geometry") },
    { text: "Which angle is 90 degrees?", correct: "Right angle", distractors: ["Acute angle", "Obtuse angle", "Straight angle"], explanation: "A 90 degree angle is a right angle.", ref: R79("silver", "geometry") },
    { text: "How many fold lines does a circle have?", correct: "Many", distractors: ["1", "2", "4"], explanation: "A circle has many lines of symmetry.", ref: R79("silver", "geometry") },
    { text: "An angle over 90 degrees is?", correct: "Obtuse angle", distractors: ["Acute angle", "Right angle", "Sharp angle"], explanation: "More than 90 degrees is an obtuse angle.", ref: R79("silver", "geometry") },
  ],
  gold: [
    { text: "Angles in a triangle add up to?", correct: "180°", distractors: ["90°", "270°", "360°"], explanation: "The angles of a triangle sum to 180°.", ref: R79("gold", "geometry") },
    { text: "A square has side 7 cm. What is its perimeter?", correct: "28 cm", distractors: ["14 cm", "21 cm", "49 cm"], explanation: "4 sides of 7 cm is 28 cm.", ref: R79("gold", "geometry") },
    { text: "A triangle has sides 3 cm, 4 cm, 5 cm. What is its perimeter?", correct: "12 cm", distractors: ["10 cm", "15 cm", "7 cm"], explanation: "3 + 4 + 5 is 12 cm.", ref: R79("gold", "geometry") },
    { text: "Which has one line of symmetry?", correct: "Isosceles triangle", distractors: ["Square", "Circle", "Equilateral triangle"], explanation: "An isosceles triangle has one line of symmetry.", ref: R79("gold", "geometry") },
    { text: "A rectangle is 8 cm long and 2 cm wide. Find its perimeter.", correct: "20 cm", distractors: ["10 cm", "16 cm", "32 cm"], explanation: "8 + 2 + 8 + 2 is 20 cm.", ref: R79("gold", "geometry") },
    { text: "What do we call two lines that never meet?", correct: "Parallel lines", distractors: ["Perpendicular lines", "Straight lines", "Curved lines"], explanation: "Lines that never meet are parallel.", ref: R79("gold", "geometry") },
    { text: "Which solid has 8 corners?", correct: "Cube", distractors: ["Sphere", "Cone", "Cylinder"], explanation: "A cube has 8 corners.", ref: R79("gold", "geometry") },
    { text: "One side of a square is 9 cm. What is its perimeter?", correct: "36 cm", distractors: ["18 cm", "27 cm", "81 cm"], explanation: "4 sides of 9 cm is 36 cm.", ref: R79("gold", "geometry") },
  ],
};

const EXPLORERS_MEASUREMENT: Record<Level, Draft[]> = {
  bronze: [
    { text: "Minutes in 1 hour?", correct: "60", distractors: ["30", "100", "24"], explanation: "One hour has 60 minutes.", ref: R79("bronze", "measurement") },
    { text: "How many cm are in 1 m?", correct: "100", distractors: ["10", "1000", "10000"], explanation: "1 m is 100 cm.", ref: R79("bronze", "measurement") },
    { text: "How many days are in one week?", correct: "7", distractors: ["5", "10", "6"], explanation: "A week has 7 days.", ref: R79("bronze", "measurement") },
    { text: "Grams in 1 kg?", correct: "1000", distractors: ["100", "10", "500"], explanation: "1 kg is 1000 grams.", ref: R79("bronze", "measurement") },
    { text: "What do we use to measure mass?", correct: "A scale", distractors: ["A ruler", "A clock", "A cup"], explanation: "A scale measures mass.", ref: R79("bronze", "measurement") },
    { text: "Which is heavier: 2 kg or 500 g?", correct: "2 kg", distractors: ["500 g", "They are the same", "1 kg"], explanation: "2 kg is heavier than 500 g.", ref: R79("bronze", "measurement") },
    { text: "How many hours are in two days?", correct: String(2 * 24), distractors: ["24", "12", "60"], explanation: "2 days is 48 hours.", ref: R79("bronze", "measurement") },
    { text: "One minute has 60 of what?", correct: "Seconds", distractors: ["Hours", "Days", "Weeks"], explanation: "One minute has 60 seconds.", ref: R79("bronze", "measurement") },
  ],
  silver: [
    { text: "How many mm are in one cm?", correct: "10", distractors: ["100", "5", "1"], explanation: "1 cm is 10 mm.", ref: R79("silver", "measurement") },
    { text: "What is 3 m in centimetres?", correct: "300 cm", distractors: ["30 cm", "3,000 cm", "30 m"], explanation: "3 m is 300 cm.", ref: R79("silver", "measurement") },
    { text: "What is 2 kg in grams?", correct: "2000 g", distractors: ["200 g", "20,000 g", "20 g"], explanation: "2 kg is 2000 grams.", ref: R79("silver", "measurement") },
    { text: "A lesson starts at 9:00 and ends at 9:45. How long is it?", correct: "45 minutes", distractors: ["30 minutes", "60 minutes", "15 minutes"], explanation: "From 9:00 to 9:45 is 45 minutes.", ref: R79("silver", "measurement") },
    { text: "Which is longer: 1 km or 999 m?", correct: "1 km", distractors: ["999 m", "They are the same", "900 m"], explanation: "1 km is 1000 m.", ref: R79("silver", "measurement") },
    { text: "There are how many minutes in 2 hours?", correct: String(2 * 60), distractors: ["60", "100", "90"], explanation: "2 hours is 120 minutes.", ref: R79("silver", "measurement") },
    { text: "What is 500 cm in metres?", correct: "5 m", distractors: ["50 m", "500 m", "50 cm"], explanation: "500 cm is 5 m.", ref: R79("silver", "measurement") },
    { text: "How many days are in one year?", correct: "365", distractors: ["360", "364", "300"], explanation: "A year has 365 days.", ref: R79("silver", "measurement") },
  ],
  gold: [
    { text: "What is 1 km 500 m in metres?", correct: "1500 m", distractors: ["1050 m", "150 m", "500 m"], explanation: "1 km is 1000 m, plus 500 m is 1500 m.", ref: R79("gold", "measurement") },
    { text: "A bottle holds 2 litres. One glass holds 250 ml. How many glasses fill it?", correct: String(2000 / 250), distractors: ["4", "6", "10"], explanation: "2000 ml shared by 250 ml is 8 glasses.", ref: R79("gold", "measurement") },
    { text: "What is 3.5 kg in grams?", correct: "3500 g", distractors: ["350 g", "3000 g", "35 g"], explanation: "3.5 kg is 3500 grams.", ref: R79("gold", "measurement") },
    { text: "School starts at 8:15 and ends at 2:15. How many hours is that?", correct: "6 hours", distractors: ["5 hours", "7 hours", "8 hours"], explanation: "From 8:15 to 2:15 is 6 hours.", ref: R79("gold", "measurement") },
    { text: "What is 2 m 25 cm in centimetres?", correct: "225 cm", distractors: ["250 cm", "2025 cm", "2075 cm"], explanation: "2 m is 200 cm, plus 25 cm is 225 cm.", ref: R79("gold", "measurement") },
    { text: "How many weeks are in 56 days?", correct: String(56 / 7), distractors: ["7", "6", "9"], explanation: "56 shared by 7 is 8 weeks.", ref: R79("gold", "measurement") },
    { text: "A bag weighs 1.5 kg. Another weighs 900 g. Which is heavier?", correct: "The 1.5 kg bag", distractors: ["The 900 g bag", "They weigh the same", "Neither"], explanation: "1.5 kg is 1500 g, more than 900 g.", ref: R79("gold", "measurement") },
    { text: "What is 1500 ml in litres?", correct: "1.5 litres", distractors: ["15 litres", "0.15 litres", "1.5 ml"], explanation: "1000 ml is 1 litre, plus 500 ml is 1.5 litres.", ref: R79("gold", "measurement") },
  ],
};

const EXPLORERS_MONEY_DATA: Record<Level, Draft[]> = {
  bronze: [
    { text: "How much is ₦50 + ₦50?", correct: "₦100", distractors: ["₦50", "₦150", "₦500"], explanation: "₦50 plus ₦50 is ₦100.", ref: R79("bronze", "money-data") },
    { text: "What is ₦100 - ₦30?", correct: "₦70", distractors: ["₦60", "₦80", "₦130"], explanation: "₦100 take away ₦30 is ₦70.", ref: R79("bronze", "money-data") },
    { text: "A ruler costs ₦20. You pay with ₦50. What is your change?", correct: "₦30", distractors: ["₦20", "₦50", "₦70"], explanation: "₦50 minus ₦20 is ₦30.", ref: R79("bronze", "money-data") },
    { text: "How many ₦10 notes make ₦50?", correct: String(50 / 10), distractors: ["10", "4", "50"], explanation: "5 notes of ₦10 make ₦50.", ref: R79("bronze", "money-data") },
    { text: "Which note is worth the most?", correct: "₦1000", distractors: ["₦100", "₦500", "₦200"], explanation: "₦1000 is the highest note listed.", ref: R79("bronze", "money-data") },
    { text: "What is ₦20 × 2?", correct: "₦40", distractors: ["₦22", "₦60", "₦10"], explanation: "₦20 times 2 is ₦40.", ref: R79("bronze", "money-data") },
    { text: "One orange costs ₦15. How much are 2 oranges?", correct: "₦30", distractors: ["₦15", "₦45", "₦17"], explanation: "2 oranges at ₦15 is ₦30.", ref: R79("bronze", "money-data") },
    { text: "What is ₦200 + ₦300?", correct: "₦500", distractors: ["₦400", "₦600", "₦800"], explanation: "₦200 plus ₦300 is ₦500.", ref: R79("bronze", "money-data") },
  ],
  silver: [
    { text: "What is ₦150 + ₦75?", correct: "₦225", distractors: ["₦215", "₦235", "₦125"], explanation: "₦150 plus ₦75 is ₦225.", ref: R79("silver", "money-data") },
    { text: "A book costs ₦120. Tunde pays with ₦200. How much change?", correct: "₦80", distractors: ["₦100", "₦120", "₦320"], explanation: "₦200 minus ₦120 is ₦80.", ref: R79("silver", "money-data") },
    { text: "How many 50 k coins make ₦5?", correct: "10", distractors: ["5", "20", "50"], explanation: "₦5 is 500 k, shared by 50 k is 10.", ref: R79("silver", "money-data") },
    { text: "What is ₦1000 - ₦450?", correct: String(1000 - 450), distractors: ["₦450", "₦650", "₦500"], explanation: "₦1000 take away ₦450 is ₦550.", ref: R79("silver", "money-data") },
    { text: "3 pencils cost ₦45 in all. What is the cost of one?", correct: "₦15", distractors: ["₦9", "₦20", "₦135"], explanation: "₦45 shared by 3 is ₦15.", ref: R79("silver", "money-data") },
    { text: "What is ₦250 × 2?", correct: `₦${250 * 2}`, distractors: ["₦400", "₦750", "₦452"], explanation: "₦250 times 2 is ₦500.", ref: R79("silver", "money-data") },
    { text: "Which is more: ₦750 or ₦705?", correct: "₦750", distractors: ["₦705", "They are the same", "₦570"], explanation: "₦750 is more than ₦705.", ref: R79("silver", "money-data") },
    { text: "A table shows sales: Mon 10, Tue 15, Wed 5. What is the total?", correct: String(10 + 15 + 5), distractors: ["20", "25", "35"], explanation: "10 plus 15 plus 5 is 30.", ref: R79("silver", "money-data") },
  ],
  gold: [
    { text: "Amina buys 3 mangoes. Each costs ₦20. How much does she pay?", correct: `₦${3 * 20}`, distractors: ["₦40", "₦50", "₦80"], explanation: "3 mangoes at ₦20 is ₦60.", ref: R79("gold", "money-data") },
    { text: "What is ₦1000 - ₦275 - ₦125?", correct: String(1000 - 275 - 125), distractors: ["₦500", "₦700", "₦725"], explanation: "₦1000 minus ₦275 is ₦725, minus ₦125 is ₦600.", ref: R79("gold", "money-data") },
    { text: "A bar chart shows 20, 35, 15. What is the biggest value?", correct: "35", distractors: ["20", "15", "25"], explanation: "35 is the biggest of the three.", ref: R79("gold", "money-data") },
    { text: "A shirt costs ₦850. A sale drops the price by ₦200. Find the new price.", correct: `₦${850 - 200}`, distractors: ["₦500", "₦750", "₦1050"], explanation: "₦850 minus ₦200 is ₦650.", ref: R79("gold", "money-data") },
    { text: "If 4 oranges cost ₦60, how much does one orange cost?", correct: `₦${60 / 4}`, distractors: ["₦10", "₦20", "₦12"], explanation: "₦60 shared by 4 is ₦15.", ref: R79("gold", "money-data") },
    { text: "Monday sales were ₦1200. Tuesday sales were ₦800. What is the total?", correct: `₦${1200 + 800}`, distractors: ["₦1800", "₦2100", "₦1600"], explanation: "₦1200 plus ₦800 is ₦2000.", ref: R79("gold", "money-data") },
    { text: "What is ₦500 + ₦500 + ₦500?", correct: "₦1,500", distractors: ["₦1,000", "₦2,000", "₦1,050"], explanation: "Three lots of ₦500 is ₦1,500.", ref: R79("gold", "money-data") },
    { text: "Chidi saves ₦50 daily. How much does he save in 30 days?", correct: `₦${50 * 30}`, distractors: ["₦300", "₦1,000", "₦15,000"], explanation: "₦50 times 30 days is ₦1,500.", ref: R79("gold", "money-data") },
  ],
};

/* ------------------------------------------------------------------ */
/* Builder                                                            */
/* ------------------------------------------------------------------ */

interface TopicDef {
  id: string;
  prefix: string;
  levels: Record<Level, Draft[]>;
}

const SPROUTS: Record<string, Record<Level, Draft[]>> = {
  number: SPROUTS_NUMBER,
  addsub: SPROUTS_ADDSUB,
  muldiv: SPROUTS_MULDIV,
  fractions: SPROUTS_FRACTIONS,
  decimals: SPROUTS_DECIMALS,
  geometry: SPROUTS_GEOMETRY,
  measurement: SPROUTS_MEASUREMENT,
  "money-data": SPROUTS_MONEY_DATA,
};

const EXPLORERS: Record<string, Record<Level, Draft[]>> = {
  number: EXPLORERS_NUMBER,
  addsub: EXPLORERS_ADDSUB,
  muldiv: EXPLORERS_MULDIV,
  fractions: EXPLORERS_FRACTIONS,
  decimals: EXPLORERS_DECIMALS,
  geometry: EXPLORERS_GEOMETRY,
  measurement: EXPLORERS_MEASUREMENT,
  "money-data": EXPLORERS_MONEY_DATA,
};

const CONTENT: Record<BandId, Record<string, Record<Level, Draft[]>>> = {
  "4-6": SPROUTS,
  "7-9": EXPLORERS,
  "10-12": {},
};

let errors = 0;
for (const bandId of BAND_IDS) {
  const outDir = path.resolve(`src/server/data/questions/${bandId}/mathematics`);
  mkdirSync(outDir, { recursive: true });
  for (const [topicId, levelContent] of Object.entries(CONTENT[bandId])) {
    const prefix = TOPIC_PREFIX[topicId]!;
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) throw new Error(`unknown topic ${topicId}`);
    const builder: TopicDef = { id: topicId, prefix, levels: levelContent };
    const questions = toQuestions(bandId, builder.id, builder.prefix, builder.levels);
    const file: TopicFile = { band: bandId, subject: "mathematics", topic: builder.id as never, title: topic.label, questions };
    const issues = validateTopicFile(file, { perLevel: 8 });
    const bad = issues.filter((i) => i.severity === "error");
    if (!isClean(issues)) {
      errors += bad.length;
      console.error(`\n${bandId}/${builder.id}: ${bad.length} errors`);
      for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
    } else {
      console.log(`${bandId}/${builder.id}: ${questions.length} questions clean`);
    }
    writeFileSync(path.join(outDir, `${builder.id}.json`), JSON.stringify(file, null, 2) + "\n");
  }
}

if (errors > 0) process.exitCode = 1;
