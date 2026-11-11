import { BAND, LEVELS, SUBJECT_PREFIX, TOPICS, type Level, type SubjectId, type TopicId } from "../../shared/constants";
import type { Question, TopicFile } from "../../shared/question";

export interface Issue {
  severity: "error" | "warning";
  code: string;
  field?: string;
  message: string;
}

export interface ValidateOptions {
  /** Exact number of questions required at each level. Use 0 to skip the count check. */
  perLevel?: number;
  /** Hard reading grade limit for prompt and options. */
  maxGrade?: number;
  /** Reading grade above this is a warning, not an error. */
  warnGrade?: number;
}

const CODE_PATTERN = /^([A-Z]{3})-([A-Z]{3})-([BSG])-(\d{3})$/;
const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const GRADE_LEVELS: Level[] = [...LEVELS];

function err(code: string, message: string, field?: string): Issue {
  return { severity: "error", code, message, field };
}

function warn(code: string, message: string, field?: string): Issue {
  return { severity: "warning", code, message, field };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g)?.length ?? 0;
  const silentE = w.length > 2 && w.endsWith("e") && !/[aeiouy]{2}e$/.test(w) ? 1 : 0;
  return Math.max(1, groups - silentE);
}

/** Flesch-Kincaid grade, rounded to one decimal. */
export function readingGrade(text: string): number {
  const clean = text.replace(/[^A-Za-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return 0;
  const words = clean.split(" ").filter(Boolean);
  if (words.length === 0) return 0;
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const grade = 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59;
  return Math.round(Math.max(0, grade) * 10) / 10;
}

function normalized(text: string): string {
  return text
    .toLowerCase()
    .replace(/[₦,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateQuestion(
  q: Question,
  file: Pick<TopicFile, "subject" | "topic">,
  opts: ValidateOptions = {},
): Issue[] {
  const issues: Issue[] = [];
  const maxGrade = opts.maxGrade ?? BAND.readingGrade + 1;
  const warnGrade = opts.warnGrade ?? BAND.readingGrade;

  if (!q || typeof q !== "object") return [err("not_object", "Question is not an object")];
  const code = typeof q.code === "string" ? q.code : "";
  const match = CODE_PATTERN.exec(code);
  if (!match) {
    issues.push(err("bad_code", "Code must look like ENG-COM-B-001", "code"));
  } else {
    const prefix = match[1] ?? "";
    const topicPrefix = match[2] ?? "";
    const letter = match[3] ?? "";
    const number = match[4] ?? "";
    const topic = TOPICS.find((t) => t.id === file.topic);
    if (prefix !== SUBJECT_PREFIX[file.subject]) {
      issues.push(err("bad_code_subject", `Code prefix ${prefix} does not match subject ${file.subject}`, "code"));
    }
    if (!topic || topicPrefix !== topic.codePrefix) {
      issues.push(err("bad_code_topic", `Code topic ${topicPrefix} does not match topic ${file.topic}`, "code"));
    }
    if (letter !== LEVEL_LETTER[q.level]) {
      issues.push(err("bad_code_level", `Code level letter ${letter} does not match ${q.level}`, "code"));
    }
    if (!/^\d{3}$/.test(number) || number === "000") {
      issues.push(err("bad_code_number", "Code number must be 001 to 999", "code"));
    }
  }

  if (q.subject !== file.subject) issues.push(err("bad_subject", "Subject does not match the file", "subject"));
  if (q.topic !== file.topic) issues.push(err("bad_topic", "Topic does not match the file", "topic"));
  if (!GRADE_LEVELS.includes(q.level)) issues.push(err("bad_level", "Level must be bronze, silver or gold", "level"));

  for (const field of ["text", "explanation", "curriculumRef", "author"] as const) {
    const value = q[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      issues.push(err("missing_field", `${field} is required`, field));
    }
  }

  if (typeof q.text === "string") {
    const text = q.text.trim();
    if (text.length > 220) issues.push(err("text_long", "Question text is over 220 characters", "text"));
    if (countWords(text) > 35) issues.push(err("text_words", "Question text is over 35 words", "text"));
    if (text.includes("\n")) issues.push(err("text_newline", "Question text must be one paragraph", "text"));
    if (/all of the above|none of the above/i.test(text)) {
      issues.push(err("banned_phrase", "Avoid all of the above and none of the above", "text"));
    }
    const grade = readingGrade(text);
    if (grade > maxGrade) issues.push(err("reading_grade", `Question reading grade ${grade} is above ${maxGrade}`, "text"));
    else if (grade > warnGrade) issues.push(warn("reading_grade_warn", `Question reading grade ${grade} is above target ${warnGrade}`, "text"));
  }

  if (q.passage !== undefined) {
    if (q.topic !== "comprehension") {
      issues.push(err("passage_wrong_topic", "Passages are only allowed for comprehension", "passage"));
    }
    if (typeof q.passage !== "string" || q.passage.trim().length < 20) {
      issues.push(err("passage_short", "Passage must be at least 20 characters", "passage"));
    } else {
      if (countWords(q.passage) > 130) issues.push(err("passage_words", "Passage is over 130 words", "passage"));
      const grade = readingGrade(q.passage);
      if (grade > maxGrade) issues.push(err("passage_grade", `Passage reading grade ${grade} is above ${maxGrade}`, "passage"));
    }
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    issues.push(err("options_count", "Exactly four options are required", "options"));
  } else {
    const seen = new Set<string>();
    q.options.forEach((option, i) => {
      if (typeof option !== "string" || option.trim().length === 0) {
        issues.push(err("option_empty", `Option ${i + 1} is empty`, "options"));
        return;
      }
      if (option.length > 80) issues.push(err("option_long", `Option ${i + 1} is over 80 characters`, "options"));
      if (countWords(option) > 14) issues.push(err("option_words", `Option ${i + 1} is over 14 words`, "options"));
      const key = normalized(option);
      if (seen.has(key)) issues.push(err("option_duplicate", `Option ${i + 1} repeats another option`, "options"));
      seen.add(key);
    });
  }

  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
    issues.push(err("correct_index", "correctIndex must be 0, 1, 2 or 3", "correctIndex"));
  }

  if (typeof q.explanation === "string") {
    if (q.explanation.length > 200) issues.push(err("explanation_long", "Explanation is over 200 characters", "explanation"));
    if (countWords(q.explanation) > 30) issues.push(err("explanation_words", "Explanation is over 30 words", "explanation"));
  }

  if (q.hint !== undefined && (typeof q.hint !== "string" || q.hint.length > 140)) {
    issues.push(err("hint_long", "Hint must be text under 140 characters", "hint"));
  }

  if (q.status !== "draft" && q.status !== "reviewed" && q.status !== "live") {
    issues.push(err("bad_status", "Status must be draft, reviewed or live", "status"));
  }
  if ((q.status === "reviewed" || q.status === "live") && (!q.reviewer || q.reviewer.trim() === "")) {
    issues.push(err("missing_reviewer", "A reviewed or live question needs a reviewer", "reviewer"));
  }

  for (const [field, value] of Object.entries(q)) {
    if (typeof value !== "string") continue;
    if (value.includes("\u2014")) {
      issues.push(err("em_dash", `The ${field} field contains an em dash`, field));
    }
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
      issues.push(err("control_char", `The ${field} field contains a control character`, field));
    }
  }

  return issues;
}

export function validateTopicFile(file: TopicFile, opts: ValidateOptions = {}): Issue[] {
  const issues: Issue[] = [];
  const topic = TOPICS.find((t) => t.id === file.topic);
  if (!topic) return [err("unknown_topic", `Unknown topic ${file.topic}`)];
  if (topic.subjectId !== file.subject) {
    issues.push(err("subject_mismatch", `Topic ${file.topic} belongs to ${topic.subjectId}, not ${file.subject}`));
  }
  if (!Array.isArray(file.questions) || file.questions.length === 0) {
    return [...issues, err("no_questions", "File has no questions")];
  }

  const codes = new Set<string>();
  const prompts = new Map<string, string>();
  const perLevel: Record<Level, number> = { bronze: 0, silver: 0, gold: 0 };
  const answerCounts: Record<Level, number[]> = {
    bronze: [0, 0, 0, 0],
    silver: [0, 0, 0, 0],
    gold: [0, 0, 0, 0],
  };

  for (const q of file.questions) {
    for (const issue of validateQuestion(q, file, opts)) {
      issues.push({ ...issue, code: q?.code || issue.code });
    }
    if (typeof q?.code === "string") {
      if (codes.has(q.code)) issues.push(err("duplicate_code", `Duplicate question code ${q.code}`));
      codes.add(q.code);
    }
    if (typeof q?.text === "string") {
      const key = normalized(q.text);
      const other = prompts.get(key);
      if (other) issues.push(err("duplicate_prompt", `Same question text as ${other}`, "text"));
      else prompts.set(key, q.code);
    }
    if (q && q.level in perLevel) {
      perLevel[q.level] += 1;
      if (Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3) {
        const row = answerCounts[q.level];
        row[q.correctIndex] = (row[q.correctIndex] ?? 0) + 1;
      }
    }
  }

  if (opts.perLevel && opts.perLevel > 0) {
    for (const level of GRADE_LEVELS) {
      if (perLevel[level] !== opts.perLevel) {
        issues.push(err("level_count", `${level} has ${perLevel[level]} questions, expected ${opts.perLevel}`));
      }
    }
  }

  const expected = opts.perLevel && opts.perLevel > 0 ? opts.perLevel : 0;
  if (expected > 0) {
    const min = Math.max(1, Math.floor(expected * 0.15));
    const max = Math.ceil(expected * 0.35);
    for (const level of GRADE_LEVELS) {
      const counts = answerCounts[level];
      counts.forEach((count, index) => {
        if (count < min || count > max) {
          issues.push(
            err(
              "answer_spread",
              `${level} uses option ${index + 1} ${count} times. Keep each option between ${min} and ${max}.`,
            ),
          );
        }
      });
    }
  }

  return issues;
}

export function isClean(issues: Issue[]): boolean {
  return !issues.some((i) => i.severity === "error");
}

export function summarise(issues: Issue[]): string {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  return `${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`;
}