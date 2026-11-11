import { describe, expect, it } from "vitest";
import { bandById } from "../../src/shared/constants";
import type { Question, TopicFile } from "../../src/shared/question";
import { isClean, summarise, validateTopicFile, validateQuestion } from "../../src/server/data/validate";

const BAND = bandById("10-12")!;

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    code: "10-ENG-COM-B-001",
    band: "10-12",
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
  return { band: "10-12", subject: "english", topic: "comprehension", title: "Reading detective", questions };
}

const FILE_REF = { subject: "english" as const, topic: "comprehension" as const };

describe("validateQuestion", () => {
  it("accepts a complete draft question", () => {
    expect(validateQuestion(makeQuestion(), FILE_REF)).toEqual([]);
  });

  it("rejects a question whose text is above the band reading grade", () => {
    const longText =
      "The approximately simultaneous consequences of the contemporary situation are difficult to understand for a child.";
    const issues = validateQuestion(makeQuestion({ text: longText }), FILE_REF, {
      perLevel: 40,
      maxGrade: BAND.readingGrade,
      warnGrade: BAND.readingGrade,
    });
    expect(issues.some((i) => i.code === "reading_grade")).toBe(true);
  });

  it("rejects text above the allowed length", () => {
    const longText = Array.from({ length: 40 }, (_, i) => `word${i}`).join(" ");
    const issues = validateQuestion(makeQuestion({ text: longText }), FILE_REF, {
      perLevel: 40,
      maxGrade: 9,
      warnGrade: 6.5,
    });
    expect(issues.some((i) => i.code === "text_words")).toBe(true);
  });

  it("rejects a band the game does not know", () => {
    const issues = validateQuestion(makeQuestion({ band: "13-15" as Question["band"] }), FILE_REF);
    expect(issues.some((i) => i.code === "bad_band")).toBe(true);
  });

  it("rejects questions with no explanation", () => {
    const issues = validateQuestion(makeQuestion({ explanation: "" }), FILE_REF);
    expect(issues.some((i) => i.code === "missing_field")).toBe(true);
  });

  it("rejects answers that are not option positions", () => {
    const issues = validateQuestion(makeQuestion({ correctIndex: 4 }), FILE_REF);
    expect(issues.some((i) => i.code === "correct_index")).toBe(true);
  });

  it("rejects duplicate options in one question", () => {
    const issues = validateQuestion(
      makeQuestion({ options: ["Ada", "Ada", "The door", "The road"] }),
      FILE_REF,
    );
    expect(issues.some((i) => i.code === "option_duplicate")).toBe(true);
  });

  it("rejects an em dash in any written field", () => {
    const issues = validateQuestion(makeQuestion({ explanation: `A good answer ${"\u2014"} indeed.` }), FILE_REF);
    expect(issues.some((i) => i.code === "em_dash")).toBe(true);
  });

  it("accepts a reviewed question with a reviewer", () => {
    const issues = validateQuestion(makeQuestion({ status: "reviewed", reviewer: "Mrs. Bello" }), FILE_REF);
    expect(issues).toEqual([]);
  });
});

describe("validateTopicFile", () => {
  it("flags duplicate codes", () => {
    const file = makeFile([makeQuestion(), makeQuestion({ code: "10-ENG-COM-B-001" })]);
    const issues = validateTopicFile(file, { perLevel: 40 });
    expect(issues.some((i) => i.code === "duplicate_code")).toBe(true);
  });

  it("flags prompts that repeat", () => {
    const file = makeFile([makeQuestion(), makeQuestion({ options: ["The rain", "The door", "The road", "The sky"] })]);
    const issues = validateTopicFile(file, { perLevel: 40 });
    expect(issues.some((i) => i.code === "duplicate_prompt")).toBe(true);
  });

  it("flags an empty topic file", () => {
    const file = makeFile([]);
    const issues = validateTopicFile(file, { perLevel: 40 });
    expect(issues.some((i) => i.code === "no_questions")).toBe(true);
  });

  it("summarises issues without counting warnings as failures", () => {
    expect(summarise([])).toBe("0 errors, 0 warnings");
    expect(
      summarise([
        { severity: "error", code: "x", message: "x" },
        { severity: "warning", code: "y", message: "y" },
      ]),
    ).toBe("1 error, 1 warning");
  });
});
