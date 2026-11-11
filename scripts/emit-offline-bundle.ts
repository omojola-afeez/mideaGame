import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Bundles the full question bank into dist/web/offline-questions.json.
 * The file holds answers and explanations, so the client can run a fully offline practice round.
 * It is served as a static asset and cached by the service worker. Not sensitive data.
 */

const ROOT = path.resolve("src/server/data/questions");
const OUT_DIR = path.resolve("dist/web");
const OUT = path.join(OUT_DIR, "offline-questions.json");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".json")) out.push(full);
  }
  return out;
}

interface BundleQuestion {
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

const questions: BundleQuestion[] = [];
for (const file of walk(ROOT)) {
  let data: { questions?: BundleQuestion[] };
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`bad json in ${file}: ${err instanceof Error ? err.message : "unknown"}`);
  }
  for (const q of data.questions ?? []) {
    questions.push({
      code: q.code,
      band: q.band,
      subject: q.subject,
      topic: q.topic,
      level: q.level,
      text: q.text,
      ...(q.passage ? { passage: q.passage } : {}),
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      curriculumRef: q.curriculumRef,
    });
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify({ questions }));
console.log(`offline bundle written: ${questions.length} questions, ${(JSON.stringify({ questions }).length / 1024 / 1024).toFixed(2)} MB`);
