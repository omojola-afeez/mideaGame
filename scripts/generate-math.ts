import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Authoring helper for the Mathematics bank.
 * It emits static JSON. The live game never runs this code and never calls an AI service.
 * Every answer is computed, so a wrong key is a template bug that the validator or a spot check can catch.
 */

type Draft = {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
  ref: string;
};

type Maker = (rng: () => number) => Draft;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20261111);

function int(min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i] as T;
    const b = out[j] as T;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

const NAMES = ["Ada", "Chidi", "Ngozi", "Tunde", "Amina", "Musa", "Ekaette", "Ifeoma", "Bola", "Sani"];
const PLACES = ["Lagos", "Kano", "Enugu", "Ibadan", "Abuja", "Jos", "Owerri", "Kaduna"];
const ITEMS = ["mangoes", "oranges", "pencils", "books", "eggs", "sachets of water", "bags of rice", "tomatoes"];

function name(): string {
  return pick(NAMES);
}

function naira(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const text = Number.isInteger(rounded)
    ? rounded.toLocaleString("en-NG")
    : rounded.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `₦${text}`;
}

function words(n: number): string {
  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 20) return ones[n] ?? String(n);
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return `${tens[t]}${r ? `-${ones[r]}` : ""}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${ones[h]} hundred${r ? ` and ${words(r)}` : ""}`;
  }
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  return `${words(th)} thousand${r ? ` and ${words(r)}` : ""}`;
}

function valueOfDigit(n: number, digit: number): number {
  const s = String(n);
  const i = s.indexOf(String(digit));
  if (i < 0) return 0;
  return digit * Math.pow(10, s.length - 1 - i);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function numericDistractors(correct: number, deltas: number[]): string[] {
  return deltas.map((d) => String(correct + d));
}

function moneyDistractors(correct: number, deltas: number[]): string[] {
  return deltas.map((d) => naira(correct + d));
}

function q(text: string, correct: string | number, distractors: Array<string | number>, explanation: string, ref: string): Draft {
  return {
    text,
    correct: String(correct),
    distractors: distractors.map(String),
    explanation,
    ref,
  };
}

function uniqueTexts(items: Draft[]): Draft[] {
  const seen = new Set<string>();
  const out: Draft[] = [];
  for (const item of items) {
    const key = item.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

// ------------------------------------------------------------------ number

const numberBronze: Maker[] = [
  () => {
    const n = int(120, 9899);
    const s = String(n);
    const pos = int(0, s.length - 1);
    const digit = Number(s[pos]);
    if (!digit) return numberBronze[1]!(rng);
    const value = digit * Math.pow(10, s.length - 1 - pos);
    return q(
      `What is the value of the digit ${digit} in ${n.toLocaleString("en-NG")}?`,
      value.toLocaleString("en-NG"),
      [digit, value * 10, Math.max(1, value / 10)].map((x) => Math.round(x).toLocaleString("en-NG")),
      `The digit ${digit} sits in the ${pos === s.length - 1 ? "thousands" : pos === s.length - 2 ? "hundreds" : pos === s.length - 3 ? "tens" : "ones"} place, so its value is ${value.toLocaleString("en-NG")}.`,
      "NERDC Primary 4 Mathematics, number and place value",
    );
  },
  () => {
    const nums = [int(100, 989), int(100, 989), int(100, 989), int(100, 989)];
    const max = Math.max(...nums);
    return q(
      "Which number is the greatest?",
      max.toLocaleString("en-NG"),
      nums.filter((n) => n !== max).map((n) => n.toLocaleString("en-NG")),
      `${max.toLocaleString("en-NG")} has the largest value when the hundreds are compared first.`,
      "NERDC Primary 4 Mathematics, comparing numbers",
    );
  },
  () => {
    let n = int(11, 94);
    if (n % 10 === 0) n += 1;
    const rounded = Math.round(n / 10) * 10;
    return q(
      `Round ${n} to the nearest 10.`,
      rounded,
      [rounded - 10, rounded + 10, n],
      `The ones digit is ${n % 10}. ${n % 10 >= 5 ? "It is 5 or more, so round up." : "It is less than 5, so round down."}`,
      "NERDC Primary 4 Mathematics, rounding",
    );
  },
  () => {
    const n = int(11, 99);
    const even = n % 2 === 0;
    return q(
      `Is ${n} even or odd?`,
      even ? "Even" : "Odd",
      even ? ["Odd", "Both", "Neither"] : ["Even", "Both", "Neither"],
      even ? `${n} can be shared into two equal whole numbers, so it is even.` : `${n} leaves 1 when shared into two, so it is odd.`,
      "NERDC Primary 4 Mathematics, even and odd numbers",
    );
  },
  () => {
    const n = int(101, 999);
    return q(
      `Write ${n} in words.`,
      words(n),
      [words(n + 10), words(n - 1), words(n + 100)],
      `${n} is read as ${words(n)}.`,
      "NERDC Primary 4 Mathematics, number names",
    );
  },
  () => {
    const n = int(200, 989);
    const s = String(n);
    const tensDigit = Number(s[1]);
    return q(
      `Which digit is in the tens place in ${n}?`,
      tensDigit,
      [Number(s[0]), Number(s[2]), 0],
      `In ${n}, the digit ${tensDigit} is in the tens place.`,
      "NERDC Primary 4 Mathematics, place value",
    );
  },
  () => {
    const n = int(50, 900);
    return q(
      `What number comes just before ${n}?`,
      n - 1,
      [n + 1, n - 10, n],
      `Counting back one from ${n} gives ${n - 1}.`,
      "NERDC Primary 4 Mathematics, counting",
    );
  },
  () => {
    const n = int(100, 900);
    return q(
      `What is 10 more than ${n}?`,
      n + 10,
      [n + 1, n + 100, n],
      `Adding 10 changes the tens digit, so ${n} becomes ${n + 10}.`,
      "NERDC Primary 4 Mathematics, adding 10",
    );
  },
];

const numberSilver: Maker[] = [
  () => {
    const n = int(10500, 98999);
    const s = String(n);
    const pos = int(1, 4);
    const digit = Number(s[pos]);
    if (!digit) return numberSilver[1]!(rng);
    const value = digit * Math.pow(10, s.length - 1 - pos);
    return q(
      `In ${n.toLocaleString("en-NG")}, what is the value of the digit ${digit}?`,
      value.toLocaleString("en-NG"),
      [digit, value * 10, Math.max(1, Math.round(value / 10))].map((x) => x.toLocaleString("en-NG")),
      `The digit ${digit} is in the ${value >= 1000 ? "thousands" : value >= 100 ? "hundreds" : value >= 10 ? "tens" : "ones"} place.`,
      "NERDC Primary 5 Mathematics, place value to 100,000",
    );
  },
  () => {
    const n = int(1000, 98999);
    const rounded = Math.round(n / 1000) * 1000;
    return q(
      `Round ${n.toLocaleString("en-NG")} to the nearest thousand.`,
      rounded.toLocaleString("en-NG"),
      [rounded + 1000, rounded - 1000, Math.round(n / 100) * 100].map((x) => x.toLocaleString("en-NG")),
      `The hundreds digit decides the rounding. ${n.toLocaleString("en-NG")} is closer to ${rounded.toLocaleString("en-NG")}.`,
      "NERDC Primary 5 Mathematics, rounding",
    );
  },
  () => {
    const nums = Array.from({ length: 4 }, () => int(1000, 9899));
    const sorted = [...new Set(nums)].sort((a, b) => a - b);
    if (sorted.length < 4) return numberSilver[2]!(rng);
    const wrong = [...sorted].reverse();
    const mixed = [sorted[0]!, sorted[2]!, sorted[1]!, sorted[3]!];
    return q(
      "Which list is in order from smallest to largest?",
      sorted.map((n) => n.toLocaleString("en-NG")).join(", "),
      [wrong.map((n) => n.toLocaleString("en-NG")).join(", "), mixed.map((n) => n.toLocaleString("en-NG")).join(", "), sorted.slice(1).concat(sorted[0]!).map((n) => n.toLocaleString("en-NG")).join(", ")],
      "Start with the thousands, then compare hundreds, tens and ones.",
      "NERDC Primary 5 Mathematics, ordering numbers",
    );
  },
  () => {
    const th = int(10, 89);
    const h = int(1, 9);
    const t = int(1, 9);
    const o = int(1, 9);
    const n = th * 1000 + h * 100 + t * 10 + o;
    return q(
      `Which number is ${th * 1000} + ${h * 100} + ${t * 10} + ${o}?`,
      n.toLocaleString("en-NG"),
      [n + 100, n - 10, n + 1000].map((x) => x.toLocaleString("en-NG")),
      `Adding the parts gives ${n.toLocaleString("en-NG")}.`,
      "NERDC Primary 5 Mathematics, expanded form",
    );
  },
  () => {
    const start = int(10, 90);
    const step = pick([15, 20, 25, 30, 40, 50]);
    const seq = [start, start + step, start + step * 2, start + step * 3];
    return q(
      `What comes next? ${seq.join(", ")}, ...`,
      start + step * 4,
      [start + step * 5, start + step * 4 + 1, start + step * 3],
      `Each number goes up by ${step}, so the next number is ${start + step * 4}.`,
      "NERDC Primary 5 Mathematics, number patterns",
    );
  },
  () => {
    const a = int(1000, 9899);
    let b = int(1000, 9899);
    if (a === b) b += 1;
    const sign = a < b ? "<" : ">";
    return q(
      `Which sign makes this true? ${a.toLocaleString("en-NG")} __ ${b.toLocaleString("en-NG")}`,
      sign,
      sign === "<" ? [">", "=", "+"] : ["<", "=", "+"],
      `Compare the thousands first. ${a.toLocaleString("en-NG")} is ${a < b ? "less" : "greater"} than ${b.toLocaleString("en-NG")}.`,
      "NERDC Primary 5 Mathematics, comparing numbers",
    );
  },
  () => {
    const digits = shuffle([int(1, 9), int(1, 9), int(1, 9), int(1, 9)]);
    const [a, b, c, d] = digits as [number, number, number, number];
    const smallest = [a, b, c, d].sort((x, y) => x - y).join("");
    return q(
      `Use the digits ${digits.join(", ")} once each to make the smallest 4-digit number.`,
      Number(smallest).toLocaleString("en-NG"),
      [[a, b, c, d].join(""), [a, b, c, d].sort((x, y) => y - x).join(""), [b, a, c, d].join("")].map((x) => Number(x).toLocaleString("en-NG")),
      "Put the smallest digit first, then the next smallest, and so on.",
      "NERDC Primary 5 Mathematics, place value",
    );
  },
  () => {
    const n = int(10000, 98999);
    const place = pick([1000, 100, 10]);
    return q(
      `A town has ${n.toLocaleString("en-NG")} people. What is ${n.toLocaleString("en-NG")} rounded to the nearest ${place === 1000 ? "thousand" : place === 100 ? "hundred" : "ten"}?`,
      Math.round(n / place) * place === 0 ? "0" : (Math.round(n / place) * place).toLocaleString("en-NG"),
      [Math.round(n / place) * place + place, Math.round(n / place) * place - place, n].map((x) => x.toLocaleString("en-NG")),
      `The answer is ${(Math.round(n / place) * place).toLocaleString("en-NG")}.`,
      "NERDC Primary 5 Mathematics, rounding in context",
    );
  },
];

const numberGold: Maker[] = [
  () => {
    const n = int(1000, 9899);
    return q(
      `A farmer has ${n.toLocaleString("en-NG")} eggs. Rounded to the nearest hundred, how many eggs is that?`,
      (Math.round(n / 100) * 100).toLocaleString("en-NG"),
      [Math.round(n / 1000) * 1000, Math.round(n / 10) * 10, n].map((x) => x.toLocaleString("en-NG")),
      `The tens digit decides. ${n.toLocaleString("en-NG")} rounds to ${(Math.round(n / 100) * 100).toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, rounding in context",
    );
  },
  () => {
    const pool = new Set<number>();
    pool.add(int(1, 4) * 2);
    while (pool.size < 4) pool.add(int(1, 9));
    const digits = shuffle([...pool]);
    const evens = digits.filter((d) => d % 2 === 0).sort((a, b) => a - b);
    const last = evens[0] ?? 2;
    const rest = digits.filter((d) => d !== last).sort((a, b) => a - b);
    const answer = Number([...rest, last].join(""));
    const smallest = Number([...digits].sort((a, b) => a - b).join(""));
    const largest = Number([...digits].sort((a, b) => b - a).join(""));
    const swapped = Number([...digits].reverse().join(""));
    const wrong = [...new Set([smallest, largest, swapped])]
      .filter((n) => n !== answer)
      .slice(0, 3);
    while (wrong.length < 3) wrong.push(answer + 2 * (wrong.length + 1));
    return q(
      `Use the digits ${digits.join(", ")} once each to make the smallest 4-digit even number.`,
      answer.toLocaleString("en-NG"),
      wrong.map((n) => n.toLocaleString("en-NG")),
      "An even number ends in 0, 2, 4, 6 or 8. Put the smallest even digit last, then arrange the rest from smallest to largest.",
      "NERDC Primary 6 Mathematics, place value reasoning",
    );
  },
  () => {
    const start = int(2, 12);
    const seq = [start, start * 2, start * 4, start * 8];
    return q(
      `What comes next? ${seq.join(", ")}, ...`,
      start * 16,
      [start * 12, start * 18, start * 10],
      `Each number doubles, so the next number is ${start * 16}.`,
      "NERDC Primary 6 Mathematics, number patterns",
    );
  },
  () => {
    const th = int(10, 80);
    const h = int(1, 9);
    const t = int(1, 9);
    const o = int(1, 9);
    const total = th * 1000 + h * 100 + t * 10 + o;
    return q(
      `A number is ${th * 1000} + ${h * 100} + ${o}. What is the missing tens part if the number is ${total.toLocaleString("en-NG")}?`,
      t * 10,
      [t, h * 10, o * 10],
      `The number has ${t * 10} in the tens place.`,
      "NERDC Primary 6 Mathematics, place value",
    );
  },
  () => {
    const n = int(20000, 90000);
    const result = n + 3000;
    const rounded = Math.round(result / 1000) * 1000;
    return q(
      `Add 3,000 to ${n.toLocaleString("en-NG")}, then round the answer to the nearest thousand.`,
      rounded.toLocaleString("en-NG"),
      [result, Math.round(n / 1000) * 1000 + 3000, rounded + 1000].map((x) => x.toLocaleString("en-NG")),
      `${n.toLocaleString("en-NG")} + 3,000 = ${result.toLocaleString("en-NG")}, which rounds to ${rounded.toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, rounding after addition",
    );
  },
  () => {
    const n = int(2000, 12000);
    return q(
      `Which number is 250 less than ${n.toLocaleString("en-NG")}?`,
      (n - 250).toLocaleString("en-NG"),
      [n + 250, n - 25, n - 200].map((x) => x.toLocaleString("en-NG")),
      `Subtract 250: ${n.toLocaleString("en-NG")} - 250 = ${(n - 250).toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, subtraction reasoning",
    );
  },
  () => {
    const th = int(1, 9);
    const h = int(0, 9);
    const t = int(1, 9);
    const o = int(0, 9);
    const n = th * 1000 + h * 100 + t * 10 + o;
    return q(
      `I am a 4-digit number. My thousands digit is ${th}, my hundreds digit is ${h}, my tens digit is ${t}, and my ones digit is ${o}. What number am I?`,
      n.toLocaleString("en-NG"),
      [n + 100, n - 10, n + 1].map((x) => x.toLocaleString("en-NG")),
      `Put the digits in order: ${th}${h}${t}${o}.`,
      "NERDC Primary 6 Mathematics, place value puzzle",
    );
  },
  () => {
    const a = int(1000, 5000);
    const b = int(500, 1500);
    const left = a + b;
    const c = int(1000, 4000);
    const d = int(500, 1500);
    const right = c - d;
    const equal = left === right;
    return q(
      `Which is greater: ${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")} or ${c.toLocaleString("en-NG")} - ${d.toLocaleString("en-NG")}?`,
      equal ? "They are equal" : left > right ? `${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")}` : `${c.toLocaleString("en-NG")} - ${d.toLocaleString("en-NG")}`,
      equal
        ? [`${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")}`, `${c.toLocaleString("en-NG")} - ${d.toLocaleString("en-NG")}`, "Cannot tell"]
        : [`${c.toLocaleString("en-NG")} - ${d.toLocaleString("en-NG")}`, "They are equal", "Cannot tell"],
      `The first expression is ${left.toLocaleString("en-NG")}. The second is ${right.toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, comparing expressions",
    );
  },
];

// ------------------------------------------------------------------ addsub

const addsubBronze: Maker[] = [
  () => {
    const a = int(10, 89);
    const b = int(10, 89);
    return q(
      `What is ${a} + ${b}?`,
      a + b,
      [a + b + 10, a + b - 10, a + b + 1],
      `${a} + ${b} = ${a + b}.`,
      "NERDC Primary 4 Mathematics, addition",
    );
  },
  () => {
    const a = int(50, 99);
    const b = int(10, a - 1);
    return q(
      `What is ${a} - ${b}?`,
      a - b,
      [a - b + 10, a - b - 10, a - b + 1],
      `${a} - ${b} = ${a - b}.`,
      "NERDC Primary 4 Mathematics, subtraction",
    );
  },
  () => {
    const a = int(10, 60);
    const b = int(5, 30);
    return q(
      `${name()} has ${a} ${pick(ITEMS)}. She buys ${b} more. How many does she have now?`,
      a + b,
      [a + b + 1, a + b - 1, Math.abs(a - b)],
      `${a} + ${b} = ${a + b}.`,
      "NERDC Primary 4 Mathematics, addition word problems",
    );
  },
  () => {
    const total = int(12, 20);
    const a = int(3, total - 2);
    return q(
      `What number goes in the box? ${a} + __ = ${total}`,
      total - a,
      [total + a, total - a + 1, total - a - 1],
      `${total} - ${a} = ${total - a}.`,
      "NERDC Primary 4 Mathematics, missing addend",
    );
  },
  () => {
    const a = pick([100, 200, 300, 400, 500]);
    const b = pick([100, 200, 300, 400]);
    return q(
      `What is ${a} + ${b}?`,
      a + b,
      [a + b + 100, a + b - 100, a + b + 10],
      `${a} + ${b} = ${a + b}.`,
      "NERDC Primary 4 Mathematics, adding hundreds",
    );
  },
  () => {
    const a = int(60, 99);
    const b = int(10, 35);
    return q(
      `${name()} had ${a} naira. He spent ${b} naira. How much is left?`,
      naira(a - b),
      moneyDistractors(a - b, [10, -10, 100]),
      `${a} - ${b} = ${a - b} naira.`,
      "NERDC Primary 4 Mathematics, money subtraction",
    );
  },
  () => {
    const a = int(20, 49);
    return q(
      `What is ${a} + ${a}?`,
      a + a,
      [a + a + 1, a + a - 2, a * 3],
      `Doubling ${a} gives ${a + a}.`,
      "NERDC Primary 4 Mathematics, doubles",
    );
  },
  () => {
    const a = int(100, 500);
    const b = int(50, 200);
    return q(
      `What is ${a} - ${b}?`,
      a - b,
      [a - b + 10, a - b - 10, a + b],
      `${a} - ${b} = ${a - b}.`,
      "NERDC Primary 4 Mathematics, subtraction",
    );
  },
];

const addsubSilver: Maker[] = [
  () => {
    const a = int(120, 980);
    const b = int(120, 980);
    return q(
      `What is ${a} + ${b}?`,
      a + b,
      [a + b + 10, a + b - 100, a + b + 1],
      `${a} + ${b} = ${a + b}.`,
      "NERDC Primary 5 Mathematics, addition with regrouping",
    );
  },
  () => {
    const a = int(500, 1200);
    const b = int(1500, 4000);
    return q(
      `What is ${b} - ${a}?`,
      b - a,
      [b - a + 100, b - a - 100, b - a + 10],
      `${b} - ${a} = ${b - a}.`,
      "NERDC Primary 5 Mathematics, subtraction with regrouping",
    );
  },
  () => {
    const n = int(1000, 9000);
    const a = int(200, 800);
    return q(
      `What must be added to ${n.toLocaleString("en-NG")} to make ${(n + a).toLocaleString("en-NG")}?`,
      a,
      [a + 10, a - 10, a + 100],
      `The difference is ${a}.`,
      "NERDC Primary 5 Mathematics, missing number",
    );
  },
  () => {
    const a = int(200, 800);
    const b = int(200, 800);
    return q(
      `A shop sold ${a} bottles on Monday and ${b} bottles on Tuesday. How many bottles were sold in all?`,
      a + b,
      [a + b + 10, a + b - 10, Math.abs(a - b)],
      `${a} + ${b} = ${a + b} bottles.`,
      "NERDC Primary 5 Mathematics, addition word problems",
    );
  },
  () => {
    const a = int(1000, 5000);
    const b = int(100, 900);
    return q(
      `What is ${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")}?`,
      (a + b).toLocaleString("en-NG"),
      [a + b + 100, a + b - 100, a + b + 10].map((x) => x.toLocaleString("en-NG")),
      `${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")} = ${(a + b).toLocaleString("en-NG")}.`,
      "NERDC Primary 5 Mathematics, addition",
    );
  },
  () => {
    const a = int(500, 1500);
    const b = int(200, 1400);
    return q(
      `How much more is ${a} than ${b}?`,
      a - b,
      [a - b + 10, a - b - 10, a + b],
      `${a} - ${b} = ${a - b}.`,
      "NERDC Primary 5 Mathematics, finding the difference",
    );
  },
  () => {
    const a = int(1500, 6000);
    const b = int(100, 900);
    return q(
      `What is ${a.toLocaleString("en-NG")} - ${b.toLocaleString("en-NG")}?`,
      (a - b).toLocaleString("en-NG"),
      [a - b + 100, a - b - 100, a - b + 10].map((x) => x.toLocaleString("en-NG")),
      `${a.toLocaleString("en-NG")} - ${b.toLocaleString("en-NG")} = ${(a - b).toLocaleString("en-NG")}.`,
      "NERDC Primary 5 Mathematics, subtraction",
    );
  },
  () => {
    const a = int(200, 800);
    const b = int(100, 700);
    const c = int(50, 400);
    return q(
      `${name()} walked ${a} metres, then ${b} metres, then ${c} metres. How far did she walk?`,
      `${a + b + c} m`,
      [`${a + b + c + 10} m`, `${a + b + c - 10} m`, `${a + b} m`],
      `${a} + ${b} + ${c} = ${a + b + c} metres.`,
      "NERDC Primary 5 Mathematics, addition in measurement",
    );
  },
];

const addsubGold: Maker[] = [
  () => {
    const start = int(2000, 5000);
    const sold = int(500, 1500);
    const bought = int(200, 800);
    return q(
      `A trader had ${start.toLocaleString("en-NG")} oranges. She sold ${sold.toLocaleString("en-NG")} and then bought ${bought.toLocaleString("en-NG")} more. How many oranges does she have now?`,
      (start - sold + bought).toLocaleString("en-NG"),
      [start - sold, start - sold + bought + 100, start + sold + bought].map((x) => x.toLocaleString("en-NG")),
      `${start.toLocaleString("en-NG")} - ${sold.toLocaleString("en-NG")} + ${bought.toLocaleString("en-NG")} = ${(start - sold + bought).toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, two step word problems",
    );
  },
  () => {
    const target = int(3000, 9000);
    const a = int(1000, target - 1000);
    return q(
      `What must be added to ${a.toLocaleString("en-NG")} to make ${target.toLocaleString("en-NG")}?`,
      (target - a).toLocaleString("en-NG"),
      [target - a + 100, target - a - 100, target + a].map((x) => x.toLocaleString("en-NG")),
      `${target.toLocaleString("en-NG")} - ${a.toLocaleString("en-NG")} = ${(target - a).toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, missing number",
    );
  },
  () => {
    const a = int(2000, 6000);
    const b = int(1000, 4000);
    const c = int(500, 2000);
    const d = int(500, 3000);
    const left = a + b;
    const right = c + d;
    return q(
      `Which is greater: ${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")} or ${c.toLocaleString("en-NG")} + ${d.toLocaleString("en-NG")}?`,
      left === right ? "They are equal" : left > right ? "The first sum" : "The second sum",
      left === right ? ["The first sum", "The second sum", "Cannot tell"] : ["The other sum", "They are equal", "Cannot tell"],
      `The first sum is ${left.toLocaleString("en-NG")}. The second sum is ${right.toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, comparing sums",
    );
  },
  () => {
    const a = int(1200, 4800);
    const b = int(200, 900);
    const c = int(100, 500);
    return q(
      `Estimate ${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")} by rounding each number to the nearest hundred.`,
      (Math.round(a / 100) * 100 + Math.round(b / 100) * 100).toLocaleString("en-NG"),
      [a + b, Math.round(a / 100) * 100 + Math.round(b / 100) * 100 + 100, a + b - c].map((x) => x.toLocaleString("en-NG")),
      `${a.toLocaleString("en-NG")} rounds to ${(Math.round(a / 100) * 100).toLocaleString("en-NG")} and ${b.toLocaleString("en-NG")} rounds to ${(Math.round(b / 100) * 100).toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, estimation",
    );
  },
  () => {
    const cost = int(1500, 4500);
    const paid = 10000;
    return q(
      `${name()} bought a bag of rice for ${naira(cost)} and paid with ${naira(paid)}. How much change did she get?`,
      naira(paid - cost),
      moneyDistractors(paid - cost, [100, -100, 1000]),
      `${paid.toLocaleString("en-NG")} - ${cost.toLocaleString("en-NG")} = ${(paid - cost).toLocaleString("en-NG")} naira.`,
      "NERDC Primary 6 Mathematics, money problem solving",
    );
  },
  () => {
    const a = int(1000, 5000);
    const b = int(1000, 5000);
    const c = int(1000, 5000);
    return q(
      `A school bought ${a.toLocaleString("en-NG")} exercise books in January, ${b.toLocaleString("en-NG")} in February and ${c.toLocaleString("en-NG")} in March. How many books did it buy in all?`,
      (a + b + c).toLocaleString("en-NG"),
      [a + b, a + b + c + 100, a + b + c - 100].map((x) => x.toLocaleString("en-NG")),
      `${a.toLocaleString("en-NG")} + ${b.toLocaleString("en-NG")} + ${c.toLocaleString("en-NG")} = ${(a + b + c).toLocaleString("en-NG")}.`,
      "NERDC Primary 6 Mathematics, multi step addition",
    );
  },
  () => {
    const distance = int(5000, 15000);
    const done = int(1000, 4000);
    const left = distance - done;
    return q(
      `A car is on a ${distance.toLocaleString("en-NG")} km journey. It has travelled ${done.toLocaleString("en-NG")} km. How far is left?`,
      `${left.toLocaleString("en-NG")} km`,
      [`${left + 100} km`, `${left - 100} km`, `${distance + done} km`],
      `${distance.toLocaleString("en-NG")} - ${done.toLocaleString("en-NG")} = ${left.toLocaleString("en-NG")} km.`,
      "NERDC Primary 6 Mathematics, distance word problem",
    );
  },
  () => {
    const price = int(200, 900);
    const count = int(3, 8);
    const paid = 10000;
    const cost = price * count;
    return q(
      `${count} books cost ${naira(price)} each. What is the change from ${naira(paid)}?`,
      naira(paid - cost),
      moneyDistractors(paid - cost, [price, -price, 500]),
      `${count} × ${price} = ${cost} naira. ${paid} - ${cost} = ${paid - cost} naira.`,
      "NERDC Primary 6 Mathematics, multi step money problem",
    );
  },
];

// ------------------------------------------------------------------ muldiv

const muldivBronze: Maker[] = [
  () => {
    const a = int(2, 9);
    const b = int(2, 9);
    return q(
      `What is ${a} × ${b}?`,
      a * b,
      [a * b + a, a * b - a, a + b],
      `${a} groups of ${b} make ${a * b}.`,
      "NERDC Primary 4 Mathematics, multiplication tables",
    );
  },
  () => {
    const b = int(2, 9);
    const a = int(2, 9);
    return q(
      `What is ${a * b} ÷ ${b}?`,
      a,
      [a + 1, a - 1, b],
      `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${b} = ${a}.`,
      "NERDC Primary 4 Mathematics, division facts",
    );
  },
  () => {
    const bags = int(2, 6);
    const each = int(3, 9);
    return q(
      `${name()} has ${bags} bags with ${each} oranges in each bag. How many oranges are there?`,
      bags * each,
      [bags * each + each, bags * each - each, bags + each],
      `${bags} × ${each} = ${bags * each}.`,
      "NERDC Primary 4 Mathematics, multiplication word problems",
    );
  },
  () => {
    const a = int(2, 9);
    const b = int(2, 9);
    return q(
      `What number goes in the box? ${a} × __ = ${a * b}`,
      b,
      [b + 1, b - 1, a * b],
      `${a * b} ÷ ${a} = ${b}.`,
      "NERDC Primary 4 Mathematics, missing factor",
    );
  },
  () => {
    const a = int(2, 9);
    return q(
      `What is ${a} × 0?`,
      0,
      [a, 1, a * 10],
      "Any number multiplied by zero is zero.",
      "NERDC Primary 4 Mathematics, multiplication facts",
    );
  },
  () => {
    const people = pick([2, 3, 4, 5, 6]);
    const each = int(2, 9);
    const total = people * each;
    return q(
      `${total} sweets are shared equally among ${people} children. How many sweets does each child get?`,
      each,
      [each + 1, each - 1, people],
      `${total} ÷ ${people} = ${each}.`,
      "NERDC Primary 4 Mathematics, sharing",
    );
  },
  () => {
    const a = int(2, 9);
    return q(
      `What is ${a} × 10?`,
      a * 10,
      [a, a * 100, a * 10 + 10],
      `Multiplying by 10 adds a zero: ${a} becomes ${a * 10}.`,
      "NERDC Primary 4 Mathematics, multiplying by 10",
    );
  },
  () => {
    const a = int(2, 9);
    const b = int(2, 9);
    return q(
      `Which number is a multiple of ${a}?`,
      a * b,
      [a * b + 1, a * b - 1, a * b + 2],
      `${a} × ${b} = ${a * b}, so it is a multiple of ${a}.`,
      "NERDC Primary 4 Mathematics, multiples",
    );
  },
];

const muldivSilver: Maker[] = [
  () => {
    const a = int(12, 49);
    const b = int(3, 9);
    return q(
      `What is ${a} × ${b}?`,
      a * b,
      [a * b + b, a * b - b, a * b + 10],
      `${a} × ${b} = ${a * b}.`,
      "NERDC Primary 5 Mathematics, multiplication",
    );
  },
  () => {
    const b = int(3, 9);
    const a = int(5, 20);
    const total = a * b + int(1, b - 1);
    const remainder = total % b;
    return q(
      `What is the remainder when ${total} is divided by ${b}?`,
      remainder,
      [remainder + 1, remainder + 2, b - remainder],
      `${b} × ${Math.floor(total / b)} = ${total - remainder}. The remainder is ${remainder}.`,
      "NERDC Primary 5 Mathematics, division with remainders",
    );
  },
  () => {
    const crates = int(3, 9);
    const each = int(12, 30);
    return q(
      `A crate holds ${each} bottles. How many bottles are in ${crates} crates?`,
      crates * each,
      [crates * each + each, crates * each - each, crates + each],
      `${crates} × ${each} = ${crates * each}.`,
      "NERDC Primary 5 Mathematics, multiplication word problems",
    );
  },
  () => {
    const a = int(2, 9);
    const b = int(2, 12);
    return q(
      `Which number is a multiple of ${a}?`,
      a * b,
      [a * b + 1, a * b + 2, a * b - 1],
      `${a} × ${b} = ${a * b}.`,
      "NERDC Primary 5 Mathematics, multiples",
    );
  },
  () => {
    const n = int(24, 96);
    const factors = [2, 3, 4, 6, 8, 12].filter((f) => n % f === 0);
    const f = factors[0] ?? 2;
    return q(
      `Which number is a factor of ${n}?`,
      f,
      [f + 1, f + 2, n + 1],
      `${n} ÷ ${f} = ${n / f}, so ${f} is a factor.`,
      "NERDC Primary 5 Mathematics, factors",
    );
  },
  () => {
    const a = int(3, 9);
    const b = int(4, 15);
    return q(
      `What is ${a * b} ÷ ${a}?`,
      b,
      [b + 1, b - 1, a],
      `${a} × ${b} = ${a * b}, so the answer is ${b}.`,
      "NERDC Primary 5 Mathematics, division",
    );
  },
  () => {
    const per = int(3, 6);
    const count = int(4, 9);
    const eggs = per * count;
    return q(
      `A farmer packs ${eggs} eggs into boxes of ${per}. How many boxes does he fill?`,
      count,
      [count + 1, count - 1, per],
      `${eggs} ÷ ${per} = ${count}.`,
      "NERDC Primary 5 Mathematics, division word problems",
    );
  },
  () => {
    const a = int(2, 9);
    const b = int(3, 9);
    return q(
      `What number goes in the box? ${a} × __ = ${a * b}`,
      b,
      [b + 1, b - 1, a * b],
      `${a * b} ÷ ${a} = ${b}.`,
      "NERDC Primary 5 Mathematics, missing factor",
    );
  },
];

const muldivGold: Maker[] = [
  () => {
    const price = int(50, 250);
    const count = int(3, 8);
    return q(
      `${count} pens cost ${naira(price * count)}. What is the cost of one pen?`,
      naira(price),
      moneyDistractors(price, [10, -10, 50]),
      `${price * count} ÷ ${count} = ${price} naira.`,
      "NERDC Primary 6 Mathematics, unit price",
    );
  },
  () => {
    const eggs = int(60, 200);
    const per = pick([6, 8, 10, 12]);
    const boxes = Math.floor(eggs / per);
    const left = eggs % per;
    return q(
      `${eggs} eggs are packed in boxes of ${per}. How many full boxes are made?`,
      boxes,
      [boxes + 1, boxes - 1, left],
      `${eggs} ÷ ${per} = ${boxes} remainder ${left}. So ${boxes} full boxes are made.`,
      "NERDC Primary 6 Mathematics, division with remainders",
    );
  },
  () => {
    const a = int(2, 9);
    const b = int(2, 9);
    const c = int(2, 9);
    return q(
      `What is ${a} × ${b} + ${c}?`,
      a * b + c,
      [a * (b + c), a * b - c, a + b + c],
      `Multiply first: ${a} × ${b} = ${a * b}. Then add ${c} to get ${a * b + c}.`,
      "NERDC Primary 6 Mathematics, order of operations",
    );
  },
  () => {
    const pairs = [
      [8, 9],
      [6, 12],
      [4, 18],
      [3, 24],
    ] as const;
    const [a, b] = pick(pairs);
    return q(
      `Which two numbers multiply to give ${a * b} and add to give ${a + b}?`,
      `${a} and ${b}`,
      [`${a + 1} and ${b - 1}`, `${a - 1} and ${b + 1}`, `${a + 2} and ${b - 2}`],
      `${a} × ${b} = ${a * b} and ${a} + ${b} = ${a + b}.`,
      "NERDC Primary 6 Mathematics, factors and sums",
    );
  },
  () => {
    const a = int(3, 9);
    const b = int(4, 12);
    const c = int(2, 5);
    return q(
      `A trader packs ${a * b} oranges into bags of ${a}. She sells ${c} bags. How many oranges did she sell?`,
      a * c,
      [a * c + a, a * c - a, b * c],
      `${a * b} ÷ ${a} = ${b} bags. ${c} × ${a} = ${a * c} oranges.`,
      "NERDC Primary 6 Mathematics, multi step problem",
    );
  },
  () => {
    const n = int(2, 9);
    const m = int(2, 9);
    return q(
      `Which number is a common factor of ${n * 2} and ${n * 3}?`,
      n,
      [n + 1, n + 2, n * 3],
      `${n * 2} ÷ ${n} = 2 and ${n * 3} ÷ ${n} = 3, so ${n} is a common factor.`,
      "NERDC Primary 6 Mathematics, common factors",
    );
  },
  () => {
    const per = pick([4, 5, 6, 8]);
    const each = int(30, 90);
    const total = per * each;
    return q(
      `${name()} shares ${total} exercise books equally among ${per} classes. Each class gets the same number. How many books does each class get?`,
      each,
      [each + 1, each - 1, per],
      `${total} ÷ ${per} = ${each}.`,
      "NERDC Primary 6 Mathematics, equal sharing",
    );
  },
  () => {
    const a = int(2, 6);
    const b = int(3, 9);
    const c = int(2, 5);
    return q(
      `What is ${a * b} ÷ ${a} × ${c}?`,
      b * c,
      [b + c, b * c + c, a * b * c],
      `Work from left to right: ${a * b} ÷ ${a} = ${b}, then ${b} × ${c} = ${b * c}.`,
      "NERDC Primary 6 Mathematics, order of operations",
    );
  },
];

// ------------------------------------------------------------------ fractions

const fractionsBronze: Maker[] = [
  () => {
    const n = pick([2, 3, 4, 5, 6, 8]);
    const shaded = int(1, n - 1);
    return q(
      `A shape is cut into ${n} equal parts. ${shaded} part${shaded === 1 ? " is" : "s are"} shaded. What fraction is shaded?`,
      `${shaded}/${n}`,
      [`${n}/${shaded}`, `${shaded + 1}/${n}`, `${shaded}/${n + 1}`],
      `${shaded} out of ${n} equal parts is ${shaded}/${n}.`,
      "NERDC Primary 4 Mathematics, fractions of a whole",
    );
  },
  () => {
    return q(
      "Which fraction is one half?",
      "1/2",
      ["2/1", "1/3", "3/4"],
      "One half means one of two equal parts.",
      "NERDC Primary 4 Mathematics, halves",
    );
  },
  () => {
    return q(
      "How many quarters make one whole?",
      4,
      [2, 3, 5],
      "Four equal quarters make one whole.",
      "NERDC Primary 4 Mathematics, quarters",
    );
  },
  () => {
    const total = pick([8, 10, 12, 16, 20]);
    return q(
      `What is 1/2 of ${total}?`,
      total / 2,
      [total / 2 + 1, total / 2 - 1, total],
      `Half of ${total} is ${total / 2}.`,
      "NERDC Primary 4 Mathematics, fraction of a quantity",
    );
  },
  () => {
    return q(
      "Which fraction is larger, 1/3 or 1/5?",
      "1/3",
      ["1/5", "They are equal", "Cannot tell"],
      "When the top number is 1, the smaller bottom number gives the larger fraction.",
      "NERDC Primary 4 Mathematics, comparing unit fractions",
    );
  },
  () => {
    const slices = pick([8, 6, 10, 12]);
    const eaten = int(1, slices - 1);
    return q(
      `A pizza is cut into ${slices} equal slices. ${eaten} slices are eaten. What fraction is eaten?`,
      `${eaten}/${slices}`,
      [`${slices - eaten}/${slices}`, `${eaten}/${slices - 1}`, `${slices}/${eaten}`],
      `${eaten} out of ${slices} equal slices is ${eaten}/${slices}.`,
      "NERDC Primary 4 Mathematics, fractions in context",
    );
  },
  () => {
    return q(
      "Which fraction means 2 out of 5 equal parts?",
      "2/5",
      ["5/2", "2/3", "3/5"],
      "The top number counts the parts, the bottom counts all equal parts.",
      "NERDC Primary 4 Mathematics, reading fractions",
    );
  },
  () => {
    const total = pick([8, 12, 16, 20]);
    return q(
      `What is 1/4 of ${total}?`,
      total / 4,
      [total / 2, total / 4 + 1, total],
      `Divide ${total} into 4 equal parts. Each part is ${total / 4}.`,
      "NERDC Primary 4 Mathematics, quarters of a quantity",
    );
  },
];

const fractionsSilver: Maker[] = [
  () => {
    const pairs = [
      ["1/2", "2/4"],
      ["1/3", "2/6"],
      ["2/3", "4/6"],
      ["1/4", "2/8"],
      ["3/4", "6/8"],
    ] as const;
    const [a, b] = pick(pairs);
    return q(
      `Which fraction is equal to ${a}?`,
      b,
      [`${b.split("/")[0]}/${Number(b.split("/")[1]) + 1}`, `${Number(b.split("/")[0]) + 1}/${b.split("/")[1]}`, `${b.split("/")[1]}/${b.split("/")[0]}`],
      `${a} and ${b} name the same amount.`,
      "NERDC Primary 5 Mathematics, equivalent fractions",
    );
  },
  () => {
    const d = pick([5, 6, 8, 10, 12]);
    const a = int(1, d - 2);
    const b = int(1, d - a - 1);
    return q(
      `What is ${a}/${d} + ${b}/${d}?`,
      `${a + b}/${d}`,
      [`${a + b}/${d + d}`, `${a * b}/${d}`, `${a + b + 1}/${d}`],
      `The denominators are the same, so add the top numbers: ${a} + ${b} = ${a + b}.`,
      "NERDC Primary 5 Mathematics, adding fractions",
    );
  },
  () => {
    const d = pick([4, 5, 6, 8, 10]);
    const a = int(2, d - 1);
    const m = int(2, 6);
    const total = d * m;
    const answer = a * m;
    return q(
      `What is ${a}/${d} of ${total}?`,
      answer,
      [answer + a, answer - a, total],
      `Divide ${total} by ${d} to get ${m}, then multiply by ${a} to get ${answer}.`,
      "NERDC Primary 5 Mathematics, fraction of a quantity",
    );
  },
  () => {
    const d = pick([5, 6, 8, 10]);
    const a = int(1, d - 2);
    const b = int(1, d - 2);
    return q(
      `Which is greater, ${a}/${d} or ${b}/${d}?`,
      a > b ? `${a}/${d}` : `${b}/${d}`,
      a > b ? [`${b}/${d}`, "They are equal", "Cannot tell"] : [`${a}/${d}`, "They are equal", "Cannot tell"],
      `With the same denominator, the larger top number is greater.`,
      "NERDC Primary 5 Mathematics, comparing fractions",
    );
  },
  () => {
    const pairs = [
      [6, 8, "3/4"],
      [4, 8, "1/2"],
      [6, 9, "2/3"],
      [10, 15, "2/3"],
      [8, 12, "2/3"],
    ] as const;
    const [n, d, answer] = pick(pairs);
    return q(
      `Simplify ${n}/${d}.`,
      answer,
      [`${n}/${d}`, `${n + 1}/${d}`, `${n}/${d - 1}`],
      `Divide the top and bottom by ${n / Number(answer.split("/")[0])}.`,
      "NERDC Primary 5 Mathematics, simplifying fractions",
    );
  },
  () => {
    const whole = int(1, 3);
    const num = int(1, 3);
    return q(
      `What is ${whole * 4 + num}/4 as a mixed number?`,
      `${whole} ${num}/4`,
      [`${num} ${whole}/4`, `${whole + 1} ${num}/4`, `${whole} ${num + 1}/4`],
      `${whole * 4 + num} ÷ 4 = ${whole} remainder ${num}.`,
      "NERDC Primary 5 Mathematics, mixed numbers",
    );
  },
  () => {
    const total = pick([12, 18, 24, 30]);
    return q(
      `A class has ${total} pupils. 2/3 of them walk to school. How many walk?`,
      (total / 3) * 2,
      [(total / 3) * 2 + 2, (total / 3) * 2 - 2, total / 3],
      `${total} ÷ 3 = ${total / 3}. Then ${total / 3} × 2 = ${(total / 3) * 2}.`,
      "NERDC Primary 5 Mathematics, fractions in word problems",
    );
  },
  () => {
    const d = pick([6, 8, 10, 12]);
    const a = int(2, d - 1);
    const b = int(1, a - 1);
    return q(
      `What is ${a}/${d} - ${b}/${d}?`,
      `${a - b}/${d}`,
      [`${a + b}/${d}`, `${a - b}/${d - d}`, `${a - b + 1}/${d}`],
      `Subtract the top numbers: ${a} - ${b} = ${a - b}.`,
      "NERDC Primary 5 Mathematics, subtracting fractions",
    );
  },
];

const fractionsGold: Maker[] = [
  () => {
    const d1 = pick([2, 3, 4, 5]);
    const d2 = d1 + pick([1, 2, 3, 4]);
    const a = 1;
    const b = 1;
    return q(
      `Which fraction is greater, ${a}/${d1} or ${b}/${d2}?`,
      `${a}/${d1}`,
      [`${b}/${d2}`, "They are equal", "Cannot tell"],
      "For unit fractions, the smaller denominator gives the larger fraction.",
      "NERDC Primary 6 Mathematics, comparing unlike fractions",
    );
  },
  () => {
    const total = pick([24, 36, 48, 60]);
    return q(
      `A tank is 3/4 full. It holds ${total} litres when full. How many litres are in the tank?`,
      (total / 4) * 3,
      [(total / 4) * 3 + 3, (total / 4) * 3 - 3, total / 4],
      `${total} ÷ 4 = ${total / 4}. Then ${total / 4} × 3 = ${(total / 4) * 3} litres.`,
      "NERDC Primary 6 Mathematics, fractions of a quantity",
    );
  },
  () => {
    const d = pick([6, 8, 10, 12]);
    const a = int(2, d - 2);
    const b = int(1, d - a - 1);
    const sum = a + b;
    const g = gcd(sum, d);
    const answer = `${sum / g}/${d / g}`;
    const wrong = [...new Set([
      `${sum}/${d}`,
      `${sum + 1}/${d}`,
      `${sum}/${d * 2}`,
      `${sum - 1}/${d}`,
      `${sum + 2}/${d}`,
      `${sum}/${d + 1}`,
    ])].filter((x) => x !== answer).slice(0, 3);
    return q(
      `What is ${a}/${d} + ${b}/${d} in simplest form?`,
      answer,
      wrong,
      `Add the top numbers to get ${sum}/${d}. Divide both parts by ${g} to get ${answer}.`,
      "NERDC Primary 6 Mathematics, adding fractions",
    );
  },
  () => {
    const total = pick([20, 30, 40, 50]);
    const spent = pick([1, 2, 3]);
    return q(
      `${name()} had ${naira(total * 100)}. She spent 2/5 of it. How much did she spend?`,
      naira((total * 100 * 2) / 5),
      moneyDistractors((total * 100 * 2) / 5, [100, -100, 500]),
      `${total * 100} ÷ 5 = ${(total * 100) / 5}. Then × 2 = ${(total * 100 * 2) / 5} naira.`,
      "NERDC Primary 6 Mathematics, fractions and money",
    );
  },
  () => {
    const d = pick([3, 4, 5, 6]);
    const a = d - 1;
    return q(
      `Which fraction is closest to 1?`,
      `${a}/${d}`,
      [`${a - 1}/${d}`, `${a}/${d + 1}`, `${1}/${d}`],
      `${a}/${d} is only ${d - a}/${d} away from one whole.`,
      "NERDC Primary 6 Mathematics, fractions near one",
    );
  },
  () => {
    const whole = int(1, 3);
    const num = int(1, 3);
    const add = int(1, 3);
    const d = 4;
    return q(
      `What is ${whole} ${num}/4 + ${add}/4?`,
      `${whole} ${(num + add) % 4}/4`,
      [`${whole + 1} ${(num + add) % 4}/4`, `${whole} ${(num + add + 1) % 4}/4`, `${whole} ${num}/4`],
      `Add the quarters: ${num}/4 + ${add}/4 = ${num + add}/4.`,
      "NERDC Primary 6 Mathematics, mixed number addition",
    );
  },
  () => {
    const total = pick([12, 24, 36, 48]);
    return q(
      `${name()} has ${total} oranges. He gives 1/3 to his sister and 1/4 to his brother. How many oranges are left?`,
      total - total / 3 - total / 4,
      [total / 3 + total / 4, total - total / 3, total / 4],
      `1/3 of ${total} is ${total / 3}. 1/4 is ${total / 4}. ${total} - ${total / 3} - ${total / 4} = ${total - total / 3 - total / 4}.`,
      "NERDC Primary 6 Mathematics, two fraction parts",
    );
  },
  () => {
    const order = [
      ["2/3", "3/5", "7/10"],
      ["1/2", "3/8", "5/8"],
      ["2/5", "1/2", "3/4"],
    ] as const;
    const list = pick(order);
    return q(
      `Which list is in order from smallest to largest?`,
      [...list].sort((a, b) => Number(a.split("/")[0]) / Number(a.split("/")[1]) - Number(b.split("/")[0]) / Number(b.split("/")[1])).join(", "),
      [list.join(", "), [...list].reverse().join(", "), [list[0], list[2], list[1]].join(", ")],
      "Compare each fraction by dividing the top number by the bottom number.",
      "NERDC Primary 6 Mathematics, ordering fractions",
    );
  },
];

// ------------------------------------------------------------------ decimals

const decimalsBronze: Maker[] = [
  () => {
    const n = int(1, 9);
    return q(
      `What is ${n}/10 as a decimal?`,
      `0.${n}`,
      [`0.0${n}`, `${n}.0`, `0.${n + 1}`],
      `${n}/10 means ${n} tenths, which is 0.${n}.`,
      "NERDC Primary 4 Mathematics, tenths as decimals",
    );
  },
  () => {
    const n = int(1, 9);
    return q(
      `In 4.${n}, what does the digit ${n} mean?`,
      `${n} tenths`,
      [`${n} hundredths`, `${n} ones`, `${n} tens`],
      `The first digit after the decimal point shows tenths.`,
      "NERDC Primary 4 Mathematics, decimal place value",
    );
  },
  () => {
    return q(
      "Which is larger, 0.5 or 0.45?",
      "0.5",
      ["0.45", "They are equal", "Cannot tell"],
      "0.5 is five tenths. 0.45 is four tenths and five hundredths, so 0.5 is larger.",
      "NERDC Primary 4 Mathematics, comparing decimals",
    );
  },
  () => {
    const n = int(1, 9);
    return q(
      `What is 0.${n} as a fraction?`,
      `${n}/10`,
      [`${n}/100`, `10/${n}`, `${n}/1`],
      `One digit after the point means tenths.`,
      "NERDC Primary 4 Mathematics, decimals as fractions",
    );
  },
  () => {
    return q(
      "What is 1/4 as a decimal?",
      "0.25",
      ["0.4", "0.14", "0.5"],
      "One quarter is 25 hundredths, so 0.25.",
      "NERDC Primary 4 Mathematics, common decimals",
    );
  },
  () => {
    const n = int(11, 29);
    return q(
      `How many tenths are in ${(n / 10).toFixed(1)}?`,
      n,
      [n + 10, n - 1, n * 10],
      `${(n / 10).toFixed(1)} is ${n} tenths.`,
      "NERDC Primary 4 Mathematics, tenths",
    );
  },
  () => {
    const a = int(1, 4);
    const b = int(1, 4);
    return q(
      `What is 0.${a} + 0.${b}?`,
      (a / 10 + b / 10).toFixed(1),
      [`0.${a + b + 1}`, `0.${a * b}`, `${a + b}.0`],
      `${a} tenths + ${b} tenths = ${a + b} tenths, which is ${(a / 10 + b / 10).toFixed(1)}.`,
      "NERDC Primary 4 Mathematics, adding tenths",
    );
  },
  () => {
    return q(
      "Which decimal means five hundredths?",
      "0.05",
      ["0.5", "0.005", "5.0"],
      "Hundredths take two places after the decimal point.",
      "NERDC Primary 4 Mathematics, hundredths",
    );
  },
];

const decimalsSilver: Maker[] = [
  () => {
    const a = int(10, 49);
    const b = int(10, 49);
    return q(
      `What is ${(a / 10).toFixed(1)} + ${(b / 10).toFixed(1)}?`,
      ((a + b) / 10).toFixed(1),
      [((a + b) / 100).toFixed(2), ((a + b) / 10 + 0.1).toFixed(1), (a + b).toString()],
      `${a} tenths + ${b} tenths = ${a + b} tenths.`,
      "NERDC Primary 5 Mathematics, adding decimals",
    );
  },
  () => {
    const a = int(30, 90);
    const b = int(10, a - 5);
    return q(
      `What is ${(a / 10).toFixed(1)} - ${(b / 10).toFixed(1)}?`,
      ((a - b) / 10).toFixed(1),
      [((a + b) / 10).toFixed(1), ((a - b) / 100).toFixed(2), ((a - b) / 10 + 0.1).toFixed(1)],
      `${a} tenths - ${b} tenths = ${a - b} tenths.`,
      "NERDC Primary 5 Mathematics, subtracting decimals",
    );
  },
  () => {
    const price = int(120, 480);
    const count = int(2, 4);
    return q(
      `A pencil costs ${naira(price / 100)}. What do ${count} pencils cost?`,
      naira((price * count) / 100),
      moneyDistractors((price * count) / 100, [0.5, -0.5, 1]),
      `${price / 100} × ${count} = ${((price * count) / 100).toFixed(2)} naira.`,
      "NERDC Primary 5 Mathematics, money with decimals",
    );
  },
  () => {
    const n = int(12, 89);
    return q(
      `What is ${(n / 10).toFixed(1)} × 10?`,
      n,
      [n * 10, n / 10, n + 10],
      "Multiplying by 10 moves the decimal point one place to the right.",
      "NERDC Primary 5 Mathematics, multiplying decimals by 10",
    );
  },
  () => {
    return q(
      "Which is larger, 0.7 or 0.68?",
      "0.7",
      ["0.68", "They are equal", "Cannot tell"],
      "0.7 is 0.70, which is greater than 0.68.",
      "NERDC Primary 5 Mathematics, comparing decimals",
    );
  },
  () => {
    const n = int(31, 99);
    return q(
      `Round ${(n / 10).toFixed(1)} to the nearest whole number.`,
      Math.round(n / 10),
      [Math.floor(n / 10), Math.ceil(n / 10) + 1, Math.round(n / 10) + 1],
      `The tenths digit is ${n % 10}, so the number rounds to ${Math.round(n / 10)}.`,
      "NERDC Primary 5 Mathematics, rounding decimals",
    );
  },
  () => {
    const a = int(1, 9);
    const b = int(1, 9);
    return q(
      `What is 0.0${a} + 0.0${b}?`,
      ((a + b) / 100).toFixed(2),
      [`0.${a + b}`, (a + b).toFixed(2), `0.0${a + b}`],
      `${a} hundredths + ${b} hundredths = ${a + b} hundredths.`,
      "NERDC Primary 5 Mathematics, hundredths",
    );
  },
  () => {
    const n = int(105, 995);
    return q(
      `Which number is ${n / 100}?`,
      (n / 100).toFixed(2),
      [(n / 10).toFixed(1), (n / 1000).toFixed(3), n.toFixed(2)],
      `${n} hundredths is ${(n / 100).toFixed(2)}.`,
      "NERDC Primary 5 Mathematics, decimal notation",
    );
  },
];

const decimalsGold: Maker[] = [
  () => {
    const n = pick([200, 400, 500, 800, 1200]);
    return q(
      `What is 10% of ${naira(n)}?`,
      naira(n / 10),
      moneyDistractors(n / 10, [n / 10, -n / 20, n / 5]),
      `10% means one tenth. ${n} ÷ 10 = ${n / 10}.`,
      "NERDC Primary 6 Mathematics, percentages",
    );
  },
  () => {
    return q(
      "What is 1/4 as a percentage?",
      "25%",
      ["14%", "40%", "50%"],
      "One quarter of 100 is 25, so 25%.",
      "NERDC Primary 6 Mathematics, fractions and percentages",
    );
  },
  () => {
    const n = int(2, 9);
    return q(
      `What is 0.${n} as a percentage?`,
      `${n * 10}%`,
      [`${n}%`, `${n * 100}%`, `${n + 10}%`],
      `0.${n} is ${n} tenths, which is ${n * 10} hundredths or ${n * 10}%.`,
      "NERDC Primary 6 Mathematics, decimals and percentages",
    );
  },
  () => {
    const n = int(20, 80);
    return q(
      `What is 25% of ${n * 4}?`,
      n,
      [n + 5, n - 5, n * 2],
      `25% is one quarter. ${n * 4} ÷ 4 = ${n}.`,
      "NERDC Primary 6 Mathematics, percentages of quantities",
    );
  },
  () => {
    const price = int(15, 60) * 100;
    return q(
      `A shirt costs ${naira(price)}. A shop gives a 10% discount. How much is the discount?`,
      naira(price / 10),
      moneyDistractors(price / 10, [price / 5, -price / 10, price / 4]),
      `10% of ${price} is ${price / 10} naira.`,
      "NERDC Primary 6 Mathematics, percentage discount",
    );
  },
  () => {
    const n = int(12, 45);
    return q(
      `A bottle holds ${(n / 10).toFixed(1)} litres. How many litres are in 4 bottles?`,
      `${((n / 10) * 4).toFixed(1)} litres`,
      [`${((n / 10) * 4 + 1).toFixed(1)} litres`, `${((n / 10) * 4 - 1).toFixed(1)} litres`, `${(n / 10).toFixed(1)} litres`],
      `${(n / 10).toFixed(1)} × 4 = ${((n / 10) * 4).toFixed(1)} litres.`,
      "NERDC Primary 6 Mathematics, decimals in measurement",
    );
  },
  () => {
    const a = int(1, 9);
    const b = int(1, 9);
    return q(
      `What is 0.${a} × 0.${b}?`,
      (a * b / 100).toFixed(2),
      [(a * b / 10).toFixed(1), (a + b / 10).toFixed(2), (a * b).toFixed(2)],
      `${a} tenths × ${b} tenths = ${a * b} hundredths, which is ${(a * b / 100).toFixed(2)}.`,
      "NERDC Primary 6 Mathematics, multiplying decimals",
    );
  },
  () => {
    const n = int(300, 900);
    return q(
      `A family saves 20% of ${naira(n)} each month. How much do they save?`,
      naira(n / 5),
      moneyDistractors(n / 5, [n / 10, -n / 10, n / 4]),
      `20% is one fifth. ${n} ÷ 5 = ${n / 5}.`,
      "NERDC Primary 6 Mathematics, percentages in money",
    );
  },
];

const TOPIC_MAKERS: Record<string, Record<string, Maker[]>> = {
  number: { bronze: numberBronze, silver: numberSilver, gold: numberGold },
  addsub: { bronze: addsubBronze, silver: addsubSilver, gold: addsubGold },
  muldiv: { bronze: muldivBronze, silver: muldivSilver, gold: muldivGold },
  fractions: { bronze: fractionsBronze, silver: fractionsSilver, gold: fractionsGold },
  decimals: { bronze: decimalsBronze, silver: decimalsSilver, gold: decimalsGold },
};

export {};

// The remaining topics are defined in the companion file to keep each file readable.
import { geometryMakers, measurementMakers, moneyMakers } from "./generate-math-more";

Object.assign(TOPIC_MAKERS, {
  geometry: geometryMakers,
  measurement: measurementMakers,
  "money-data": moneyMakers,
});

const LEVEL_LETTER = { bronze: "B", silver: "S", gold: "G" } as const;
const SUBJECT_PREFIX = "MAT";
const BAND = bandById("10-12")!;
const OUT = path.resolve("src/server/data/questions/10-12/mathematics");

function buildQuestions(
  topicId: string,
  level: "bronze" | "silver" | "gold",
  makers: Maker[],
  seen: Set<string>,
): Question[] {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) throw new Error(`unknown topic ${topicId}`);
  const drafts: Draft[] = [];
  let attempt = 0;
  while (drafts.length < 40) {
    attempt += 1;
    if (attempt > 20000) throw new Error(`could not make 40 unique questions for ${topicId} ${level}`);
    const maker = makers[attempt % makers.length];
    if (!maker) throw new Error(`no maker for ${topicId} ${level}`);
    const d = maker(rng);
    const key = d.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    drafts.push(d);
  }

  return drafts.map((d, i) => {
    const idx = i % 4;
    const distractors = [...new Set(d.distractors.filter((x) => x !== d.correct))];
    let n = 1;
    while (distractors.length < 3) {
      const extra = String(Number(d.correct.replace(/[^0-9.-]/g, "")) + n * 7);
      if (extra !== d.correct && !distractors.includes(extra)) distractors.push(extra);
      n += 1;
    }
    const options = [...distractors.slice(0, 3)];
    options.splice(idx, 0, d.correct);
    return {
      code: `${BAND.token}-${SUBJECT_PREFIX}-${topic.codePrefix}-${LEVEL_LETTER[level]}-${String(i + 1).padStart(3, "0")}`,
      band: BAND.id,
      subject: "mathematics",
      topic: topic.id,
      level,
      text: d.text,
      options,
      correctIndex: idx,
      explanation: d.explanation,
      curriculumRef: d.ref,
      author: "AI draft v1",
      reviewer: null,
      status: "draft",
    } as Question;
  });
}

let errors = 0;
for (const topicId of Object.keys(TOPIC_MAKERS)) {
  const makers = TOPIC_MAKERS[topicId];
  if (!makers) continue;
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) continue;
  const questions: Question[] = [];
  const seen = new Set<string>();
  for (const level of ["bronze", "silver", "gold"] as const) {
    questions.push(...buildQuestions(topicId, level, makers[level] ?? [], seen));
  }
  const file: TopicFile = { band: BAND.id, subject: "mathematics", topic: topic.id, title: topic.label, questions };
  const issues = validateTopicFile(file, { perLevel: 40, maxGrade: BAND.readingGrade + 1, warnGrade: BAND.readingGrade });
  const bad = issues.filter((i) => i.severity === "error");
  if (!isClean(issues)) {
    errors += bad.length;
    console.error(`\n${topicId}: ${bad.length} errors`);
    for (const issue of bad.slice(0, 12)) console.error(`  ${issue.code} ${issue.message}`);
  }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(path.join(OUT, `${topicId}.json`), JSON.stringify(file, null, 2) + "\n");
  console.log(`${topicId}: ${questions.length} questions, ${bad.length} errors`);
}

if (errors > 0) process.exitCode = 1;