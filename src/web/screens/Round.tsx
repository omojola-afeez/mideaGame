import { useEffect, useRef, useState } from "react";
import { ROUND, topicById } from "../../shared/constants";
import { game, useGame } from "../lib/store";
import { useProgress } from "../lib/progress";
import { speak } from "../lib/speech";
import { ReportDialog, Sheet, WaveTimer, useTick } from "../components/ui";
import type { Snapshot } from "../lib/store";

const LETTERS = ["A", "B", "C", "D"];

function speechText(q: Snapshot["question"]): string {
  const parts: string[] = [];
  if (q.passage) parts.push(q.passage);
  parts.push(q.text);
  q.options.forEach((option, i) => parts.push(`${LETTERS[i]}. ${option}`));
  return parts.join(". ");
}

function roundLabel(snap: Snapshot): string {
  if (snap.subject === "mixed" || snap.topic === "daily") return "Daily mix";
  return topicById(snap.topic)?.label ?? "Round";
}

export function Round({ onExit }: { onExit: () => void }) {
  const { snap, pick, status } = useGame();
  const { progress } = useProgress();
  const [reportCode, setReportCode] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const q = snap?.question;
  const now = useTick(!!snap && snap.phase === "QUESTION" && snap.timed, 150);

  useEffect(() => {
    if (!snap || snap.phase !== "QUESTION") return;
    if (!progress.settings.readAloud) return;
    speak(speechText(snap.question));
  }, [snap?.question.code, snap?.phase, progress.settings.readAloud]);

  useEffect(() => {
    if (snap?.phase === "REVEAL") nextRef.current?.focus();
  }, [snap?.phase, snap?.question.index]);

  useEffect(() => {
    if (!snap || snap.phase !== "QUESTION") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) game.answer(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [snap?.phase, snap?.question.index]);

  if (!snap || !q) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <p role="status" className="text-muted">
          {status === "reconnecting" ? "Reconnecting to your round..." : "Opening your round..."}
        </p>
      </main>
    );
  }

  const revealed = snap.phase === "REVEAL";
  const localPick = pick && pick.q === q.index ? pick.choice : -1;
  const chosen = revealed ? q.chosenIndex : localPick;
  const locked = chosen >= 0;
  const total = Math.max(1, q.endsAt - q.startedAt);
  const remaining = Math.max(0, q.endsAt - now);
  const secs = Math.ceil(remaining / 1000);
  const correct = revealed && q.chosenIndex === q.correctIndex && q.chosenIndex >= 0;
  const timedOut = revealed && q.chosenIndex < 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 pb-8 pt-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-ghost !min-h-10 !px-3 text-sm"
          onClick={() => setLeaveOpen(true)}
          aria-label="Leave this round"
        >
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold">{roundLabel(snap)}</p>
          <p className="text-xs text-muted">
            Question {q.index + 1} of {q.total} · {q.level}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-display text-lg font-extrabold tabular-nums">{snap.score}</p>
          <p className="text-xs text-muted">{snap.streak > 1 ? `${snap.streak} in a row` : "points"}</p>
        </div>
      </header>

      <ol className="flex gap-1" aria-label="Round progress">
        {Array.from({ length: snap.rounds }, (_, i) => (
          <li
            key={i}
            aria-current={i === q.index ? "step" : undefined}
            className={`h-1.5 flex-1 rounded-full ${
              i < q.index ? "bg-mint/70" : i === q.index ? "bg-cyan" : "bg-edge"
            }`}
          >
            <span className="sr-only">Question {i + 1}</span>
          </li>
        ))}
      </ol>

      {snap.timed ? (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <WaveTimer fraction={remaining / total} urgent={secs <= 5} label={`${secs} seconds left`} />
          </div>
          <span
            className={`w-10 text-right font-display text-2xl font-extrabold tabular-nums ${
              secs <= 5 ? "text-rose" : "text-cyan"
            }`}
            aria-hidden="true"
          >
            {Math.max(0, secs)}
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted">Take your time. The timer is off.</p>
      )}

      {q.passage && (
        <section aria-label="Passage" className="reading pop-in">
          {q.passage}
        </section>
      )}

      <div className="flex items-start gap-3">
        <h1 className="flex-1 py-2 text-2xl font-extrabold leading-tight sm:text-3xl">{q.text}</h1>
        <button
          type="button"
          className="btn btn-ghost !min-h-11 shrink-0 !px-3"
          onClick={() => speak(speechText(q))}
          aria-label="Read this question aloud"
          title="Read aloud"
        >
          🔊
        </button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2" role="group" aria-label="Answers">
        {q.options.map((option, i) => {
          let stateName = "idle";
          if (revealed) {
            stateName = i === q.correctIndex ? "right" : i === q.chosenIndex ? "wrong" : "dim";
          } else if (locked) {
            stateName = i === localPick ? "picked" : "dim";
          }
          return (
            <button
              key={`${q.code}-${i}`}
              className="answer"
              data-state={stateName}
              disabled={revealed || locked}
              onClick={() => game.answer(i)}
              aria-keyshortcuts={String(i + 1)}
              aria-label={`${LETTERS[i]}: ${option}${
                revealed && i === q.correctIndex ? ", correct answer" : ""
              }${revealed && i === q.chosenIndex && i !== q.correctIndex ? ", your answer" : ""}`}
            >
              <span className="letter" aria-hidden="true">
                {LETTERS[i]}
              </span>
              <span className="flex-1">{option}</span>
              {!revealed && <kbd className="hidden text-xs text-muted sm:inline">{i + 1}</kbd>}
            </button>
          );
        })}
      </div>

      {!revealed && (
        <p className="min-h-6 text-center text-sm text-muted" role="status">
          {locked ? "Answer sent." : "Pick one. Tap the speaker to hear the question."}
        </p>
      )}

      {revealed && (
        <section className="card pop-in p-4" aria-live="polite">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              {correct ? "✅" : timedOut ? "⌛" : "💡"}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-display text-xl font-extrabold ${correct ? "text-mint" : "text-text"}`}>
                {correct ? "Correct" : timedOut ? "Time ran out" : "Not this one"}
              </p>
              <p className="mt-1 text-muted">{q.explanation}</p>
              {!correct && (
                <p className="mt-2 text-sm">
                  <span className="text-muted">Correct answer: </span>
                  <strong>{q.options[q.correctIndex]}</strong>
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="text-sm font-semibold text-muted underline" onClick={() => setReportCode(q.code)}>
              Report a problem
            </button>
            <button ref={nextRef} type="button" className="btn btn-primary min-w-36" onClick={() => game.next()}>
              {q.index + 1 >= q.total ? "See results" : "Next question"}
            </button>
          </div>
          <p className="mt-2 text-right text-xs text-muted">Next question opens on its own after a minute.</p>
        </section>
      )}

      {!snap.timed && revealed && (
        <p className="text-center text-xs text-muted">Untimed round. Speed does not add points.</p>
      )}

      {reportCode && <ReportDialog code={reportCode} onClose={() => setReportCode(null)} />}

      {leaveOpen && (
        <Sheet title="Leave this round?" onClose={() => setLeaveOpen(false)} labelledBy="leave-title">
          <p className="text-muted">
            Your answers in this round will not be saved and no stars will be added. You can start again from the map.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" className="btn btn-ghost flex-1" onClick={() => setLeaveOpen(false)}>
              Keep playing
            </button>
            <button
              type="button"
              className="btn btn-danger flex-1"
              onClick={() => {
                setLeaveOpen(false);
                void game.leave().then(onExit);
              }}
            >
              Leave round
            </button>
          </div>
        </Sheet>
      )}
    </main>
  );
}