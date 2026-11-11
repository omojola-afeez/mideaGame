import { TOPICS } from "../../shared/constants";
import type { Question, TopicFile } from "../../shared/question";
import { buildBank, type QuestionBank } from "../game/selection";
import { TOPIC_FILES } from "./registry";

function assertBank(files: TopicFile[]): void {
  const seen = new Set<string>();
  for (const file of files) {
    const topic = TOPICS.find((t) => t.id === file.topic);
    if (!topic) throw new Error(`Unknown topic in bank: ${file.topic}`);
    if (topic.subjectId !== file.subject) {
      throw new Error(`Topic ${file.topic} belongs to ${topic.subjectId}, not ${file.subject}`);
    }
    for (const q of file.questions as Question[]) {
      if (seen.has(q.code)) throw new Error(`Duplicate question code: ${q.code}`);
      seen.add(q.code);
      if (q.subject !== file.subject || q.topic !== file.topic) {
        throw new Error(`Question ${q.code} has metadata that does not match its file`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${q.code} must have exactly four options`);
      }
      if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error(`Question ${q.code} has an invalid correctIndex`);
      }
    }
  }
}

assertBank(TOPIC_FILES);

export const bank: QuestionBank = buildBank(TOPIC_FILES);

export function bankSummary() {
  return {
    total: bank.stats.total,
    byStatus: bank.stats.byStatus,
    byTopic: bank.stats.byTopic,
  };
}