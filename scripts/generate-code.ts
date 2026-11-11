import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BAND, TOPICS } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Authoring helper for the Code and AI sample bank.
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
const AUTHOR = "AI draft v1";

const BRONZE: Draft[] = [
  {
    text: "What do we call the steps a computer follows?",
    correct: "An algorithm",
    distractors: ["A song", "A picture", "A number"],
    explanation: "An algorithm is a clear set of steps for solving a task.",
    ref: "NERDC Primary 4 Computer Studies, algorithms",
  },
  {
    text: "Which machine follows instructions to do a job?",
    correct: "A computer",
    distractors: ["A basket", "A chair", "A bucket"],
    explanation: "A computer follows instructions given by a person.",
    ref: "NERDC Primary 4 Computer Studies, computers",
  },
  {
    text: "What does a loop do in a program?",
    correct: "It repeats steps",
    distractors: ["It stops the program", "It draws a picture", "It deletes the work"],
    explanation: "A loop runs the same steps again and again.",
    ref: "NERDC Primary 4 Computer Studies, loops",
  },
  {
    text: "What is a bug in computing?",
    correct: "A mistake in the code",
    distractors: ["A small insect", "A new screen", "A loud sound"],
    explanation: "A bug is a mistake that makes a program work wrongly.",
    ref: "NERDC Primary 4 Computer Studies, debugging",
  },
  {
    text: "Which one puts data in a computer?",
    correct: "A keyboard",
    distractors: ["A screen", "A speaker", "A printer"],
    explanation: "A keyboard is an input device. It sends letters and numbers in.",
    ref: "NERDC Primary 4 Computer Studies, input devices",
  },
  {
    text: "Which one shows data from a computer?",
    correct: "A screen",
    distractors: ["A mouse", "A keyboard", "A scanner"],
    explanation: "A screen is an output device. It shows the result.",
    ref: "NERDC Primary 4 Computer Studies, output devices",
  },
  {
    text: "What does a robot need before it can move?",
    correct: "Clear instructions",
    distractors: ["A hat", "A song", "A window"],
    explanation: "A robot only moves when a person gives it clear steps.",
    ref: "NERDC Primary 4 Computer Studies, robots",
  },
  {
    text: "What is AI short for?",
    correct: "Artificial intelligence",
    distractors: ["Automatic internet", "Another idea", "Active input"],
    explanation: "AI stands for artificial intelligence.",
    ref: "NERDC Primary 4 Computer Studies, AI",
  },
];

const SILVER: Draft[] = [
  {
    text: "A robot moves 2 steps, then repeats this 3 times. How many steps in all?",
    correct: "6 steps",
    distractors: ["5 steps", "8 steps", "9 steps"],
    explanation: "A loop repeats 2 steps three times, so 2 × 3 = 6.",
    ref: "NERDC Primary 5 Computer Studies, loops and counting",
  },
  {
    text: "Which instruction is a loop?",
    correct: "Clap 3 times",
    distractors: ["Pick up one book", "Open the door", "Sit down once"],
    explanation: "Clap 3 times repeats the same action, so it is a loop.",
    ref: "NERDC Primary 5 Computer Studies, repeats",
  },
  {
    text: "If it is raining, take an umbrella. What is the condition?",
    correct: "It is raining",
    distractors: ["Take an umbrella", "It is sunny", "The umbrella is red"],
    explanation: "The condition is the test. Here it is whether it is raining.",
    ref: "NERDC Primary 5 Computer Studies, conditions",
  },
  {
    text: "A computer gives a wrong answer. What is the likely cause?",
    correct: "The instructions are wrong",
    distractors: ["The screen is clean", "The room is quiet", "The desk is new"],
    explanation: "A computer follows its instructions. Wrong steps give wrong answers.",
    ref: "NERDC Primary 5 Computer Studies, errors",
  },
  {
    text: "Which is a sensible use of AI?",
    correct: "Suggesting a song you may like",
    distractors: ["Cooking your dinner alone", "Carrying your bag home", "Paying your school fees"],
    explanation: "AI can suggest things from patterns, but it cannot do physical jobs by itself.",
    ref: "NERDC Primary 5 Computer Studies, uses of AI",
  },
  {
    text: "What should you do before trusting an AI answer?",
    correct: "Check it with a book or teacher",
    distractors: ["Share it at once", "Delete the question", "Change the answer yourself"],
    explanation: "AI can be wrong, so check important answers with a trusted person or book.",
    ref: "NERDC Primary 5 Computer Studies, checking AI",
  },
  {
    text: "Which information should you not share with an AI chat?",
    correct: "Your home address",
    distractors: ["Your favourite colour", "A maths question", "A story idea"],
    explanation: "Personal details like your address should stay private.",
    ref: "NERDC Primary 5 Computer Studies, online safety",
  },
  {
    text: "What is debugging?",
    correct: "Finding and fixing mistakes",
    distractors: ["Adding more colours", "Buying a new mouse", "Turning off the screen"],
    explanation: "Debugging means finding bugs and fixing them.",
    ref: "NERDC Primary 5 Computer Studies, debugging",
  },
];

const GOLD: Draft[] = [
  {
    text: "A loop runs 4 times and adds 3 each time. What is the total?",
    correct: "12",
    distractors: ["7", "10", "16"],
    explanation: "4 × 3 = 12. The loop adds 3 four times.",
    ref: "NERDC Primary 6 Computer Studies, loops with numbers",
  },
  {
    text: "The rule says: if score is more than 10, you win. The score is 10. What happens?",
    correct: "You do not win yet",
    distractors: ["You win", "The game ends", "The score doubles"],
    explanation: "10 is not more than 10, so the winning step does not run.",
    ref: "NERDC Primary 6 Computer Studies, conditions",
  },
  {
    text: "Why do the same AI questions get other answers later?",
    correct: "AI predicts words and can vary",
    distractors: ["The screen changes colour", "The keyboard is old", "The internet is off"],
    explanation: "Many AI tools predict likely words, so the wording can change.",
    ref: "NERDC Primary 6 Computer Studies, how AI responds",
  },
  {
    text: "Which is a good way to test a program?",
    correct: "Try it with different inputs",
    distractors: ["Look at it once", "Ask a friend to guess", "Change the title"],
    explanation: "Different inputs show whether the program works in many cases.",
    ref: "NERDC Primary 6 Computer Studies, testing",
  },
  {
    text: "Why should a person review an AI answer?",
    correct: "AI can be wrong or unfair",
    distractors: ["AI is always slow", "AI cannot use words", "AI has no screen"],
    explanation: "AI can make mistakes or repeat unfair patterns, so a person should check.",
    ref: "NERDC Primary 6 Computer Studies, responsible AI",
  },
  {
    text: "A robot repeats move and turn 5 times. How many turns does it make?",
    correct: "5 turns",
    distractors: ["4 turns", "6 turns", "10 turns"],
    explanation: "Each loop does one move and one turn, so 5 loops give 5 turns.",
    ref: "NERDC Primary 6 Computer Studies, robot loops",
  },
  {
    text: "Why should you keep personal data private?",
    correct: "It can be copied and shared",
    distractors: ["It takes up space", "It makes the screen hot", "It is hard to spell"],
    explanation: "Once personal data is shared, other people may copy or pass it on.",
    ref: "NERDC Primary 6 Computer Studies, privacy",
  },
  {
    text: "Which task is AI good at?",
    correct: "Sorting many photos by pattern",
    distractors: ["Feeling hungry", "Growing a real tree", "Keeping a secret safe forever"],
    explanation: "AI can spot patterns in large amounts of data.",
    ref: "NERDC Primary 6 Computer Studies, strengths of AI",
  },
];

const LEVELS: Record<Level, Draft[]> = { bronze: BRONZE, silver: SILVER, gold: GOLD };

function norm(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function optionsFor(correct: string, pool: readonly string[], index: number): string[] {
  const seen = new Set([norm(correct)]);
  const wrong: string[] = [];
  for (const candidate of pool) {
    const key = norm(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    wrong.push(candidate);
  }
  if (wrong.length !== 3) throw new Error(`expected 3 distractors for ${correct}, got ${wrong.length}`);
  const options = [...wrong];
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
      code: `COD-COD-${LEVEL_LETTER[level]}-${String(i + 1).padStart(3, "0")}`,
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

const topic = TOPICS.find((t) => t.id === "code-and-ai");
if (!topic) throw new Error("code-and-ai topic missing");
const file: TopicFile = {
  subject: "code-ai",
  topic: "code-and-ai",
  title: topic.label,
  questions,
};

const issues = validateTopicFile(file, {
  perLevel: 8,
  maxGrade: BAND.readingGrade + 1,
  warnGrade: BAND.readingGrade,
});
const bad = issues.filter((i) => i.severity === "error");
if (!isClean(issues)) {
  console.error(`code-and-ai: ${bad.length} errors`);
  for (const issue of bad) console.error(`  ${issue.code} ${issue.message}`);
  process.exitCode = 1;
}

const out = path.resolve("src/server/data/questions/code");
mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, "code-and-ai.json"), JSON.stringify(file, null, 2) + "\n");
console.log(`code-and-ai: ${questions.length} questions, ${bad.length} errors`);