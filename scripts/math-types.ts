export type Rng = () => number;

export interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
  ref: string;
}

export type Maker = (rng: Rng) => Draft;

export function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

export function draft(
  text: string,
  correct: string | number,
  distractors: Array<string | number>,
  explanation: string,
  ref: string,
): Draft {
  return {
    text,
    correct: String(correct),
    distractors: distractors.map(String),
    explanation,
    ref,
  };
}

export function naira(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const text = Number.isInteger(rounded)
    ? rounded.toLocaleString("en-NG")
    : rounded.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `₦${text}`;
}

export function moneyDistractors(correct: number, deltas: number[]): string[] {
  return deltas.map((d) => naira(correct + d));
}

export function thousands(n: number): string {
  return n.toLocaleString("en-NG");
}

const NAMES = ["Ada", "Chidi", "Ngozi", "Tunde", "Amina", "Musa", "Ekaette", "Ifeoma", "Bola", "Sani"] as const;

export function name(rng: Rng): string {
  return pick(rng, NAMES);
}