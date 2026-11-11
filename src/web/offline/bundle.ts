/**
 * Offline question bundle. Loaded once per session and cached by the service worker.
 * The bundle contains answers and explanations, so the client can run fully offline.
 */

export interface OfflineQuestion {
  code: string;
  band: string;
  subject: string;
  topic: string;
  level: string;
  text: string;
  passage?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  curriculumRef: string;
}

export interface OfflineRoundInput {
  band: string;
  topic: string;
  level: string;
  excludeCodes: string[];
  size: number;
}

let cache: OfflineQuestion[] | null = null;
let loadPromise: Promise<OfflineQuestion[]> | null = null;

export async function loadQuestions(): Promise<OfflineQuestion[]> {
  if (cache) return cache;
  loadPromise ??= fetch("/offline-questions.json")
    .then((res) => {
      if (!res.ok) throw new Error(`offline bundle missing (${res.status})`);
      return res.json() as Promise<{ questions?: OfflineQuestion[] }>;
    })
    .then((data) => {
      cache = data.questions ?? [];
      return cache;
    });
  return loadPromise;
}

function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

/**
 * Pick a round's worth of questions for a topic. Unseen questions at the chosen level
 * come first, then unseen across the topic, and only then seen ones. Deterministic enough
 * to feel fresh while never running dry.
 */
export function pickOfflineQuestions(all: OfflineQuestion[], input: OfflineRoundInput): OfflineQuestion[] {
  const inTopic = all.filter((q) => q.band === input.band && q.topic === input.topic);
  const excluded = new Set(input.excludeCodes);
  const exact = inTopic.filter((q) => q.level === input.level && !excluded.has(q.code));
  const anyLevel = inTopic.filter((q) => !excluded.has(q.code));
  const any = inTopic;

  const pool = [
    ...shuffle(exact),
    ...shuffle(anyLevel.filter((q) => q.level !== input.level)),
    ...shuffle(any.filter((q) => excluded.has(q.code))),
  ];
  const seen = new Set<string>();
  const picked: OfflineQuestion[] = [];
  for (const q of pool) {
    if (picked.length >= input.size) break;
    if (seen.has(q.code)) continue;
    seen.add(q.code);
    picked.push(q);
  }
  return shuffle(picked);
}
