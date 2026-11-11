import { ROUND, TOPICS, type Level, type SubjectId, type TopicId } from "../../shared/constants";
import type { BankStats, Question, TopicFile } from "../../shared/question";
import { emptyStats } from "../../shared/question";

export interface QuestionBank {
  byCode: Map<string, Question>;
  byTopic: Map<string, Question[]>;
  byTopicLevel: Map<string, Question[]>;
  stats: BankStats;
}

export function levelKey(topic: string, level: Level, band?: string): string {
  return band ? `${band}:${topic}:${level}` : `${topic}:${level}`;
}

export function buildBank(files: TopicFile[]): QuestionBank {
  const byCode = new Map<string, Question>();
  const byTopic = new Map<string, Question[]>();
  const byTopicLevel = new Map<string, Question[]>();
  const stats = emptyStats();

  for (const file of files) {
    for (const q of file.questions) {
      byCode.set(q.code, q);
      const topicKey = `${q.band}:${q.topic}`;
      const list = byTopic.get(topicKey) ?? [];
      list.push(q);
      byTopic.set(topicKey, list);
      const key = levelKey(q.topic, q.level, q.band);
      const levelList = byTopicLevel.get(key) ?? [];
      levelList.push(q);
      byTopicLevel.set(key, levelList);
      stats.total += 1;
      stats.byStatus[q.status] = (stats.byStatus[q.status] ?? 0) + 1;
      stats.byTopic[q.topic] = (stats.byTopic[q.topic] ?? 0) + 1;
      stats.byBandTopic[topicKey] = (stats.byBandTopic[topicKey] ?? 0) + 1;
    }
  }
  return { byCode, byTopic, byTopicLevel, stats };
}

export interface SelectRequest {
  subject: SubjectId;
  topic: TopicId;
  level: Level;
  band: string;
  reviewCodes: string[];
  excludeCodes: string[];
  size?: number;
}

export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
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
 * Builds one round. Due review questions come first in the pool, so a missed
 * question is seen again even when the child has moved to a new level.
 */
export function selectQuestions(bank: QuestionBank, req: SelectRequest, rng: Rng = Math.random): Question[] {
  const size = Math.max(1, Math.min(ROUND.size, req.size ?? ROUND.size));
  const selected: Question[] = [];
  const used = new Set<string>();

  const reviewLimit = Math.min(ROUND.maxReviews, Math.max(0, size - 1));
  for (const code of req.reviewCodes) {
    if (selected.length >= reviewLimit) break;
    if (used.has(code)) continue;
    const q = bank.byCode.get(code);
    if (!q || q.topic !== req.topic || q.band !== req.band) continue;
    selected.push(q);
    used.add(code);
  }

  const excluded = new Set(req.excludeCodes);
  const exact = bank.byTopicLevel.get(levelKey(req.topic, req.level, req.band)) ?? [];
  const unseen = shuffle(
    exact.filter((q) => !excluded.has(q.code) && !used.has(q.code)),
    rng,
  ).slice(0, size - selected.length);

  for (const q of unseen) {
    selected.push(q);
    used.add(q.code);
  }

  if (selected.length < size) {
    const seenAgain = shuffle(
      exact.filter((q) => !used.has(q.code)),
      rng,
    ).slice(0, size - selected.length);
    for (const q of seenAgain) {
      selected.push(q);
      used.add(q.code);
    }
  }

  if (selected.length < size) {
    const sameTopic = shuffle(
      (bank.byTopic.get(`${req.band}:${req.topic}`) ?? []).filter((q) => !used.has(q.code)),
      rng,
    ).slice(0, size - selected.length);
    for (const q of sameTopic) {
      selected.push(q);
      used.add(q.code);
    }
  }

  return shuffle(selected, rng);
}

export function topicExists(subject: string, topic: string): boolean {
  const def = TOPICS.find((t) => t.id === topic);
  return !!def && def.subjectId === subject;
}

/** Coding topics are a sample set, not a full 40 per level bank. */
export function isSampleTopic(topic: string): boolean {
  return topic === "code-and-ai";
}