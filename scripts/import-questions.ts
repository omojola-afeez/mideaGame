import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { BANDS, TOPICS, SUBJECTS, bandById, type SubjectId, type TopicId } from "../src/shared/constants";
import type { ContentStatus, Question } from "../src/shared/question";
import { isClean, summarise, validateTopicFile } from "../src/server/data/validate";

/**
 * Imports teacher written questions from a CSV template.
 * The template lives in docs/teacher-questions-template.csv.
 * Every imported question is validated first, so the live bank never accepts an unverified draft.
 */

interface Row {
  [key: string]: string;
}

const HEADER = [
  "code",
  "band",
  "subject",
  "topic",
  "level",
  "text",
  "options",
  "correctIndex",
  "explanation",
  "curriculumRef",
  "author",
  "reviewer",
  "status",
  "hint",
  "passage",
];

const FOLDER: Record<SubjectId, string> = {
  english: "english",
  mathematics: "mathematics",
  science: "science",
  "home-economics": "home-economics",
  "social-studies": "social-studies",
  arabic: "arabic",
  "code-ai": "code-ai",
};

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i] ?? "";
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = splitCsvLine(lines[0] ?? "").map((h) => h.trim());
  const rows: Row[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line).map((c) => c.trim());
    const row: Row = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function toQuestion(row: Row): Question {
  const options = (row.options ?? "").split("|").map((o) => o.trim());
  const hint = (row.hint ?? "").trim();
  const status = (row.status ?? "draft") as ContentStatus;
  const passage = (row.passage ?? "").trim();
  const band = (row.band ?? "").trim() as Question["band"];
  return {
    code: row.code ?? "",
    band,
    subject: (row.subject ?? "") as SubjectId,
    topic: (row.topic ?? "") as TopicId,
    level: (row.level ?? "bronze") as Question["level"],
    text: row.text ?? "",
    ...(passage ? { passage } : {}),
    options,
    correctIndex: Number(row.correctIndex ?? 0),
    explanation: row.explanation ?? "",
    hint: hint || undefined,
    curriculumRef: row.curriculumRef ?? "",
    author: row.author ?? "",
    reviewer: row.reviewer || null,
    status,
  };
}

function main(): void {
  const file = process.argv.find((a) => a.startsWith("--file="))?.slice("--file=".length) ?? "docs/teacher-questions-template.csv";
  const rows = parseCsv(readFileSync(file, "utf8"));
  const grouped = new Map<string, Question[]>();
  for (const row of rows) {
    const q = toQuestion(row);
    const key = `${q.band}:${q.subject}:${q.topic}`;
    const list = grouped.get(key) ?? [];
    list.push(q);
    grouped.set(key, list);
  }

  let errorCount = 0;
  const writes: Array<{ band: Question["band"]; subject: SubjectId; topic: TopicId; file: { band: Question["band"]; subject: SubjectId; topic: TopicId; title: string; questions: Question[] } }> = [];
  for (const [key, questions] of grouped) {
    const [band, subject, topic] = key.split(":") as [Question["band"], SubjectId, TopicId];
    const topicDef = TOPICS.find((t) => t.id === topic && t.subjectId === subject);
    if (!topicDef || !bandById(band)) {
      errorCount += 1;
      console.error(`unknown topic or band ${key}`);
      continue;
    }
    const file = { band, subject, topic, title: topicDef.label, questions };
    const issues = validateTopicFile(file, { perLevel: topicDef.id === "code-and-ai" ? 8 : 40 });
    const bad = issues.filter((i) => i.severity === "error");
    if (bad.length > 0) {
      errorCount += bad.length;
      for (const issue of bad) console.error(`${topic}: ${issue.code} ${issue.message}`);
      continue;
    }
    writes.push({ band, subject, topic, file });
  }

  if (errorCount > 0) process.exitCode = 1;

  for (const entry of writes) {
    const dir = path.resolve("src/server/data/questions", entry.band, FOLDER[entry.subject]);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, `${entry.topic}.json`), JSON.stringify(entry.file, null, 2) + "\n");
    console.log(`${entry.band}/${entry.subject}/${entry.topic}: ${entry.file.questions.length} questions written`);
  }
}

main();
