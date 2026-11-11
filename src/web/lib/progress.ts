import { useSyncExternalStore } from "react";
import {
  LEVELS,
  LEVEL_ORDER,
  PROGRESS_KEY,
  ROUND,
  TOPICS,
  type Level,
  type TopicId,
} from "../../shared/constants";
import {
  nextLevel,
  recordResult,
  starsFor,
  touchStreak,
  type ReviewBook,
  type StreakState,
} from "../../shared/learning";

export interface TopicProgress {
  level: Level;
  stars: Record<Level, number>;
  /** Answers at each level, newest last. Kept to 40. */
  history: Record<Level, boolean[]>;
  /** Recently seen question codes, so rounds do not repeat too soon. */
  seen: string[];
}

export interface QuestProgress {
  version: 1;
  profile: { nickname: string; avatar: number };
  coins: number;
  topics: Partial<Record<TopicId, TopicProgress>>;
  reviews: ReviewBook;
  streak: StreakState;
  totals: { rounds: number; correct: number; answered: number };
  lastRoundId: string;
  settings: { timed: boolean; readAloud: boolean; highContrast: boolean };
}

export interface RoundSnapshot {
  roundId: string;
  subject: string;
  topic: string;
  level: string;
  rounds: number;
  stars: number;
  coins: number;
  results: Array<{ code: string; topic: string; level: string; correct: boolean }>;
}

export interface LevelChange {
  topic: TopicId;
  before: Level;
  after: Level;
  direction: "up" | "down";
}

export interface RoundOutcome {
  roundId: string;
  stars: number;
  coins: number;
  levelChanges: LevelChange[];
  dueAfter: number;
  newStars: boolean;
}

function emptyTopic(): TopicProgress {
  return {
    level: "bronze",
    stars: { bronze: 0, silver: 0, gold: 0 },
    history: { bronze: [], silver: [], gold: [] },
    seen: [],
  };
}

export function defaultProgress(): QuestProgress {
  return {
    version: 1,
    profile: { nickname: "", avatar: 0 },
    coins: 0,
    topics: {},
    reviews: {},
    streak: { days: 0, lastDay: "", paused: false },
    totals: { rounds: 0, correct: 0, answered: 0 },
    lastRoundId: "",
    settings: { timed: true, readAloud: false, highContrast: false },
  };
}

function isLevel(value: unknown): value is Level {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value);
}

function isTopic(value: unknown): value is TopicId {
  return typeof value === "string" && TOPICS.some((t) => t.id === value);
}

/** Local only. A malformed or old record is replaced, never merged blindly. */
export function parseProgress(raw: string | null): QuestProgress {
  if (!raw) return defaultProgress();
  try {
    const data = JSON.parse(raw) as Partial<QuestProgress>;
    if (data.version !== 1) return defaultProgress();
    const base = defaultProgress();
    const topics: Partial<Record<TopicId, TopicProgress>> = {};
    for (const [id, value] of Object.entries(data.topics ?? {})) {
      if (!isTopic(id) || !value || typeof value !== "object") continue;
      const v = value as Partial<TopicProgress>;
      topics[id] = {
        level: isLevel(v.level) ? v.level : "bronze",
        stars: {
          bronze: clampStar(v.stars?.bronze),
          silver: clampStar(v.stars?.silver),
          gold: clampStar(v.stars?.gold),
        },
        history: {
          bronze: bools(v.history?.bronze),
          silver: bools(v.history?.silver),
          gold: bools(v.history?.gold),
        },
        seen: Array.isArray(v.seen) ? v.seen.filter((c): c is string => typeof c === "string").slice(-32) : [],
      };
    }
    const reviews: ReviewBook = {};
    for (const [code, item] of Object.entries(data.reviews ?? {})) {
      if (!item || typeof item !== "object" || !isTopic(item.topicId) || !isLevel(item.level)) continue;
      if (typeof item.dueAt !== "number" || !Number.isFinite(item.dueAt)) continue;
      reviews[code] = {
        code,
        topicId: item.topicId,
        level: item.level,
        stage: item.stage === 1 || item.stage === 2 ? item.stage : 0,
        dueAt: item.dueAt,
        lastMissedAt: typeof item.lastMissedAt === "number" ? item.lastMissedAt : 0,
      };
    }
    return {
      ...base,
      profile: {
        nickname: typeof data.profile?.nickname === "string" ? data.profile.nickname.slice(0, 16) : "",
        avatar: Number.isInteger(data.profile?.avatar) ? Math.max(0, Math.min(11, data.profile?.avatar ?? 0)) : 0,
      },
      coins: Math.max(0, Math.floor(data.coins ?? 0)),
      topics,
      reviews,
      streak: {
        days: Math.max(0, Math.floor(data.streak?.days ?? 0)),
        lastDay: typeof data.streak?.lastDay === "string" ? data.streak.lastDay : "",
        paused: data.streak?.paused === true,
      },
      totals: {
        rounds: Math.max(0, Math.floor(data.totals?.rounds ?? 0)),
        correct: Math.max(0, Math.floor(data.totals?.correct ?? 0)),
        answered: Math.max(0, Math.floor(data.totals?.answered ?? 0)),
      },
      lastRoundId: typeof data.lastRoundId === "string" ? data.lastRoundId : "",
      settings: {
        timed: data.settings?.timed !== false,
        readAloud: data.settings?.readAloud === true,
        highContrast: data.settings?.highContrast === true,
      },
    };
  } catch {
    return defaultProgress();
  }
}

function clampStar(value: unknown): number {
  return Number.isInteger(value) ? Math.max(0, Math.min(3, value as number)) : 0;
}

function bools(value: unknown): boolean[] {
  return Array.isArray(value) ? value.filter((v): v is boolean => typeof v === "boolean").slice(-40) : [];
}

export function loadProgress(): QuestProgress {
  try {
    return parseProgress(localStorage.getItem(PROGRESS_KEY));
  } catch {
    return defaultProgress();
  }
}

export function topicProgress(progress: QuestProgress, id: TopicId): TopicProgress {
  return progress.topics[id] ?? emptyTopic();
}

export function totalStars(progress: QuestProgress): number {
  let sum = 0;
  for (const topic of Object.values(progress.topics)) {
    if (!topic) continue;
    for (const level of LEVELS) sum += topic.stars[level] ?? 0;
  }
  return sum;
}

export function dueForTopic(progress: QuestProgress, id: TopicId, now: number): number {
  return Object.values(progress.reviews).filter((r) => r.topicId === id && r.dueAt <= now).length;
}

export function dueTotal(progress: QuestProgress, now: number): number {
  return Object.values(progress.reviews).filter((r) => r.dueAt <= now).length;
}

class ProgressStore {
  private progress: QuestProgress = defaultProgress();
  private outcome: RoundOutcome | null = null;
  private listeners = new Set<() => void>();
  private loaded = false;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  get = (): { progress: QuestProgress; outcome: RoundOutcome | null } => {
    if (!this.loaded) {
      this.progress = loadProgress();
      this.loaded = true;
    }
    return { progress: this.progress, outcome: this.outcome };
  };

  private commit(next: QuestProgress): void {
    this.progress = next;
    this.loaded = true;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    } catch {
      // A full or blocked storage must not stop a child from playing.
    }
    this.listeners.forEach((l) => l());
  }

  setProfile(nickname: string, avatar: number): void {
    this.commit({ ...this.get().progress, profile: { nickname, avatar } });
  }

  setSetting(key: keyof QuestProgress["settings"], value: boolean): void {
    const p = this.get().progress;
    this.commit({ ...p, settings: { ...p.settings, [key]: value } });
  }

  reset(): void {
    this.outcome = null;
    this.commit(defaultProgress());
  }

  /** Applies one finished round exactly once. */
  applyRound(snap: RoundSnapshot, now = Date.now()): RoundOutcome {
    const current = this.get().progress;
    if (snap.roundId && current.lastRoundId === snap.roundId) {
      return (
        this.outcome ?? {
          roundId: snap.roundId,
          stars: snap.stars,
          coins: snap.coins,
          levelChanges: [],
          dueAfter: dueTotal(current, now),
          newStars: false,
        }
      );
    }

    let reviews = current.reviews;
    const topics: Partial<Record<TopicId, TopicProgress>> = { ...current.topics };
    const touched = new Set<TopicId>();

    for (const result of snap.results) {
      if (!isTopic(result.topic) || !isLevel(result.level)) continue;
      const id = result.topic;
      const tp = { ...(topics[id] ?? emptyTopic()) };
      tp.history = {
        bronze: [...tp.history.bronze],
        silver: [...tp.history.silver],
        gold: [...tp.history.gold],
      };
      tp.seen = [...tp.seen.filter((c) => c !== result.code), result.code].slice(-32);
      tp.history[result.level] = [...tp.history[result.level], result.correct].slice(-40);
      topics[id] = tp;
      reviews = recordResult(reviews, { code: result.code, topicId: id, level: result.level, correct: result.correct }, now);
      touched.add(id);
    }

    const levelChanges: LevelChange[] = [];
    for (const id of touched) {
      const tp = { ...(topics[id] ?? emptyTopic()) };
      const before = tp.level;
      const after = nextLevel(before, tp.history[before]);
      if (after !== before) {
        tp.level = after;
        tp.history = { ...tp.history, [before]: [] };
        topics[id] = tp;
        levelChanges.push({ topic: id, before, after, direction: LEVEL_ORDER[after] > LEVEL_ORDER[before] ? "up" : "down" });
      }
    }

    let newStars = false;
    if (snap.topic !== "daily" && isTopic(snap.topic) && isLevel(snap.level)) {
      const tp = { ...(topics[snap.topic] ?? emptyTopic()) };
      const earned = snap.stars || starsFor(snap.results.filter((r) => r.correct).length, snap.rounds || ROUND.size);
      if (earned > (tp.stars[snap.level] ?? 0)) {
        tp.stars = { ...tp.stars, [snap.level]: earned };
        topics[snap.topic] = tp;
        newStars = true;
      }
    }

    const correct = snap.results.filter((r) => r.correct).length;
    const next: QuestProgress = {
      ...current,
      topics,
      reviews,
      coins: current.coins + Math.max(0, snap.coins),
      totals: {
        rounds: current.totals.rounds + 1,
        correct: current.totals.correct + correct,
        answered: current.totals.answered + snap.results.length,
      },
      streak: touchStreak(current.streak, now),
      lastRoundId: snap.roundId,
    };

    const outcome: RoundOutcome = {
      roundId: snap.roundId,
      stars: snap.stars,
      coins: snap.coins,
      levelChanges,
      dueAfter: dueTotal(next, now),
      newStars,
    };
    this.outcome = outcome;
    this.commit(next);
    return outcome;
  }
}

export const progressStore = new ProgressStore();

export function useProgress(): { progress: QuestProgress; outcome: RoundOutcome | null } {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.get);
}