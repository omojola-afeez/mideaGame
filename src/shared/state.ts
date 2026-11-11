import { schema, t, type SchemaType } from "@colyseus/schema";
import { ROUND } from "./constants";

export const QuestionView = schema(
  {
    index: t.int16(),
    total: t.uint8(),
    code: t.string(),
    topic: t.string(),
    text: t.string(),
    /** Only present on reading comprehension questions. */
    passage: t.string(),
    options: t.array("string"),
    level: t.string(),
    startedAt: t.float64(),
    endsAt: t.float64(),
    /** -1 until the reveal. The server never writes it earlier. */
    correctIndex: t.int8(),
    /** -1 until the child picks, or until time runs out. */
    chosenIndex: t.int8(),
    explanation: t.string(),
  },
  "QuestionView",
);
export type QuestionView = SchemaType<typeof QuestionView>;

export const ResultView = schema(
  {
    code: t.string(),
    topic: t.string(),
    text: t.string(),
    level: t.string(),
    chosenIndex: t.int8(),
    correctIndex: t.int8(),
    chosenText: t.string(),
    correctText: t.string(),
    correct: t.boolean(),
    explanation: t.string(),
  },
  "ResultView",
);
export type ResultView = SchemaType<typeof ResultView>;

export const QuestState = schema(
  {
    phase: t.string(),
    /** Increases on every authoritative transition. */
    seq: t.uint32(),
    roundId: t.string(),
    nickname: t.string(),
    avatar: t.uint8(),
    subject: t.string(),
    topic: t.string(),
    level: t.string(),
    rounds: t.uint8(),
    timed: t.boolean(),
    questionSeconds: t.uint8(),
    serverNow: t.float64(),
    phaseEndsAt: t.float64(),
    score: t.uint32(),
    correctCount: t.uint8(),
    answeredCount: t.uint8(),
    streak: t.uint8(),
    bestStreak: t.uint8(),
    stars: t.uint8(),
    coins: t.uint16(),
    hint: t.string(),
    question: QuestionView,
    results: t.array(ResultView),
  },
  "QuestState",
);
export type QuestState = SchemaType<typeof QuestState>;

export function createInitialState(): QuestState {
  const state = new QuestState();
  state.phase = "READY";
  state.seq = 0;
  state.roundId = "";
  state.nickname = "";
  state.avatar = 0;
  state.subject = "";
  state.topic = "";
  state.level = "bronze";
  state.rounds = ROUND.size;
  state.timed = true;
  state.questionSeconds = ROUND.questionSeconds;
  state.serverNow = Date.now();
  state.phaseEndsAt = 0;
  state.score = 0;
  state.correctCount = 0;
  state.answeredCount = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.stars = 0;
  state.coins = 0;
  state.hint = "";

  const q = new QuestionView();
  q.index = -1;
  q.total = 0;
  q.code = "";
  q.topic = "";
  q.text = "";
  q.passage = "";
  q.level = "bronze";
  q.startedAt = 0;
  q.endsAt = 0;
  q.correctIndex = -1;
  q.chosenIndex = -1;
  q.explanation = "";
  state.question = q;
  return state;
}

export function clearQuestion(state: QuestState): void {
  state.question.index = -1;
  state.question.total = 0;
  state.question.code = "";
  state.question.topic = "";
  state.question.text = "";
  state.question.passage = "";
  state.question.options.clear();
  state.question.level = "bronze";
  state.question.startedAt = 0;
  state.question.endsAt = 0;
  state.question.correctIndex = -1;
  state.question.chosenIndex = -1;
  state.question.explanation = "";
}