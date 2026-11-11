import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BAND, TOPICS } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";
import {
  SPELLING,
  SYNONYM_ITEMS,
  ANTONYM_ITEMS,
  CONTEXT_ITEMS,
} from "./english/data-words";
import {
  GRAMMAR_SENTENCES,
  VERBS,
  CAPITAL_STATEMENTS,
  QUESTION_STATEMENTS,
  POSSESSIVES,
} from "./english/data-grammar";
import {
  IDIOMS,
  SIMILES,
  SUBJECT_GAPS,
  CONNECTOR_ITEMS,
  WORD_ORDER_SENTENCES,
} from "./english/data-figures";
import { STORIES } from "./english/data-reading";

/**
 * Authoring helper for the English bank.
 * It emits static JSON. The live game never runs this code.
 * Every answer is tied to the source data above, so a wrong key is a
 * template bug that the validator or a spot check can catch.
 */

type Level = "bronze" | "silver" | "gold";

interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
  ref: string;
  passage?: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "ENG";
const OUT = path.resolve("src/server/data/questions/english");
const AUTHOR = "AI draft v1";

function norm(text: string): string {
  return text.toLowerCase().replace(/[₦,]/g, "").replace(/\s+/g, " ").trim();
}

/** Build four options with the correct answer at a fixed position. */
function optionsFor(correct: string, pool: readonly string[], index: number, context: string): string[] {
  const seen = new Set([norm(correct)]);
  const wrong: string[] = [];
  for (const candidate of pool) {
    const key = norm(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    wrong.push(candidate);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) throw new Error(`not enough distractors for ${context}`);
  const options = [...wrong];
  options.splice(index, 0, correct);
  return options;
}

function draft(text: string, correct: string, distractors: readonly string[], explanation: string, ref: string, passage?: string): Draft {
  return { text, correct, distractors: [...distractors], explanation, ref, passage };
}

/** Deterministic plausible misspellings for a spelling item. */
function misspellings(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>();
  const add = (candidate: string) => {
    if (candidate && candidate !== w && /^[a-z]+$/.test(candidate)) out.add(candidate);
  };

  for (let i = 0; i < w.length - 1; i++) {
    if (w[i] !== w[i + 1]) add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
  }
  for (let i = 1; i < w.length; i++) add(w.slice(0, i) + w.slice(i + 1));
  for (let i = 1; i < w.length - 1; i++) {
    if (/[bcdfghjklmnpqrstvwxyz]/.test(w[i] as string)) add(w.slice(0, i + 1) + w[i] + w.slice(i + 1));
  }
  if (w.includes("ie")) add(w.replace("ie", "ei"));
  if (w.includes("ei")) add(w.replace("ei", "ie"));

  const picked = [...out].slice(0, 3);
  let n = 0;
  while (picked.length < 3) {
    const candidate = `${w}${"aeiou"[n % 5] ?? "a"}`;
    n += 1;
    if (candidate !== w && !picked.includes(candidate)) picked.push(candidate);
  }
  return picked;
}

function splitLevels<T>(items: readonly T[], topic: string): Record<Level, T[]> {
  if (items.length !== 120) throw new Error(`${topic} needs 120 source items, found ${items.length}`);
  return {
    bronze: items.slice(0, 40),
    silver: items.slice(40, 80),
    gold: items.slice(80, 120),
  };
}

function buildSpelling(): Record<Level, Draft[]> {
  const levels = splitLevels(SPELLING, "spelling");
  const make = (items: typeof SPELLING): Draft[] =>
    items.map((item) =>
      draft(
        `Pick the best word: ${item.sentence}`,
        item.word,
        misspellings(item.word),
        `The correct spelling is "${item.word}". Check each letter as you write it.`,
        "NERDC Primary English, spelling: common words",
      ),
    );
  return { bronze: make(levels.bronze), silver: make(levels.silver), gold: make(levels.gold) };
}

function buildGrammar(): Record<Level, Draft[]> {
  const verbs = VERBS.map((v) => v.past);
  const adjectives = GRAMMAR_SENTENCES.map((s) => s.adjective);
  const people = GRAMMAR_SENTENCES.map((s) => s.person);
  return {
    bronze: GRAMMAR_SENTENCES.map((s) =>
      draft(
        `Which word is the verb in this sentence? ${s.sentence}`,
        s.verb,
        verbs,
        `"${s.verb}" tells what ${s.person} did.`,
        "NERDC Primary English, grammar: verbs",
      ),
    ),
    silver: GRAMMAR_SENTENCES.map((s) =>
      draft(
        `Which word describes a noun in this sentence? ${s.sentence}`,
        s.adjective,
        adjectives,
        `"${s.adjective}" describes ${s.person}.`,
        "NERDC Primary English, grammar: adjectives",
      ),
    ),
    gold: GRAMMAR_SENTENCES.map((s) =>
      draft(
        `Which word names a person in this sentence? ${s.sentence}`,
        s.person,
        people,
        `"${s.person}" is the naming word for a person.`,
        "NERDC Primary English, grammar: nouns",
      ),
    ),
  };
}

function buildTenses(): Record<Level, Draft[]> {
  const pasts = VERBS.map((v) => v.past);
  return {
    bronze: VERBS.map((v) =>
      draft(
        `What is the past tense of "${v.base}"?`,
        v.past,
        pasts,
        `We say "${v.past}" when the action already happened.`,
        "NERDC Primary English, tenses: simple past",
      ),
    ),
    silver: VERBS.map((v) =>
      draft(
        `Pick the sentence that uses "${v.base}" in the future.`,
        `She will ${v.base} ${v.rest} tomorrow.`,
        [
          `She ${v.past} ${v.rest} tomorrow.`,
          `She ${v.base} ${v.rest} tomorrow.`,
          `She ${v.base}ing ${v.rest} tomorrow.`,
        ],
        `"Will" plus the base verb shows the future: will ${v.base}.`,
        "NERDC Primary English, tenses: simple future",
      ),
    ),
    gold: VERBS.map((v) =>
      draft(
        `Fill the gap with the past tense of "${v.base}": Yesterday, she ___ ${v.rest}.`,
        v.past,
        [v.base, `will ${v.base}`, `${v.base}ing`],
        `Yesterday tells us the action is past, so we use "${v.past}".`,
        "NERDC Primary English, tenses: past in context",
      ),
    ),
  };
}

const END_MARKS = ["A full stop", "A question mark", "An exclamation mark", "A comma"];

function buildPunctuation(): Record<Level, Draft[]> {
  return {
    bronze: CAPITAL_STATEMENTS.map((statement) =>
      draft(
        `Which mark goes at the end? "${statement}"`,
        "A full stop",
        END_MARKS.filter((m) => m !== "A full stop"),
        "A statement ends with a full stop.",
        "NERDC Primary English, punctuation: full stops",
      ),
    ),
    silver: QUESTION_STATEMENTS.map((statement) =>
      draft(
        `Which mark goes at the end? "${statement}"`,
        "A question mark",
        END_MARKS.filter((m) => m !== "A question mark"),
        "A question ends with a question mark.",
        "NERDC Primary English, punctuation: question marks",
      ),
    ),
    gold: POSSESSIVES.map((p) =>
      draft(
        `Which sentence about ${p.owner} is right?`,
        `This is ${p.owner}'s ${p.item}.`,
        [
          `This is ${p.owner}s ${p.item}.`,
          `This is ${p.owner}s' ${p.item}.`,
          `This is ${p.owner}'s' ${p.item}.`,
        ],
        `The apostrophe before s shows that ${p.owner} owns the ${p.item}.`,
        "NERDC Primary English, punctuation: apostrophes",
      ),
    ),
  };
}

function buildVocabulary(): Record<Level, Draft[]> {
  const synonyms = SYNONYM_ITEMS.map((s) => s.synonym);
  const opposites = ANTONYM_ITEMS.map((a) => a.opposite);
  return {
    bronze: SYNONYM_ITEMS.map((item) =>
      draft(
        `Which word means the same as "${item.word}"?`,
        item.synonym,
        synonyms,
        `"${item.synonym}" has the same meaning as "${item.word}".`,
        "NERDC Primary English, vocabulary: synonyms",
      ),
    ),
    silver: ANTONYM_ITEMS.map((item) =>
      draft(
        `Which word is the opposite of "${item.word}"?`,
        item.opposite,
        opposites,
        `"${item.opposite}" is the opposite of "${item.word}".`,
        "NERDC Primary English, vocabulary: antonyms",
      ),
    ),
    gold: CONTEXT_ITEMS.map((item) =>
      draft(
        `Pick the best word: ${item.sentence}`,
        item.answer,
        item.wrong,
        `The sentence needs "${item.answer}" to make sense.`,
        "NERDC Primary English, vocabulary: words in context",
      ),
    ),
  };
}

function buildFigures(): Record<Level, Draft[]> {
  const meanings = IDIOMS.map((i) => i.meaning);
  const qualities = SIMILES.map((s) => s.quality);
  const phrases = SIMILES.map((s) => s.phrase);
  return {
    bronze: IDIOMS.map((item) =>
      draft(
        `What does the idiom "${item.phrase}" mean?`,
        item.meaning,
        meanings,
        `"${item.phrase}" means ${item.meaning}.`,
        "NERDC Primary English, figures of speech: idioms",
      ),
    ),
    silver: SIMILES.map((item) =>
      draft(
        `What does the simile "${item.phrase}" mean?`,
        item.quality,
        qualities,
        `"${item.phrase}" means ${item.quality}.`,
        "NERDC Primary English, figures of speech: similes",
      ),
    ),
    gold: SIMILES.map((item) =>
      draft(
        `Which simile means "${item.quality}"?`,
        item.phrase,
        phrases.filter((p) => p !== item.phrase),
        `"${item.phrase}" is the simile that means ${item.quality}.`,
        "NERDC Primary English, figures of speech: matching meaning",
      ),
    ),
  };
}

const THINGS = [
  "The rain",
  "The river",
  "The bus",
  "The wall",
  "The moon",
  "The road",
  "The pot",
  "The wind",
  "The sky",
  "The stone",
  "The basket",
  "The broom",
  "The market",
  "The door",
];

const CONNECTORS = ["but", "so", "because", "until", "although", "before", "after", "or", "despite", "when", "while"];

function buildWriting(): Record<Level, Draft[]> {
  return {
    bronze: SUBJECT_GAPS.map((item) =>
      draft(
        `Pick the best word: ${item.sentence}`,
        item.subject,
        THINGS,
        `"${item.subject}" is the person who does the action.`,
        "NERDC Primary English, writing: clear subjects",
      ),
    ),
    silver: CONNECTOR_ITEMS.map((item) => {
      const atStart = item.sentence.startsWith("___");
      const correct = atStart ? item.answer : item.answer.toLowerCase();
      return draft(
        `Pick the best word: ${item.sentence}`,
        correct,
        CONNECTORS.filter((c) => c !== correct.toLowerCase()),
        `"${correct}" joins the two ideas correctly here.`,
        "NERDC Primary English, writing: joining ideas",
      );
    }),
    gold: WORD_ORDER_SENTENCES.map((sentence) => {
      const words = sentence.split(" ");
      const swapped = (i: number): string => {
        if (i + 1 >= words.length) return sentence;
        const copy = [...words];
        const a = copy[i] as string;
        const b = copy[i + 1] as string;
        copy[i] = b;
        copy[i + 1] = a;
        return copy.join(" ");
      };
      const reversed = [...words].reverse().join(" ");
      const wrong = [...new Set([swapped(0), swapped(1), reversed])].filter((s) => s !== sentence);
      return draft(
        `Put in order: ${[...words].reverse().join(" ")}`,
        sentence,
        wrong,
        "Read the words as subject, action, then the extra detail.",
        "NERDC Primary English, writing: sentence order",
      );
    }),
  };
}

function buildComprehension(): Record<Level, Draft[]> {
  const items = STORIES.map((s) => s.item);
  const reasons = STORIES.map((s) => s.reason);
  const meanings = STORIES.map((s) => s.meaning);

  const keyword = (item: string): string => {
    const parts = item.toLowerCase().split(" ");
    return (parts[parts.length - 1] ?? item).replace(/[^a-z]/g, "");
  };

  return {
    bronze: STORIES.map((story) => {
      const key = keyword(story.item);
      const safe = items.filter((candidate) => {
        const other = keyword(candidate);
        if (!other || other === key) return false;
        return !story.passage.toLowerCase().includes(other);
      });
      return draft(
        `Which thing is in the story of ${story.name}?`,
        story.item,
        safe,
        `The story mentions ${story.item} at the ${story.place}.`,
        "NERDC Primary English, comprehension: recalling detail",
        story.passage,
      );
    }),
    silver: STORIES.map((story) =>
      draft(
        `Why did ${story.name} go to the ${story.place}?`,
        story.reason,
        reasons,
        `${story.name} went ${story.reason}.`,
        "NERDC Primary English, comprehension: finding reasons",
        story.passage,
      ),
    ),
    gold: STORIES.map((story) =>
      draft(
        `In the story, what does "${story.word}" mean?`,
        story.meaning,
        meanings,
        `In this story, "${story.word}" means ${story.meaning}.`,
        "NERDC Primary English, comprehension: word meaning",
        story.passage,
      ),
    ),
  };
}

const BUILDERS: Record<string, () => Record<Level, Draft[]>> = {
  comprehension: buildComprehension,
  spelling: buildSpelling,
  grammar: buildGrammar,
  tenses: buildTenses,
  punctuation: buildPunctuation,
  vocabulary: buildVocabulary,
  figures: buildFigures,
  writing: buildWriting,
};

function toQuestions(topicId: string, prefix: string, levels: Record<Level, Draft[]>): Question[] {
  const questions: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 40) throw new Error(`${topicId} ${level} has ${drafts.length} drafts, expected 40`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      questions.push({
        code: `${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(i + 1).padStart(3, "0")}`,
        subject: "english",
        topic: topicId,
        level,
        text: d.text,
        ...(d.passage ? { passage: d.passage } : {}),
        options: optionsFor(d.correct, d.distractors, index, `${topicId} ${level} ${i + 1}`),
        correctIndex: index,
        explanation: d.explanation,
        curriculumRef: d.ref,
        author: AUTHOR,
        reviewer: null,
        status: "draft",
      } as Question);
    });
  }
  return questions;
}

let errors = 0;
mkdirSync(OUT, { recursive: true });

for (const [topicId, build] of Object.entries(BUILDERS)) {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) throw new Error(`unknown topic ${topicId}`);
  const levels = build();
  const questions = toQuestions(topicId, topic.codePrefix, levels);
  const file: TopicFile = {
    subject: "english",
    topic: topic.id,
    title: topic.label,
    questions,
  };
  const issues = validateTopicFile(file, {
    perLevel: 40,
    maxGrade: BAND.readingGrade + 1,
    warnGrade: BAND.readingGrade,
  });
  const bad = issues.filter((i) => i.severity === "error");
  if (!isClean(issues)) {
    errors += bad.length;
    console.error(`\n${topicId}: ${bad.length} errors`);
    for (const issue of bad.slice(0, 15)) {
      console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
    }
  }
  writeFileSync(path.join(OUT, `${topicId}.json`), JSON.stringify(file, null, 2) + "\n");
  console.log(`${topicId}: ${questions.length} questions, ${bad.length} errors`);
}

if (errors > 0) process.exitCode = 1;