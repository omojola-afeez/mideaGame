import { useEffect, useRef, useState } from "react";
import {
  BANDS,
  LEVEL_BLURBS,
  LEVEL_LABELS,
  ROUND,
  SUBJECTS,
  TOPICS_BY_SUBJECT,
  type SubjectId,
  type TopicDef,
} from "../../shared/constants";
import { dailyPlan, type RoundPartInput } from "../../shared/daily";
import { dayKey, dueCount, dueReviewCodes } from "../../shared/learning";
import { useCatalog } from "../lib/catalog";
import { dueTotal, progressStore, topicProgress, totalStars, useProgress } from "../lib/progress";
import { Avatar, LevelBadge, Sheet, Stars } from "../components/ui";

export function Map({
  onStart,
  onGrownups,
  onHome,
  offline = false,
}: {
  onStart: (parts: RoundPartInput[], timed: boolean) => void;
  onGrownups: () => void;
  onHome: () => void;
  offline?: boolean;
}) {
  const { progress } = useProgress();
  const band = progress.profile.band;
  const bandDef = BANDS.find((b) => b.id === band);
  const { countFor } = useCatalog(band);
  const [subject, setSubject] = useState<SubjectId>(() => {
    // Honour a subject chosen on the landing page, if any.
    try {
      const preferred = sessionStorage.getItem("brainwave-preferred-subject") as SubjectId | null;
      if (preferred && SUBJECTS.some((s) => s.id === preferred)) return preferred;
    } catch {
      /* storage is optional */
    }
    return "english";
  });
  const [selected, setSelected] = useState<TopicDef | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const now = Date.now();
  const due = dueTotal(progress, now);

  function scrollTabs() {
    tabsRef.current?.scrollBy({ left: 190, behavior: "auto" });
  }

  useEffect(() => {
    try {
      sessionStorage.removeItem("brainwave-preferred-subject");
    } catch {
      /* storage is optional */
    }
  }, []);

  function startTopic(topic: TopicDef, timed: boolean) {
    const tp = topicProgress(progress, topic.id);
    const reviews = dueReviewCodes(progress.reviews, topic.id, now, ROUND.maxReviews);
    onStart(
      [
        {
          subject: topic.subjectId,
          topic: topic.id,
          level: tp.level,
          count: ROUND.size,
          reviewCodes: reviews,
          excludeCodes: tp.seen,
        },
      ],
      timed,
    );
    setSelected(null);
  }

  function startDaily(timed: boolean) {
    const plan = dailyPlan(dayKey(now), (topic) => topicProgress(progress, topic).level);
    const parts: RoundPartInput[] = plan.map((part) => ({
      ...part,
      reviewCodes: dueReviewCodes(progress.reviews, part.topic, now, 2),
      excludeCodes: topicProgress(progress, part.topic).seen,
    }));
    onStart(parts, timed);
  }

  const topics = TOPICS_BY_SUBJECT[subject];
  const subjectDef = SUBJECTS.find((s) => s.id === subject);
  const streak = progress.streak;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-5">
      <header className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Avatar index={progress.profile.avatar} size={44} />
        <div className="min-w-0 flex-1 basis-36 sm:flex-none">
          <p className="truncate font-display text-base font-extrabold sm:text-lg">{progress.profile.nickname || "Explorer"}</p>
          <p className="text-xs text-muted sm:text-sm">
            {bandDef?.label}, ages {bandDef?.ages}
            {offline ? " · offline" : ""}
            {streak.days > 0 ? ` · ${streak.days} day${streak.days === 1 ? "" : "s"}${streak.paused ? " (paused)" : ""}` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-bold sm:gap-2 sm:text-sm">
          <span className="rounded-full border border-edge bg-panel/70 px-2 py-0.5 sm:px-3 sm:py-1" aria-label={`${totalStars(progress)} stars`}>
            ⭐ {totalStars(progress)}
          </span>
          <span className="rounded-full border border-edge bg-panel/70 px-2 py-0.5 sm:px-3 sm:py-1" aria-label={`${progress.coins} coins`}>
            🪙 {progress.coins}
          </span>
          <button
            type="button"
            className="btn btn-ghost !min-h-9 !px-2 sm:!min-h-10 sm:!px-3"
            onClick={onHome}
            aria-label="Back to the home screen"
            title="Home"
          >
            🏠
          </button>
          <button
            type="button"
            className="btn btn-ghost !min-h-9 !px-2 sm:!min-h-10 sm:!px-3"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan">Your map</p>
          <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">Pick a world</h1>
          <p className="mt-2 max-w-xl text-muted">
            Eight questions, a short reason after each one, and stars at the end. Missed questions come back later.
          </p>
        </div>
        {due > 0 && (
          <div className="rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm">
            <strong className="text-gold">{due}</strong> question{due === 1 ? "" : "s"} ready to revisit
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => startDaily(progress.settings.timed)}
        className="card mt-6 flex w-full items-center gap-4 p-4 text-left transition hover:border-cyan/70 sm:p-5"
      >
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gold/15 text-3xl" aria-hidden="true">
          🎯
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl font-extrabold">Daily mix</span>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">Today</span>
          </span>
          <span className="mt-1 block text-sm text-muted">
            10 questions from English, Maths and Code and AI. The set changes each day.
          </span>
        </span>
        <span className="font-display text-2xl text-cyan" aria-hidden="true">
          →
        </span>
      </button>

      <div className="mt-8">
        <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted sm:hidden">
          Swipe <span aria-hidden="true">→</span> to see more subjects
        </p>
        <div className="relative">
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Subjects"
          >
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={subject === s.id}
                onClick={() => setSubject(s.id)}
                className={`chip shrink-0 !min-h-11 ${subject === s.id ? "!border-cyan !bg-cyan/15" : ""}`}
              >
                <span aria-hidden="true">{s.emoji}</span> {s.short}
              </button>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-ink to-transparent sm:w-20"
          />
          <button
            type="button"
            onClick={scrollTabs}
            aria-label="Show more subjects"
            title="More subjects"
            className="absolute right-0 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full border border-edge bg-panel/90 font-display text-lg font-extrabold text-cyan shadow-md hover:border-cyan"
          >
            ›
          </button>
        </div>
      </div>

      <section role="tabpanel" aria-label={subjectDef?.label} className="mt-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{subjectDef?.label}</h2>
            <p className="text-sm text-muted">{subjectDef?.blurb}</p>
          </div>
          <span className="text-xs text-muted">{topics.length} islands</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => {
            const tp = topicProgress(progress, topic.id);
            const count = countFor(topic.id);
            const dueHere = dueCount(progress.reviews, topic.id, now);
            const disabled = count === 0;
            return (
              <button
                key={topic.id}
                type="button"
                className="topic-card"
                data-due={dueHere > 0}
                disabled={disabled}
                onClick={() => setSelected(topic)}
                aria-label={`${topic.label}. ${LEVEL_LABELS[tp.level]} level. ${tp.stars[tp.level]} of 3 stars.${
                  dueHere ? ` ${dueHere} to revisit.` : ""
                }${disabled ? " Content coming soon." : ""}`}
              >
                <span className="topic-emoji" aria-hidden="true">
                  {topic.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-extrabold">{topic.label}</span>
                    <LevelBadge level={tp.level} />
                    {dueHere > 0 && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
                        {dueHere} to revisit
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{topic.blurb}</span>
                  <span className="mt-2 flex items-center justify-between">
                    <Stars value={tp.stars[tp.level]} />
                    <span className="text-xs text-muted">
                      {disabled ? "Coming soon" : offline ? "Ready to play" : `${count ?? "?"} questions`}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4 text-sm text-muted">
        <p>No chat. No strangers. No buying anything.</p>
        <button type="button" className="font-semibold underline" onClick={onGrownups}>
          For grown-ups
        </button>
      </footer>

      {selected && (
        <Sheet title={selected.label} onClose={() => setSelected(null)} labelledBy="topic-title">
          <TopicPanel
            topic={selected}
            onStart={(timed) => startTopic(selected, timed)}
            onGrownups={onGrownups}
          />
        </Sheet>
      )}

      {settingsOpen && (
        <Sheet title="Settings" onClose={() => setSettingsOpen(false)} labelledBy="settings-title">
          <SettingsPanel onGrownups={onGrownups} />
        </Sheet>
      )}
    </main>
  );
}

function TopicPanel({
  topic,
  onStart,
  onGrownups,
}: {
  topic: TopicDef;
  onStart: (timed: boolean) => void;
  onGrownups: () => void;
}) {
  const { progress } = useProgress();
  const tp = topicProgress(progress, topic.id);
  const now = Date.now();
  const due = dueCount(progress.reviews, topic.id, now);
  const count = due;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-3xl" aria-hidden="true">
          {topic.emoji}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <LevelBadge level={tp.level} />
            <Stars value={tp.stars[tp.level]} />
          </div>
          <p className="mt-1 text-sm text-muted">{LEVEL_BLURBS[tp.level]}</p>
        </div>
      </div>

      <p className="text-muted">{topic.blurb}.</p>

      {due > 0 && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">
          {due} question{due === 1 ? "" : "s"} will come back in this round. That is how the game helps you remember.
        </div>
      )}

      <div className="rounded-xl border border-edge bg-panel/50 p-3 text-sm text-muted">
        <p>
          <strong className="text-text">{ROUND.size} questions</strong> at {LEVEL_LABELS[tp.level]} level.
        </p>
        <p className="mt-1">
          Stars at this level: {tp.stars[tp.level]} of 3. Questions ready to revisit: {count}.
        </p>
      </div>

      <button type="button" className="btn btn-primary w-full text-lg" onClick={() => onStart(progress.settings.timed)}>
        Play {ROUND.size} questions
      </button>
      <p className="text-center text-xs text-muted">
        The timer is {progress.settings.timed ? "on" : "off"}. You can change it in Settings or ask a grown-up.
      </p>
      <button type="button" className="w-full text-center text-sm font-semibold text-muted underline" onClick={onGrownups}>
        For grown-ups
      </button>
    </div>
  );
}

export function SettingsPanel({ onGrownups }: { onGrownups?: () => void }) {
  const { progress } = useProgress();
  const s = progress.settings;

  return (
    <div className="space-y-4">
      <Toggle
        label="Timer"
        help="Turn it off if you need more time. You still get points, just no speed bonus."
        checked={s.timed}
        onChange={(v) => progressStore.setSetting("timed", v)}
      />
      <Toggle
        label="Read aloud"
        help="Uses the voice built into this phone or browser. No internet voice service."
        checked={s.readAloud}
        onChange={(v) => progressStore.setSetting("readAloud", v)}
      />
      <Toggle
        label="High contrast"
        help="Stronger colours and black backgrounds."
        checked={s.highContrast}
        onChange={(v) => progressStore.setSetting("highContrast", v)}
      />
      {onGrownups && (
        <button type="button" className="btn btn-ghost w-full" onClick={onGrownups}>
          Open grown-ups page
        </button>
      )}
    </div>
  );
}

export function Toggle({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-14 items-start gap-3 rounded-xl border border-edge bg-panel/50 p-3">
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 shrink-0 accent-cyan"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block font-bold">{label}</span>
        <span className="block text-sm text-muted">{help}</span>
      </span>
    </label>
  );
}

