import { describe, expect, it } from "vitest";
import { BAND_IDS, TOPICS } from "../../src/shared/constants";
import { buildBank } from "../../src/server/game/selection";
import { TOPIC_FILES } from "../../src/server/data/registry";

/**
 * Band 10-12 holds the original 1,944 questions (40 per level per topic).
 * Bands 4-6 and 7-9 hold the generated starter banks (8 per level per topic).
 */
const EXPECTED_TOTAL = 3912;

/** 10-12 holds the original full English and Mathematics banks (40 per level). */
const FULL_BANK_TOPICS = new Set([
  "comprehension",
  "grammar",
  "tenses",
  "punctuation",
  "spelling",
  "vocabulary",
  "figures",
  "writing",
  "number",
  "addsub",
  "muldiv",
  "fractions",
  "decimals",
  "geometry",
  "measurement",
  "money-data",
]);

function expectedFor(band: string, topicId: string): number {
  if (band === "10-12" && FULL_BANK_TOPICS.has(topicId)) return 120;
  return 24;
}

describe("question bank", () => {
  it("contains the expected number of questions", () => {
    const bank = buildBank(TOPIC_FILES);
    expect(bank.stats.total).toBe(EXPECTED_TOTAL);
    expect(bank.byCode.size).toBe(EXPECTED_TOTAL);
  });

  it("covers every topic in every band with its planned count", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const band of BAND_IDS) {
      for (const topic of TOPICS) {
        const expected = expectedFor(band, topic.id);
        expect(bank.byTopic.get(`${band}:${topic.id}`) ?? []).toHaveLength(expected);
        expect(bank.stats.byBandTopic[`${band}:${topic.id}`]).toBe(expected);
      }
    }
  });

  it("has every level filled for each topic in every band", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const band of BAND_IDS) {
      for (const topic of TOPICS) {
        const perTopic = expectedFor(band, topic.id);
        const perLevel = perTopic / 3;
        for (const level of ["bronze", "silver", "gold"] as const) {
          expect(bank.byTopicLevel.get(`${band}:${topic.id}:${level}`) ?? []).toHaveLength(perLevel);
        }
      }
    }
  });

  it("indexes questions by unique code", () => {
    const bank = buildBank(TOPIC_FILES);
    for (const band of BAND_IDS) {
      for (const topic of TOPICS) {
        const list = bank.byTopic.get(`${band}:${topic.id}`) ?? [];
        const codes = new Set<string>();
        for (const q of list) {
          expect(codes.has(q.code)).toBe(false);
          codes.add(q.code);
        }
      }
    }
  });
});
