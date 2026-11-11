import { describe, expect, it } from "vitest";
import { TOPICS } from "../../src/shared/constants";
import { buildBank } from "../../src/server/game/selection";
import { TOPIC_FILES } from "../../src/server/data/registry";

/** The migrated bank currently holds band 10-12 only. Other bands and subjects are empty. */
const BAND = "10-12";

/** Topics that have content in the migrated bank. */
const POPULATED_TOPICS = TOPICS.filter((t) => t.subjectId === "english" || t.subjectId === "mathematics" || t.subjectId === "code-ai");

describe("question bank", () => {
  it("contains the expected number of questions", () => {
    const bank = buildBank(TOPIC_FILES);
    expect(bank.stats.total).toBe(1944);
    expect(bank.byCode.size).toBe(1944);
  });

  it("covers every English, Mathematics and Code topic with its planned count", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const topic of POPULATED_TOPICS) {
      const expected = topic.id === "code-and-ai" ? 24 : 120;
      expect(bank.byTopic.get(`${BAND}:${topic.id}`) ?? []).toHaveLength(expected);
      expect(bank.stats.byTopic[topic.id]).toBe(expected);
      expect(bank.stats.byBandTopic[`${BAND}:${topic.id}`]).toBe(expected);
    }
  });

  it("has every level filled for each English and Mathematics topic", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const topic of POPULATED_TOPICS) {
      if (topic.id === "code-and-ai") continue;
      for (const level of ["bronze", "silver", "gold"] as const) {
        expect(bank.byTopicLevel.get(`${BAND}:${topic.id}:${level}`) ?? []).toHaveLength(40);
      }
    }
  });

  it("indexes questions by unique code", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const topic of POPULATED_TOPICS) {
      const list = bank.byTopic.get(`${BAND}:${topic.id}`) ?? [];
      const codes = new Set<string>();
      for (const q of list) {
        expect(codes.has(q.code)).toBe(false);
        codes.add(q.code);
      }
    }
  });
});
