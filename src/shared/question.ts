import type { Level, SubjectId, TopicId } from "./constants";

export type ContentStatus = "draft" | "reviewed" | "live";

/** One reviewed or draft question. Answers stay on the server. */
export interface Question {
  code: string;
  subject: SubjectId;
  topic: TopicId;
  level: Level;
  text: string;
  /** Only for reading comprehension questions. */
  passage?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  curriculumRef: string;
  author: string;
  reviewer: string | null;
  status: ContentStatus;
}

export interface TopicFile {
  subject: SubjectId;
  topic: TopicId;
  title: string;
  questions: Question[];
}

export interface BankStats {
  total: number;
  byStatus: Record<ContentStatus, number>;
  byTopic: Record<string, number>;
}

export function emptyStats(): BankStats {
  return { total: 0, byStatus: { draft: 0, reviewed: 0, live: 0 }, byTopic: {} };
}