import { randomUUID } from "node:crypto";
import { Room, ServerError, type Client } from "@colyseus/core";
import {
  ERROR_CODES,
  MSG,
  ROUND,
  type ErrorKey,
  type Level,
  type SubjectId,
  type TopicId,
} from "../../shared/constants";
import {
  answerSchema,
  emptySchema,
  joinOptionsSchema,
  startRoundSchema,
  syncSchema,
  type RoundPart,
} from "../../shared/schemas";
import { coinsFor, scoreFor, starsFor } from "../../shared/learning";
import type { Question } from "../../shared/question";
import { clearQuestion, createInitialState, ResultView, type QuestState } from "../../shared/state";
import { bank } from "../data/bank";
import { log } from "../log";
import { activeRoomCount, counters, registerRoomProbe } from "../metrics";
import { createLimiter, runtime } from "../runtime";
import { selectQuestions, shuffle } from "../game/selection";

interface AuthData {
  name: string;
  avatar: number;
}

type RejectReason =
  | "WRONG_PHASE"
  | "STALE_QUESTION"
  | "ALREADY_ANSWERED"
  | "TOO_LATE"
  | "NO_QUESTIONS"
  | "UNKNOWN_PLAYER";

function reject(key: ErrorKey, code: number): never {
  counters.joinsRejected += 1;
  throw new ServerError(code, key);
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : "unknown";
}

export class QuestRoom extends Room<{ state: QuestState }> {
  override maxClients = 1;

  private round: Question[] = [];
  private current = -1;
  private answered = false;
  private revealed = false;
  private timer: NodeJS.Timeout | null = null;
  private timerToken = 0;
  private idleTimer: NodeJS.Timeout | null = null;
  private unregister: (() => void) | null = null;
  private lastActivity = Date.now();

  override onCreate(): void {
    if (activeRoomCount() >= runtime.maxRooms) throw new ServerError(503, "SERVER_BUSY");
    this.maxMessagesPerSecond = runtime.maxMessagesPerSecond;
    this.setState(createInitialState());
    this.registerHandlers();

    this.unregister = registerRoomProbe(() => ({ phase: this.state.phase, players: 1 }));
    this.idleTimer = setInterval(() => this.checkIdle(), runtime.idleCheckMs);
    this.idleTimer.unref();

    counters.roomsCreated += 1;
    log("info", "room_created");
  }

  // ------------------------------------------------------------- admission

  override onAuth(_client: Client, options: unknown, context: { ip?: string }): AuthData {
    const ip = context.ip ?? "unknown";
    if (!createLimiter.allow(ip)) {
      counters.rateLimited += 1;
      reject("RATE_LIMITED", ERROR_CODES.rateLimited);
    }
    const parsed = joinOptionsSchema.safeParse(options);
    if (!parsed.success) reject("BAD_NAME", ERROR_CODES.badName);
    return { name: parsed.data.name, avatar: parsed.data.avatar };
  }

  override onJoin(_client: Client, _options: unknown, auth: AuthData): void {
    this.touch();
    this.state.nickname = auth.name;
    this.state.avatar = auth.avatar;
    this.state.serverNow = Date.now();
    this.state.seq += 1;
    counters.playersJoined += 1;
    log("info", "player_joined");
  }

  override onDrop(client: Client): void {
    log("info", "player_dropped");
    this.allowReconnection(client, runtime.reconnectSeconds).catch(() => {
      // The window passed. onLeave closes the solo room.
    });
  }

  override onReconnect(): void {
    this.touch();
    log("info", "player_reconnected");
  }

  override onLeave(): void {
    log("info", "player_left");
    void this.disconnect();
  }

  override onDispose(): void {
    this.clearTimer();
    this.unregister?.();
    if (this.idleTimer) clearInterval(this.idleTimer);
    counters.roomsDisposed += 1;
    log("info", "room_disposed");
  }

  // -------------------------------------------------------------- messages

  private registerHandlers(): void {
    this.onMessage(MSG.sync, (client, raw) => {
      const parsed = syncSchema.safeParse(raw);
      if (!parsed.success) return this.refuse(client, MSG.sync, "BAD_REQUEST");
      client.send(MSG.syncReply, { t0: parsed.data.t0, serverNow: Date.now() });
    });

    this.onMessage(MSG.startRound, (client, raw) => {
      try {
        const parsed = startRoundSchema.safeParse(raw);
        if (!parsed.success) return this.refuse(client, MSG.startRound, "BAD_REQUEST");
        if (this.state.phase === "QUESTION" || this.state.phase === "REVEAL") {
          return this.refuse(client, MSG.startRound, "WRONG_PHASE");
        }
        this.touch();
        this.startRound(parsed.data.parts, parsed.data.timed);
      } catch (err) {
        this.fail(client, MSG.startRound, err);
      }
    });

    this.onMessage(MSG.answer, (client, raw) => {
      try {
        const parsed = answerSchema.safeParse(raw);
        if (!parsed.success) return this.refuse(client, MSG.answer, "BAD_REQUEST");
        const result = this.submitAnswer(parsed.data.q, parsed.data.choice);
        if (result === "ok") client.send(MSG.answerAck, { q: parsed.data.q });
        else this.refuse(client, MSG.answer, result);
      } catch (err) {
        this.fail(client, MSG.answer, err);
      }
    });

    this.onMessage(MSG.next, (client, raw) => {
      try {
        const parsed = emptySchema.safeParse(raw);
        if (!parsed.success) return this.refuse(client, MSG.next, "BAD_REQUEST");
        if (this.state.phase !== "REVEAL") return this.refuse(client, MSG.next, "WRONG_PHASE");
        this.touch();
        this.advance();
      } catch (err) {
        this.fail(client, MSG.next, err);
      }
    });
  }

  // ------------------------------------------------------------- round flow

  private startRound(parts: RoundPart[], timed: boolean): void {
    const picked: Question[] = [];
    for (const part of parts) {
      picked.push(
        ...selectQuestions(bank, {
          subject: part.subject as SubjectId,
          topic: part.topic as TopicId,
          level: part.level as Level,
          reviewCodes: part.reviewCodes,
          excludeCodes: part.excludeCodes,
          size: part.count,
        }),
      );
    }
    if (picked.length === 0) return this.refuseState("NO_QUESTIONS");

    const questions = shuffle(picked, Math.random);
    this.clearTimer();
    this.round = questions;
    this.current = -1;
    this.answered = false;
    this.revealed = false;

    const s = this.state;
    s.phase = "READY";
    s.roundId = randomUUID().slice(0, 8);
    s.subject = parts.length === 1 ? (parts[0]?.subject ?? "") : "mixed";
    s.topic = parts.length === 1 ? (parts[0]?.topic ?? "") : "daily";
    s.level = parts[0]?.level ?? "bronze";
    s.rounds = questions.length;
    s.timed = timed;
    s.questionSeconds = timed ? ROUND.questionSeconds : ROUND.untimedSeconds;
    s.score = 0;
    s.correctCount = 0;
    s.answeredCount = 0;
    s.streak = 0;
    s.bestStreak = 0;
    s.stars = 0;
    s.coins = 0;
    s.hint = "";
    s.results.splice(0, s.results.length);
    clearQuestion(s);
    s.phaseEndsAt = 0;
    this.bump();

    counters.roundsStarted += 1;
    log("info", "round_started", { parts: parts.length, size: questions.length, timed });
    this.setQuestion(0);
  }

  private setQuestion(index: number): void {
    const q = this.round[index];
    if (!q) return this.finishRound();
    const now = Date.now();
    const duration = this.state.questionSeconds * 1000;
    this.current = index;
    this.answered = false;
    this.revealed = false;

    const s = this.state;
    s.question.index = index;
    s.question.total = this.round.length;
    s.question.code = q.code;
    s.question.topic = q.topic;
    s.question.text = q.text;
    s.question.passage = q.passage ?? "";
    s.question.options.clear();
    q.options.forEach((o) => s.question.options.push(o));
    s.question.level = q.level;
    s.question.startedAt = now;
    s.question.endsAt = now + duration;
    s.question.correctIndex = -1;
    s.question.chosenIndex = -1;
    s.question.explanation = "";
    s.phase = "QUESTION";
    s.phaseEndsAt = s.question.endsAt;
    this.bump();

    this.schedule(() => this.reveal(-1), duration + runtime.timing.answerGraceMs);
  }

  private submitAnswer(qIndex: number, choice: number): "ok" | RejectReason {
    if (this.state.phase !== "QUESTION") return "WRONG_PHASE";
    if (qIndex !== this.state.question.index) return "STALE_QUESTION";
    if (this.answered) return "ALREADY_ANSWERED";
    const now = Date.now();
    if (now > this.state.question.endsAt + runtime.timing.answerGraceMs) return "TOO_LATE";

    this.answered = true;
    this.clearTimer();
    counters.answersReceived += 1;
    this.reveal(choice);
    return "ok";
  }

  private reveal(choice: number): void {
    if (this.revealed) return;
    this.revealed = true;
    this.answered = true;
    this.clearTimer();

    const q = this.round[this.current];
    if (!q) return;
    const now = Date.now();
    const duration = Math.max(1, this.state.question.endsAt - this.state.question.startedAt);
    const elapsed = Math.max(0, Math.min(duration, now - this.state.question.startedAt));
    const correct = choice >= 0 && choice === q.correctIndex;

    const s = this.state;
    s.answeredCount += 1;
    if (correct) {
      s.correctCount += 1;
      s.streak += 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
    } else {
      s.streak = 0;
    }
    const gain = scoreFor({
      correct,
      elapsedMs: elapsed,
      limitMs: duration,
      streak: s.streak,
      timed: s.timed,
    });
    s.score += gain;

    s.question.correctIndex = q.correctIndex;
    s.question.chosenIndex = choice;
    s.question.explanation = q.explanation;
    s.phase = "REVEAL";
    s.phaseEndsAt = now + runtime.timing.revealHoldMs;
    this.bump();

    const result = new ResultView();
    result.code = q.code;
    result.topic = q.topic;
    result.text = q.text;
    result.level = q.level;
    result.chosenIndex = choice;
    result.correctIndex = q.correctIndex;
    result.chosenText = choice >= 0 ? (q.options[choice] ?? "") : "";
    result.correctText = q.options[q.correctIndex] ?? "";
    result.correct = correct;
    result.explanation = q.explanation;
    s.results.push(result);

    log("info", "question_revealed", { topic: q.topic, level: q.level, correct, timedOut: choice < 0 });
    this.schedule(() => this.advance(), runtime.timing.revealHoldMs);
  }

  private advance(): void {
    if (this.state.phase !== "REVEAL") return;
    this.clearTimer();
    const next = this.current + 1;
    if (next >= this.round.length) {
      this.finishRound();
      return;
    }
    this.setQuestion(next);
  }

  private finishRound(): void {
    this.clearTimer();
    const s = this.state;
    s.phase = "RESULTS";
    s.stars = starsFor(s.correctCount, s.rounds);
    s.coins = coinsFor(s.correctCount);
    s.phaseEndsAt = 0;
    this.current = -1;
    this.bump();
    counters.roundsFinished += 1;
    log("info", "round_finished", {
      topic: s.topic,
      level: s.level,
      correct: s.correctCount,
      rounds: s.rounds,
      stars: s.stars,
    });
  }

  // ------------------------------------------------------------------ misc

  private bump(): void {
    this.state.serverNow = Date.now();
    this.state.seq += 1;
  }

  private schedule(fn: () => void, ms: number): void {
    this.clearTimer();
    const token = ++this.timerToken;
    this.timer = setTimeout(() => {
      this.timer = null;
      if (token !== this.timerToken) return;
      try {
        fn();
      } catch (err) {
        counters.unexpectedErrors += 1;
        log("error", "timer_failed", { message: errMessage(err) });
      }
    }, Math.max(0, ms));
  }

  private clearTimer(): void {
    this.timerToken += 1;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private refuse(client: Client, type: string, reason: RejectReason | "BAD_REQUEST"): void {
    counters.messagesRejected += 1;
    log("debug", "message_rejected", { type, reason });
    client.send(MSG.rejected, { type, reason });
  }

  private refuseState(reason: RejectReason): void {
    counters.messagesRejected += 1;
    log("debug", "message_rejected", { type: MSG.startRound, reason });
    this.broadcast(MSG.rejected, { type: MSG.startRound, reason });
  }

  private fail(client: Client, type: string, err: unknown): void {
    counters.unexpectedErrors += 1;
    log("error", "handler_failed", { type, message: errMessage(err) });
    client.send(MSG.rejected, { type, reason: "SERVER_ERROR" });
  }

  private touch(): void {
    this.lastActivity = Date.now();
  }

  private checkIdle(): void {
    if (this.state.phase !== "READY" && this.state.phase !== "RESULTS") return;
    if (Date.now() - this.lastActivity < runtime.idleRoomMs) return;
    log("info", "room_idle_closed");
    void this.disconnect();
  }
}