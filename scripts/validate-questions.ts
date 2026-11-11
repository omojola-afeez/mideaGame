import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { TOPICS } from "../src/shared/constants";
import type { TopicFile } from "../src/shared/question";
import { isClean, summarise, validateTopicFile, type Issue } from "../src/server/data/validate";

const ROOT = path.resolve("src/server/data/questions");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

function label(file: string): string {
  return path.relative(process.cwd(), file);
}

const fileArg = process.argv.find((a) => a.startsWith("--file="))?.slice("--file=".length);
const files = fileArg ? [path.resolve(fileArg)] : walk(ROOT);

let totalQuestions = 0;
let totalErrors = 0;
let totalWarnings = 0;
let badFiles = 0;

for (const file of files) {
  let data: TopicFile;
  try {
    data = JSON.parse(readFileSync(file, "utf8")) as TopicFile;
  } catch (err) {
    badFiles += 1;
    totalErrors += 1;
    console.error(`\n${label(file)}\n  ERROR  could not read JSON: ${err instanceof Error ? err.message : "unknown"}`);
    continue;
  }

  const topic = TOPICS.find((t) => t.id === data.topic);
  const levelCounts = { bronze: 0, silver: 0, gold: 0 } as Record<string, number>;
  if (Array.isArray(data.questions)) {
    for (const q of data.questions) levelCounts[q?.level] = (levelCounts[q?.level] ?? 0) + 1;
  }
  const counts = Object.values(levelCounts);
  // Enforce a fixed count per level when every level is equally filled (the generator contract).
  // Pass 0 to skip when a file is intentionally uneven.
  const perLevel = counts.length > 0 && counts.every((n) => n === counts[0]) ? (counts[0] ?? 0) : 0;
  const issues: Issue[] = [];
  if (!data.title || typeof data.title !== "string") {
    issues.push({ severity: "error", code: "missing_title", message: "File needs a title" });
  }
  if (!topic) {
    issues.push({ severity: "error", code: "unknown_topic", message: `Unknown topic ${data.topic}` });
  }
  issues.push(...validateTopicFile(data, { perLevel }));

  totalQuestions += Array.isArray(data.questions) ? data.questions.length : 0;
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  totalErrors += errors.length;
  totalWarnings += warnings.length;
  if (!isClean(issues)) badFiles += 1;

  console.log(`\n${label(file)}: ${data.questions?.length ?? 0} questions, ${summarise(issues)}`);
  for (const issue of errors) {
    console.log(`  ERROR  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
  }
  for (const issue of warnings.slice(0, 8)) {
    console.log(`  WARN   ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
  }
  if (warnings.length > 8) console.log(`  WARN   ... ${warnings.length - 8} more warnings`);
}

console.log(
  `\nSummary: ${files.length} files, ${totalQuestions} questions, ${totalErrors} errors, ${totalWarnings} warnings.`,
);
if (totalErrors > 0 || badFiles > 0) {
  process.exitCode = 1;
}