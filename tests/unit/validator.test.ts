import { describe, expect, it } from "vitest";
import { BAND } from "../../src/shared/constants";
import type { Question, TopicFile } from "../../src/shared/question";
import { isClean, summarise, validateTopicFile, validateQuestion } from "../../src/server/data/validate";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    code: "ENG-COM-B-001",
    subject: "english",
    topic: "comprehension",
    level: "bronze",
    text: "Who found the book?",
    options: ["The rain", "Ada", "The door", "The road"],
    correctIndex: 1,
    explanation: "Ada found it under the bed.",
    curriculumRef: "NERDC Primary 4 English, comprehension",
    author: "Teacher A",
    reviewer: null,
    status: "draft",
    ...overrides,
  } as Question;
}

function makeFile(questions: Question[]): TopicFile {
  return { subject: "english", topic: "comprehension", title: "Reading detective", questions };
}

describe("validateQuestion", () => {
  it("accepts a complete draft question", () => {
    expect(validateQuestion(makeQuestion(), { subject: "english" as const, topic: "comprehension" as const })).toEqual([]);
  });

  it("rejects a question whose text is above the Explorers reading band", () => {
    const longText =
      "The approximately simultaneous consequences of the contemporary situation are difficult to understand for a child.";
    const issues = validateQuestion(
      makeQuestion({ text: longText }),
      { subject: "english", topic: "comprehension" },
      { perLevel: 40, maxGrade: BAND.readingGrade, warnGrade: BAND.readingGrade },
    );
    expect(issues.some((i) => i.code === "reading_grade")).toBe(true);
  });

  it("rejects text above the allowed length", () => {
    const longText = Array.from({ length: 40 }, (_, i) => `word${i}`).join(" ");
    const issues = validateQuestion(
      makeQuestion({ text: longText }),
      { subject: "english", topic: "comprehension" },
      { perLevel: 40, maxGrade: 9, warnGrade: 6.5 },
    );
    expect(issues.some((i) => i.code === "text_words")).toBe(true);
  });

  it("rejects questions with no explanation", () => {
    const issues = validateQuestion(makeQuestion({ explanation: "" }), { subject: "english", topic: "comprehension" });
    expect(issues.some((i) => i.code === "missing_field")).toBe(true);
  });

  it("rejects answers that are not option positions", () => {
    const issues = validateQuestion(makeQuestion({ correctIndex: 4 }), { subject: "english", topic: "comprehension" });
    expect(issues.some((i) => i.code === "correct_index")).toBe(true);
  });

  it("rejects duplicate options in one question", () => {
    const issues = validateQuestion(
      makeQuestion({ options: ["Ada", "Ada", "The door", "The road"] }),
      { subject: "english", topic: "comprehension" },
    );
    expect(issues.some((i) => i.code === "option_duplicate")).toBe(true);
  });

  it("rejects an em dash in any written field", () => {
    const issues = validateQuestion(makeQuestion({ explanation: `A good answer ${"\u2014"} indeed.` }), { subject: "english", topic: "comprehension" });
    expect(issues.some((i) => i.code === "em_dash")).toBe(true);
  });

  it("accepts a reviewed question with a reviewer", () => {
    const issues = validateQuestion(makeQuestion({ status: "reviewed", reviewer: "Mrs. Bello" }), { subject: "english", topic: "comprehension" });
    expect(issues).toEqual([]);
  });
});

describe("validateTopicFile", () => {
  it("flags duplicate codes", () => {
    const file = makeFile([makeQuestion(), makeQuestion({ code: "ENG-COM-B-001" })]);
    const issues = validateTopicFile(file, { perLevel: 40, maxGrade: BAND.readingGrade + 1, warnGrade: BAND.readingGrade });
    expect(issues.some((i) => i.code === "duplicate_code")).toBe(true);
  });

  it("flags prompts that repeat", () => {
    const file = makeFile([makeQuestion(), makeQuestion({ options: ["The rain", "The door", "The road", "The sky"] })]);
    const issues = validateTopicFile(file, { perLevel: 40, maxGrade: BAND.readingGrade + 1, warnGrade: BAND.readingGrade });
    expect(issues.some((i) => i.code === "duplicate_prompt")).toBe(true);
  });

  it("flags an empty topic file", () => {
    const file = makeFile([]);
    const issues = validateTopicFile(file, { perLevel: 40, maxGrade: BAND.readingGrade + 1, warnGrade: BAND.readingGrade });
    expect(issues.some((i) => i.code === "no_questions")).toBe(true);
  });

  it("summarises issues without counting warnings as failures", () => {
    expect(summarise([])).toBe("0 errors, 0 warnings");
    expect(summarise([{ severity: "error", code: "x", message: "x" }, { severity: "warning", code: "y", message: "y" }])).toBe("1 error, 1 warning");
  });
});
