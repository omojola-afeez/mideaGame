import { useEffect, useMemo, useState } from "react";
import { ROUND, type Level, type TopicDef, type TopicId } from "../../shared/constants";
import { coinsFor, scoreFor, starsFor } from "../../shared/learning";
import { loadQuestions, pickOfflineQuestions, type OfflineQuestion } from "../offline/bundle";
import { progressStore, useProgress, topicProgress } from "../lib/progress";
import { WaveTimer } from "../components/ui";

const LETTERS = ["A", "B", "C", "D"];
const DEFAULT_SECONDS = 25;

export interface OfflinePart {
  topic: TopicDef;
  level: Level;
}

export function OfflineRound({ parts, onExit }: { parts: OfflinePart[]; onExit: () => void }) {
  const { progress } = useProgress();
  const isMixed = parts.length > 1;
  const title = isMixed ? "Daily mix" : parts[0]?.topic.label ?? "Offline round";
  const [questions, setQuestions] = useState<OfflineQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<Array<{ code: string; topic: string; level: string; correct: boolean }>>([]);
  const [phase, setPhase] = useState<"question" | "reveal" | "results">("question");
  const [roundId] = useState(() => `off_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    let alive = true;
    loadQuestions()
      .then((all) => {
        if (!alive) return;
        const merged: OfflineQuestion[] = [];
        for (const part of parts) {
          const tp = topicProgress(progress, part.topic.id);
          const exclude = tp.seen;
          const got = pickOfflineQuestions(all, {
            band: progress.profile.band,
            topic: part.topic.id,
            level: part.level,
            excludeCodes: exclude,
            size: parts.length > 1 ? 3 : ROUND.size,
          });
          merged.push(...got);
        }
        if (merged.length === 0) {
          setError("No offline questions for this selection on this device. Go online once to cache them.");
          return;
        }
        // Shuffle the combined pool so mixed rounds feel natural.
        const shuffled = [...merged].sort(() => Math.random() - 0.5).slice(0, ROUND.size + (isMixed ? 2 : 0));
        setQuestions(shuffled);
      })
      .catch(() => alive && setError("Could not load the offline questions on this device. Go online once to cache them."));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client timer for timed offline rounds.
  useEffect(() => {
    if (phase !== "question" || !questions) return;
    if (secondsLeft <= 0) {
      answer(-1);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questions, secondsLeft]);

  const q = useMemo(() => (questions ? questions[index] : undefined), [questions, index]);
  const revealed = phase === "reveal" || phase === "results";
  const correct = q != null && revealed && picked === q.correctIndex;

  function answer(choice: number) {
    if (!q || phase !== "question") return;
    const isCorrect = choice >= 0 && choice === q.correctIndex;
    const nextStreak = isCorrect ? streak + 1 : 0;
    setStreak(nextStreak);
    setScore((s) => s + scoreFor({ correct: isCorrect, elapsedMs: 0, limitMs: 0, streak: nextStreak, timed: false }));
    setResults((r) => [...r, { code: q.code, topic: q.topic, level: q.level, correct: isCorrect }]);
    setPicked(choice);
    setPhase("reveal");
  }

  function next() {
    if (!questions) return;
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setPicked(null);
      setSecondsLeft(DEFAULT_SECONDS);
      setPhase("question");
      return;
    }
    const good = results.filter((r) => r.correct).length;
    const stars = starsFor(good, questions.length);
    const coins = coinsFor(good);
    progressStore.applyRound(
      {
        roundId,
        subject: isMixed ? "mixed" : parts[0]?.topic.subjectId ?? "",
        topic: isMixed ? "daily" : parts[0]?.topic.id ?? "",
        level: parts[0]?.level ?? "bronze",
        rounds: questions.length,
        stars,
        coins,
        results,
      },
      Date.now(),
    );
    setPhase("results");
  }

  if (error) {
    return (
      <main className="mx-auto grid min-h-dvh w-full max-w-lg place-items-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-lg text-muted">{error}</p>
          <button type="button" className="btn btn-primary w-full" onClick={onExit}>
            Back to the map
          </button>
        </div>
      </main>
    );
  }

  if (!questions || !q) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <p role="status" className="text-muted">
          Loading offline questions...
        </p>
      </main>
    );
  }

  if (phase === "results") {
    const good = results.filter((r) => r.correct).length;
    const stars = starsFor(good, questions.length);
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan">Offline round complete</p>
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="text-6xl" aria-hidden="true">
          {"⭐".repeat(Math.max(1, stars))}
        </p>
        <p className="text-xl">
          You got <strong>{good}</strong> out of <strong>{questions.length}</strong> right.
        </p>
        <p className="text-muted">Progress is saved on this device.</p>
        <button type="button" className="btn btn-primary w-full" onClick={onExit}>
          Back to the map
        </button>
      </main>
    );
  }

  const total = questions.length;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 pb-8 pt-4">
      <header className="flex items-center gap-3">
        <button type="button" className="btn btn-ghost !min-h-10 !px-3 text-sm" onClick={onExit} aria-label="Leave this round">
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold">{title} · offline</p>
          <p className="text-xs text-muted">
            Question {index + 1} of {total} · {q.level}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-display text-lg font-extrabold tabular-nums">{score}</p>
          <p className="text-xs text-muted">{streak > 1 ? `${streak} in a row` : "points"}</p>
        </div>
      </header>

      <ol className="flex gap-1" aria-label="Round progress">
        {questions.map((_, i) => (
          <li
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < index ? "bg-mint/70" : i === index ? "bg-cyan" : "bg-edge"}`}
          >
            <span className="sr-only">Question {i + 1}</span>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <WaveTimer fraction={secondsLeft / DEFAULT_SECONDS} urgent={secondsLeft <= 5} label={`${secondsLeft} seconds left`} />
        </div>
        <span
          className={`w-10 text-right font-display text-2xl font-extrabold tabular-nums ${
            secondsLeft <= 5 ? "text-rose" : "text-cyan"
          }`}
        >
          {secondsLeft}
        </span>
      </div>

      {q.passage && (
        <section aria-label="Passage" className="reading pop-in">
          {q.passage}
        </section>
      )}

      <div className="flex items-start gap-3">
        <h1 className="flex-1 py-2 text-2xl font-extrabold leading-tight sm:text-3xl">{q.text}</h1>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2" role="group" aria-label="Answers">
        {q.options.map((option, i) => {
          let stateName = "idle";
          if (revealed) {
            stateName = i === q.correctIndex ? "right" : i === picked ? "wrong" : "dim";
          } else if (picked != null) {
            stateName = i === picked ? "picked" : "dim";
          }
          return (
            <button
              key={`${q.code}-${i}`}
              className="answer"
              data-state={stateName}
              disabled={revealed}
              onClick={() => answer(i)}
              aria-label={`${LETTERS[i]}: ${option}`}
            >
              <span className="letter" aria-hidden="true">
                {LETTERS[i]}
              </span>
              <span className="flex-1">{option}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <section className="card pop-in p-4" aria-live="polite">
          <p className={`font-display text-xl font-extrabold ${correct ? "text-mint" : "text-text"}`}>
            {correct ? "Correct" : "Not this one"}
          </p>
          <p className="mt-1 text-muted">{q.explanation}</p>
          {!correct && (
            <p className="mt-2 text-sm">
              <span className="text-muted">Correct answer: </span>
              <strong>{q.options[q.correctIndex]}</strong>
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <button type="button" className="btn btn-primary min-w-36" onClick={next}>
              {index + 1 >= total ? "See results" : "Next question"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
