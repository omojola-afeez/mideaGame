import {
  LEVEL_ORDER,
  LEVELS,
  REVIEW_INTERVALS_DAYS,
  REWARDS,
  SCORING,
  type Level,
  type TopicId,
} from "./constants";

const DAY_MS = 24 * 60 * 60 * 1000;

export function starsFor(correct: number, total: number): number {
  if (total <= 0) return 0;
  if (correct >= REWARDS.threeStarsAt) return 3;
  if (correct >= REWARDS.twoStarsAt) return 2;
  if (correct >= REWARDS.oneStarAt) return 1;
  return 0;
}

export function coinsFor(correct: number): number {
  return REWARDS.baseCoins + Math.max(0, correct) * REWARDS.coinsPerCorrect;
}

export interface ScoreInput {
  correct: boolean;
  elapsedMs: number;
  limitMs: number;
  /** Streak length including this answer. */
  streak: number;
  timed: boolean;
}

/** Server-side scoring. A wrong or late answer always scores zero. */
export function scoreFor(input: ScoreInput): number {
  if (!input.correct) return 0;
  if (input.timed && input.limitMs > 0 && input.elapsedMs > input.limitMs) return 0;
  let gain = SCORING.base;
  if (input.timed && input.limitMs > 0) {
    const used = Math.max(0, Math.min(1, input.elapsedMs / input.limitMs));
    gain += Math.round(SCORING.maxSpeedBonus * (1 - used));
  }
  const streakSteps = Math.max(0, input.streak - SCORING.streakFreeAnswers);
  gain += Math.min(SCORING.streakCap, streakSteps * SCORING.streakStep);
  return gain;
}

export function moveLevel(level: Level, direction: 1 | -1): Level {
  const next = LEVEL_ORDER[level] + direction;
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, next))] ?? level;
}

/**
 * The adaptive rule. A level changes only after 8 answers at that level.
 * 80 percent or more moves up. Below 50 percent moves down. Otherwise it stays.
 */
export function nextLevel(level: Level, recent: readonly boolean[]): Level {
  if (recent.length < 8) return level;
  const last8 = recent.slice(-8);
  const correct = last8.filter(Boolean).length;
  if (correct >= 7) return moveLevel(level, 1);
  if (correct < 4) return moveLevel(level, -1);
  return level;
}

export function levelChangeText(before: Level, after: Level): "up" | "down" | "same" {
  if (LEVEL_ORDER[after] > LEVEL_ORDER[before]) return "up";
  if (LEVEL_ORDER[after] < LEVEL_ORDER[before]) return "down";
  return "same";
}

export interface ReviewItem {
  code: string;
  topicId: TopicId;
  level: Level;
  /** 0 means the first return, 1 the second, 2 the third. */
  stage: 0 | 1 | 2;
  dueAt: number;
  lastMissedAt: number;
}

export type ReviewBook = Record<string, ReviewItem>;

export interface AnswerResult {
  code: string;
  topicId: TopicId;
  level: Level;
  correct: boolean;
}

/** Missing a question brings it back after one day. Success moves it to 3, then 7 days. */
export function recordResult(book: ReviewBook, result: AnswerResult, now: number): ReviewBook {
  const next = { ...book };
  const existing = next[result.code];

  if (!result.correct) {
    next[result.code] = {
      code: result.code,
      topicId: result.topicId,
      level: result.level,
      stage: 0,
      dueAt: now + REVIEW_INTERVALS_DAYS[0] * DAY_MS,
      lastMissedAt: now,
    };
    return next;
  }

  if (!existing) return next;

  if (existing.stage >= 2) {
    delete next[result.code];
    return next;
  }

  const stage = (existing.stage + 1) as 0 | 1 | 2;
  next[result.code] = {
    ...existing,
    stage,
    dueAt: now + REVIEW_INTERVALS_DAYS[stage] * DAY_MS,
  };
  return next;
}

export function dueReviewCodes(book: ReviewBook, topicId: TopicId, now: number, limit: number): string[] {
  return Object.values(book)
    .filter((r) => r.topicId === topicId && r.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, Math.max(0, limit))
    .map((r) => r.code);
}

export function dueCount(book: ReviewBook, topicId: TopicId, now: number): number {
  return Object.values(book).filter((r) => r.topicId === topicId && r.dueAt <= now).length;
}

export function dayKey(now: number): string {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const pa = Date.parse(`${a}T00:00:00Z`);
  const pb = Date.parse(`${b}T00:00:00Z`);
  if (!Number.isFinite(pa) || !Number.isFinite(pb)) return 0;
  return Math.round((pb - pa) / DAY_MS);
}

export interface StreakState {
  days: number;
  lastDay: string;
  paused: boolean;
}

/** A missed day pauses the streak. It never resets to zero. */
export function touchStreak(streak: StreakState, now: number): StreakState {
  const today = dayKey(now);
  if (streak.days <= 0 || !streak.lastDay) return { days: 1, lastDay: today, paused: false };
  if (streak.lastDay === today) return streak;
  const gap = daysBetween(streak.lastDay, today);
  if (gap === 1) return { days: streak.days + 1, lastDay: today, paused: false };
  return { days: streak.days, lastDay: today, paused: true };
}