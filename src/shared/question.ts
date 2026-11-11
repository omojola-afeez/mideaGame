import type { BandId, Level, SubjectId, TopicId } from "./constants";

export type ContentStatus = "draft" | "reviewed" | "live";

/** One reviewed or draft question. Answers stay on the server. */
export interface Question {
  code: string;
  /** Age band this question belongs to. A child only ever sees their own band. */
  band: BandId;
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
  /** Age band every question in this file belongs to. One file holds one band. */
  band: BandId;
  subject: SubjectId;
  topic: TopicId;
  title: string;
  questions: Question[];
}

export interface BankStats {
  total: number;
  byStatus: Record<ContentStatus, number>;
  byTopic: Record<string, number>;
  /** Question count keyed by `band:topic`, for example `10-12:grammar`. */
  byBandTopic: Record<string, number>;
}

export function emptyStats(): BankStats {
  return { total: 0, byStatus: { draft: 0, reviewed: 0, live: 0 }, byTopic: {}, byBandTopic: {} };
}