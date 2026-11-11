import { z } from "zod";
import { LEVELS, LIMITS, ROUND, SUBJECTS, TOPICS } from "./constants";

const NAME_PATTERN = /^[\p{L}\p{N} ._'-]+$/u;
const CODE_PATTERN = /^[A-Z]{3}-[A-Z]{3}-[BSG]-\d{3}$/;

export function cleanName(raw: string): string {
  return raw.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export const nameSchema = z
  .string()
  .max(64)
  .transform(cleanName)
  .refine((v) => v.length >= LIMITS.nameMin && v.length <= LIMITS.nameMax, "name length")
  .refine((v) => NAME_PATTERN.test(v), "name characters");

export const avatarSchema = z.number().int().min(0).max(LIMITS.avatarCount - 1);

export const joinOptionsSchema = z
  .object({
    name: nameSchema,
    avatar: avatarSchema.default(0),
  })
  .strict();
export type JoinOptions = z.infer<typeof joinOptionsSchema>;

export const questionCodeSchema = z.string().regex(CODE_PATTERN, "question code");

const subjectIds = SUBJECTS.map((s) => s.id) as [string, ...string[]];

export const roundPartSchema = z
  .object({
    subject: z.enum(subjectIds),
    topic: z.string().min(1).max(32),
    level: z.enum(LEVELS),
    count: z.number().int().min(1).max(ROUND.size).default(ROUND.size),
    reviewCodes: z.array(questionCodeSchema).max(6).default([]),
    excludeCodes: z.array(questionCodeSchema).max(60).default([]),
  })
  .strict();
export type RoundPart = z.infer<typeof roundPartSchema>;

export const startRoundSchema = z
  .object({
    parts: z.array(roundPartSchema).min(1).max(4),
    timed: z.boolean().default(true),
  })
  .strict()
  .refine((v) => v.parts.reduce((sum, p) => sum + p.count, 0) <= 12, "round too long")
  .refine(
    (v) => v.parts.every((p) => TOPICS.some((t) => t.id === p.topic && t.subjectId === p.subject)),
    "unknown topic",
  );
export type StartRound = z.infer<typeof startRoundSchema>;

export const answerSchema = z
  .object({
    q: z.number().int().min(0).max(99),
    choice: z.number().int().min(0).max(LIMITS.optionCount - 1),
  })
  .strict();

export const syncSchema = z.object({ t0: z.number().finite() }).strict();

export const emptySchema = z.object({}).strict().optional();

export const reportReasonSchema = z.enum(["wrong_answer", "typo", "unclear", "other"]);

export const reportSchema = z
  .object({
    code: questionCodeSchema,
    reason: reportReasonSchema,
    note: z.string().max(LIMITS.noteMax).optional(),
  })
  .strict();
export type Report = z.infer<typeof reportSchema>;

export const REPORT_REASON_LABELS: Record<z.infer<typeof reportReasonSchema>, string> = {
  wrong_answer: "The answer is wrong",
  typo: "Spelling or typing mistake",
  unclear: "The question is confusing",
  other: "Something else",
};