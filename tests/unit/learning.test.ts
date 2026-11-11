import { describe, expect, it } from "vitest";
import type { TopicId } from "../../src/shared/constants";
import {
  coinsFor,
  levelChangeText,
  moveLevel,
  nextLevel,
  recordResult,
  scoreFor,
  starsFor,
  touchStreak,
  dueCount,
  dueReviewCodes,
  type ReviewBook,
} from "../../src/shared/learning";

describe("starsFor", () => {
  it("gives three stars for seven or more correct answers", () => {
    expect(starsFor(7, 8)).toBe(3);
    expect(starsFor(8, 8)).toBe(3);
  });
  it("gives two stars between five and six correct answers", () => {
    expect(starsFor(5, 8)).toBe(2);
    expect(starsFor(6, 8)).toBe(2);
  });
  it("gives one star for three to four correct answers and zero for fewer", () => {
    expect(starsFor(3, 8)).toBe(1);
    expect(starsFor(4, 8)).toBe(1);
    expect(starsFor(2, 8)).toBe(0);
    expect(starsFor(0, 8)).toBe(0);
  });
});

describe("coinsFor", () => {
  it("starts with base coins and adds two per correct answer", () => {
    expect(coinsFor(0)).toBe(10);
    expect(coinsFor(3)).toBe(16);
    expect(coinsFor(8)).toBe(26);
  });
});

describe("scoreFor", () => {
  it("scores zero for a wrong answer", () => {
    expect(scoreFor({ correct: false, elapsedMs: 1000, limitMs: 10000, streak: 1, timed: true })).toBe(0);
  });
  it("scores zero for a late answer", () => {
    expect(scoreFor({ correct: true, elapsedMs: 11000, limitMs: 10000, streak: 1, timed: true })).toBe(0);
  });
  it("adds the base score and the full speed bonus when answered instantly", () => {
    expect(scoreFor({ correct: true, elapsedMs: 0, limitMs: 10000, streak: 1, timed: true })).toBe(150);
  });
  it("does not add a speed bonus in untimed mode", () => {
    expect(scoreFor({ correct: true, elapsedMs: 9000, limitMs: 180000, streak: 1, timed: false })).toBe(100);
  });
  it("adds streak steps capped at thirty", () => {
    const base = scoreFor({ correct: true, elapsedMs: 0, limitMs: 10000, streak: 3, timed: false });
    expect(base).toBe(120);
  });
});

describe("adaptive level rule", () => {
  it("keeps the level while fewer than eight answers exist", () => {
    expect(nextLevel("bronze", [true, true])).toBe("bronze");
  });
  it("stays level when the last eight answers were at least half right", () => {
    expect(nextLevel("bronze", [true, true, true, true, true, false, false, false])).toBe("bronze");
  });
  it("moves up after eight answers at eighty percent or more", () => {
    expect(nextLevel("bronze", new Array(8).fill(true))).toBe("silver");
    expect(nextLevel("silver", new Array(8).fill(true))).toBe("gold");
  });
  it("moves down after eight answers below fifty percent", () => {
    expect(nextLevel("bronze", new Array(3).fill(false).concat([true, true, true, true]))).toBe("bronze");
    expect(nextLevel("gold", [false, false, false, true, true, false, false, false])).toBe("silver");
  });
});

describe("level helpers", () => {
  it("moves between the three levels without leaving the band", () => {
    expect(moveLevel("bronze", 1)).toBe("silver");
    expect(moveLevel("silver", -1)).toBe("bronze");
    expect(moveLevel("gold", 1)).toBe("gold");
  });
  it("reports the level change", () => {
    expect(levelChangeText("bronze", "silver")).toBe("up");
    expect(levelChangeText("gold", "bronze")).toBe("down");
    expect(levelChangeText("gold", "gold")).toBe("same");
  });
});

describe("spaced review", () => {
  it("returns a missed question after one day", () => {
    const now = Date.UTC(2026, 10, 11);
    const book = recordResult({}, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: false }, now);
    expect(book["ENG-COM-B-001"]?.stage).toBe(0);
    expect(book["ENG-COM-B-001"]?.dueAt).toBe(now + 24 * 60 * 60 * 1000);
  });
  it("moves a correct review to the next return interval", () => {
    const now = Date.UTC(2026, 10, 11);
    const book = recordResult({}, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: false }, now);
    const next = recordResult(book, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: true }, now + 1000);
    expect(next["ENG-COM-B-001"]?.stage).toBe(1);
    const third = recordResult(next, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: true }, now + 2000);
    expect(third["ENG-COM-B-001"]?.stage).toBe(2);
  });
  it("drops a review after the third success", () => {
    const now = Date.UTC(2026, 10, 11);
    let book = recordResult({}, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: false }, now);
    book = recordResult(book, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: true }, now);
    book = recordResult(book, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: true }, now);
    book = recordResult(book, { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", correct: true }, now);
    expect(book["ENG-COM-B-001"]).toBeUndefined();
  });
  it("lists only due questions for a topic up to the limit", () => {
    const now = Date.UTC(2026, 10, 11);
    let book: ReviewBook = { "ENG-COM-B-001": { code: "ENG-COM-B-001", topicId: "comprehension", level: "bronze", stage: 0, dueAt: now - 1000, lastMissedAt: now } };
    expect(dueCount(book, "comprehension", now)).toBe(1);
    book["ENG-MAT-NUM-B-001" as keyof typeof book] = { code: "ENG-MAT-NUM-B-001", topicId: "mathematics" as TopicId, level: "bronze", stage: 0, dueAt: now - 1000, lastMissedAt: now };
    expect(dueCount(book, "comprehension", now)).toBe(1);
    expect(dueReviewCodes(book, "comprehension", now, 5)).toEqual(["ENG-COM-B-001"]);
  });
});

describe("streak", () => {
  it("counts consecutive days and pauses the streak after a missed day", () => {
    const base = { days: 2, lastDay: "2026-11-09", paused: false };
    const next = touchStreak(base, Date.UTC(2026, 10, 11));
    expect(next.paused).toBe(true);
    expect(next.days).toBe(2);
    const fresh = touchStreak({ days: 2, lastDay: "2026-11-09", paused: false }, Date.UTC(2026, 10, 10));
    expect(fresh.days).toBe(3);
  });
});
