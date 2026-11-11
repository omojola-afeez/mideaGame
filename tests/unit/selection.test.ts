import { describe, expect, it } from "vitest";
import { TOPICS } from "../../src/shared/constants";
import { buildBank } from "../../src/server/game/selection";
import { TOPIC_FILES } from "../../src/server/data/registry";
import type { TopicId } from "../../src/shared/constants";

describe("question bank", () => {
  it("contains the expected number of questions", () => {
    const bank = buildBank(TOPIC_FILES);
    expect(bank.stats.total).toBe(1944);
    expect(bank.byCode.size).toBe(1944);
  });

  it("covers every English, Mathematics and Code topic with its planned count", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const topic of TOPICS) {
      const expected = topic.id === "code-and-ai" ? 24 : 120;
      expect(bank.byTopic.get(topic.id) ?? []).toHaveLength(expected);
      expect(bank.stats.byTopic[topic.id]).toBe(expected);
    }
  });

  it("has every level filled for each English and Mathematics topic", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const topic of TOPICS) {
      if (topic.id === "code-and-ai") continue;
      for (const level of ["bronze", "silver", "gold"] as const) {
        expect((bank.byTopicLevel.get(`${topic.id}:${level}`) ?? [])).toHaveLength(40);
      }
    }
  });

  it("indexes questions by unique code", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const topic of TOPICS) {
      const list = bank.byTopic.get(topic.id) ?? [];
      const codes = new Set<string>();
      for (const q of list) {
        expect(codes.has(q.code)).toBe(false);
        codes.add(q.code);
      }
    }
  });
});
