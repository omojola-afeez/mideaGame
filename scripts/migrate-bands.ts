import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * One-off migration: move the original question banks into band 10-12.
 * Adds the band field to each file and question, and prefixes every code with the band token.
 * Existing content is tagged as the 10-12 band (reading grade 6.5), the closest fit for
 * Primary 4 to 6 content written for ages 9 to 11.
 */

const ROOT = path.resolve("src/server/data/questions");
const BAND = "10-12";
const TOKEN = "10";
const SUBJECT_DIRS: Record<string, string> = {
  english: "english",
  mathematics: "mathematics",
  code: "code-ai",
};

let migrated = 0;
let questions = 0;
const remainingDirs = new Set<string>();

for (const [oldDir, subjectId] of Object.entries(SUBJECT_DIRS)) {
  const src = path.join(ROOT, oldDir);
  if (!existsSync(src)) continue;
  for (const entry of readdirSync(src)) {
    if (!entry.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(path.join(src, entry), "utf8")) as {
      band?: string;
      subject: string;
      topic: string;
      title: string;
      questions: Array<Record<string, unknown>>;
    };
    raw.band = BAND;
    let touched = 0;
    for (const q of raw.questions) {
      q.band = BAND;
      const code = typeof q.code === "string" ? q.code : "";
      if (!code.startsWith(`${TOKEN}-`)) q.code = `${TOKEN}-${code}`;
      touched += 1;
    }
    const destDir = path.join(ROOT, BAND, subjectId);
    mkdirSync(destDir, { recursive: true });
    writeFileSync(path.join(destDir, entry), JSON.stringify(raw, null, 2) + "\n");
    rmSync(path.join(src, entry));
    migrated += 1;
    questions += touched;
    console.log(`migrated ${raw.subject}/${raw.topic}: ${touched} questions`);
  }
}

// Remove now-empty subject directories.
for (const oldDir of Object.keys(SUBJECT_DIRS)) {
  const src = path.join(ROOT, oldDir);
  if (existsSync(src)) {
    const leftover = readdirSync(src);
    if (leftover.length === 0) rmSync(src, { recursive: true, force: true });
    else remainingDirs.add(`${oldDir}: ${leftover.join(", ")}`);
  }
}

console.log(`\nmigrated ${migrated} files, ${questions} questions into band ${BAND}`);
if (remainingDirs.size > 0) {
  console.log("remaining dirs not removed:", [...remainingDirs]);
}
