import { useEffect, useState } from "react";
import { LEVEL_LABELS, ROUND, TOPICS, topicById } from "../../shared/constants";
import { dailyPlan, type RoundPartInput } from "../../shared/daily";
import { dayKey, dueReviewCodes } from "../../shared/learning";
import { useGame } from "../lib/store";
import { progressStore, topicProgress, useProgress } from "../lib/progress";
import { LevelBadge, ReportDialog } from "../components/ui";
import type { Snapshot } from "../lib/store";

function roundLabel(snap: Snapshot): string {
  if (snap.subject === "mixed" || snap.topic === "daily") return "Daily mix";
  return topicById(snap.topic)?.label ?? "Round";
}

export function Results({
  onMap,
  onPlayAgain,
}: {
  onMap: () => void;
  onPlayAgain: (parts: RoundPartInput[], timed: boolean) => void;
}) {
  const { snap } = useGame();
  const { progress, outcome } = useProgress();
  const [reportCode, setReportCode] = useState<string | null>(null);

  useEffect(() => {
    if (snap?.phase === "RESULTS") progressStore.applyRound(snap);
  }, [snap?.roundId, snap?.phase]);

  if (!snap) return null;

  const correct = snap.results.filter((r) => r.correct).length;
  const total = snap.rounds || snap.results.length || ROUND.size;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const missed = snap.results.filter((r) => !r.correct);
  const primaryTopic = TOPICS.find((t) => t.id === snap.topic);
  const outcomeHere = outcome?.roundId === snap.roundId ? outcome : null;
  const wasDaily = snap.subject === "mixed" || snap.topic === "daily";
  const roundTimed = snap.timed;
  const roundTopicId = snap.topic;
  const changes = outcomeHere?.levelChanges ?? [];
  const movedDown = changes.some((c) => c.direction === "down");
  const movedUp = changes.filter((c) => c.direction === "up");

  function again() {
    const now = Date.now();
    if (wasDaily) {
      const plan = dailyPlan(dayKey(now), (topic) => topicProgress(progress, topic).level);
      const parts: RoundPartInput[] = plan.map((part) => ({
        ...part,
        reviewCodes: dueReviewCodes(progress.reviews, part.topic, now, 2),
        excludeCodes: topicProgress(progress, part.topic).seen,
      }));
      onPlayAgain(parts, roundTimed);
      return;
    }
    const topic = TOPICS.find((t) => t.id === roundTopicId);
    if (!topic) {
      onMap();
      return;
    }
    const tp = topicProgress(progress, topic.id);
    onPlayAgain(
      [
        {
          subject: topic.subjectId,
          topic: topic.id,
          level: tp.level,
          count: ROUND.size,
          reviewCodes: dueReviewCodes(progress.reviews, topic.id, now, ROUND.maxReviews),
          excludeCodes: tp.seen,
        },
      ],
      roundTimed,
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 pb-10 pt-6">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan">{roundLabel(snap)}</p>
        <div className="mt-2 flex justify-center gap-2" aria-label={`${snap.stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`text-5xl sm:text-6xl ${snap.stars > i ? "star-pop text-gold" : "text-edge"}`}
              style={{ animationDelay: `${i * 120}ms` }}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          {correct} of {total} right
        </h1>
        <p className="mt-1 text-muted">
          {percent}% correct. You earned <strong className="text-gold">🪙 {snap.coins}</strong> coins.
        </p>
      </header>

      {movedUp.length > 0 && (
        <section className="card float-up border-mint/50 bg-mint/10 p-4 text-center">
          <p className="font-display text-xl font-extrabold text-mint">Level up!</p>
          <p className="mt-1 text-sm">
            {movedUp.map((c) => {
              const t = TOPICS.find((x) => x.id === c.topic);
              return `${t?.label ?? c.topic} moves to ${LEVEL_LABELS[c.after]}.`;
            })}
          </p>
        </section>
      )}

      {movedDown && (
        <section className="card p-4">
          <p className="font-display text-lg font-extrabold">A smaller step next time</p>
          <p className="mt-1 text-sm text-muted">
            We moved you down one level so the questions fit better. This is not a punishment.
          </p>
          <p className="mt-2 rounded-xl border border-edge bg-panel/60 p-3 text-sm">
            <strong>Hint:</strong> read every option before you choose, and look for the key word in the question.
          </p>
        </section>
      )}

      {missed.length > 0 && (
        <section className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-extrabold">Come back to these</h2>
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
              {missed.length} in 1 day
            </span>
          </div>
          <ul className="mt-3 space-y-3">
            {missed.map((r) => (
              <li key={r.code} className="rounded-xl border border-edge bg-panel/50 p-3">
                <p className="font-semibold">{r.text}</p>
                <p className="mt-1 text-sm text-muted">{r.explanation}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>
                    <span className="text-muted">Correct answer: </span>
                    <strong>{r.correctText}</strong>
                  </span>
                  <button type="button" className="font-semibold text-muted underline" onClick={() => setReportCode(r.code)}>
                    Report
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            These questions return after 1 day, then 3 days, then 7 days. Answering them right moves them out of review.
          </p>
        </section>
      )}

      <section className="card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Your totals</p>
            <p className="font-display text-lg font-extrabold">
              🪙 {progress.coins} coins · ⭐ {snap.stars} this round
            </p>
          </div>
          {primaryTopic && <LevelBadge level={topicProgress(progress, primaryTopic.id).level} />}
        </div>
        <p className="mt-2 text-sm text-muted">
          {progress.streak.days > 0
            ? `Day ${progress.streak.days} of your streak. A missed day pauses it, it does not reset.`
            : "Play again tomorrow to start a streak."}
        </p>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn btn-primary flex-1" onClick={again}>
          {wasDaily ? "Another daily mix" : "Play again"}
        </button>
        <button type="button" className="btn btn-ghost flex-1" onClick={onMap}>
          Back to the map
        </button>
      </div>
      <p className="text-center text-xs text-muted">
        {wasDaily
          ? "Daily stars are counted in your round, not on one island."
          : "Stars are saved for this level on this device."}
      </p>

      {reportCode && <ReportDialog code={reportCode} onClose={() => setReportCode(null)} />}
    </main>
  );
}