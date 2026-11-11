import { ROUND } from "../shared/constants";
import { RateLimiter } from "./rateLimit";

export interface TimingConfig {
  revealHoldMs: number;
  answerGraceMs: number;
}

export interface RuntimeConfig {
  timing: TimingConfig;
  reconnectSeconds: number;
  idleRoomMs: number;
  idleCheckMs: number;
  maxMessagesPerSecond: number;
  maxRooms: number;
  createsPerMinute: number;
  matchmakePerMinute: number;
  reportsPerHour: number;
}

export const PRODUCTION_TIMING: TimingConfig = {
  revealHoldMs: ROUND.revealHoldMs,
  answerGraceMs: ROUND.answerGraceMs,
};

/** Shorter waits so automated tests finish quickly. Selected only when QUEST_TIMING=fast. */
export const FAST_TIMING: TimingConfig = { revealHoldMs: 1500, answerGraceMs: ROUND.answerGraceMs };

export function defaultConfig(): RuntimeConfig {
  const fast = process.env.QUEST_TIMING === "fast";
  return {
    timing: fast ? FAST_TIMING : PRODUCTION_TIMING,
    reconnectSeconds: 30,
    idleRoomMs: 30 * 60 * 1000,
    idleCheckMs: 30_000,
    maxMessagesPerSecond: 20,
    maxRooms: Number(process.env.MAX_ROOMS ?? 100),
    createsPerMinute: 20,
    matchmakePerMinute: 90,
    reportsPerHour: 12,
  };
}

export const runtime: RuntimeConfig = defaultConfig();

export const createLimiter = new RateLimiter(runtime.createsPerMinute, 60_000);
export const matchmakeLimiter = new RateLimiter(runtime.matchmakePerMinute, 60_000);
export const reportLimiter = new RateLimiter(runtime.reportsPerHour, 60 * 60 * 1000);

export function configureRuntime(partial: Partial<RuntimeConfig>): void {
  Object.assign(runtime, partial);
  createLimiter.reconfigure(runtime.createsPerMinute, 60_000);
  matchmakeLimiter.reconfigure(runtime.matchmakePerMinute, 60_000);
  reportLimiter.reconfigure(runtime.reportsPerHour, 60 * 60 * 1000);
}