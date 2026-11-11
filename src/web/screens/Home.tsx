import { useEffect, useState, type FormEvent } from "react";
import { AVATARS, LIMITS, makeNickname } from "../../shared/constants";
import { nameSchema } from "../../shared/schemas";
import { game, useGame } from "../lib/store";
import { progressStore, totalStars, useProgress } from "../lib/progress";
import { Avatar, WaveMark } from "../components/ui";

export function Home({ onGrownups }: { onGrownups: () => void }) {
  const { status, error, notice } = useGame();
  const { progress } = useProgress();
  const [name, setName] = useState(progress.profile.nickname || makeNickname());
  const [avatar, setAvatar] = useState(progress.profile.avatar);
  const [nameError, setNameError] = useState<string | null>(null);
  const busy = status === "connecting";
  const returning = progress.profile.nickname !== "" && progress.totals.rounds > 0;
  const stars = totalStars(progress);

  useEffect(() => {
    if (!notice) return;
    // Clear a stale connection notice once the home screen has shown it.
    const id = setTimeout(() => game.dismissNotice(), 6000);
    return () => clearTimeout(id);
  }, [notice]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = nameSchema.safeParse(name);
    if (!parsed.success) {
      setNameError("Use 2 to 16 letters, numbers or spaces.");
      document.getElementById("nickname")?.focus();
      return;
    }
    setNameError(null);
    progressStore.setProfile(parsed.data, avatar);
    await game.start(parsed.data, avatar);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-8 px-4 py-10 lg:flex-row lg:items-center lg:gap-14">
      <div className="lg:w-1/2">
        <div className="flex items-center gap-3 text-cyan">
          <WaveMark size={42} />
          <span className="font-display text-xl font-bold">Brainwave Quest</span>
        </div>
        <h1 className="mt-6 text-5xl font-extrabold sm:text-6xl">
          Play.
          <br />
          Learn.
          <br />
          Remember.
        </h1>
        <p className="mt-5 max-w-md text-lg text-muted">
          Short rounds for Explorers in Primary 4 to 6. Pick a world, answer eight questions, and see why each answer is
          right. Your progress stays on this device.
        </p>
        {returning && (
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="rounded-full border border-edge bg-panel/70 px-3 py-1">⭐ {stars} stars</span>
            <span className="rounded-full border border-edge bg-panel/70 px-3 py-1">🪙 {progress.coins} coins</span>
            <span className="rounded-full border border-edge bg-panel/70 px-3 py-1">
              {progress.totals.rounds} {progress.totals.rounds === 1 ? "round" : "rounds"} played
            </span>
          </div>
        )}
        <details className="mt-6 max-w-md rounded-2xl border border-edge bg-panel/60 p-4">
          <summary className="cursor-pointer font-display text-lg font-bold">How it works</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
            <li>Choose English, Maths or Code and AI on the map.</li>
            <li>Each round has eight questions. Some are return visits to ones you missed.</li>
            <li>Read the short reason after each answer. It is the part that helps you remember.</li>
            <li>Stars show how well you did. Coins add up as you finish rounds.</li>
            <li>No chat, no strangers, no buying anything.</li>
          </ul>
        </details>
      </div>

      <section className="card w-full p-5 sm:p-6 lg:w-1/2">
        {(notice || error) && (
          <div role="alert" className="mb-5 rounded-xl border border-rose/50 bg-rose/10 p-3 text-sm">
            {error ?? notice}
          </div>
        )}

        <form onSubmit={(e) => void submit(e)} className="space-y-5">
          <div>
            <label htmlFor="nickname" className="mb-2 block font-display font-bold">
              Pick a nickname
            </label>
            <div className="flex gap-2">
              <input
                id="nickname"
                className="field"
                value={name}
                maxLength={LIMITS.nameMax}
                autoComplete="off"
                spellCheck={false}
                placeholder="Brave Lion 42"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "nickname-error" : "nickname-help"}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost shrink-0 !px-3"
                onClick={() => setName(makeNickname())}
                aria-label="Make a new nickname"
              >
                Shuffle
              </button>
            </div>
            {nameError ? (
              <p id="nickname-error" className="mt-2 text-sm text-rose">
                {nameError}
              </p>
            ) : (
              <p id="nickname-help" className="mt-2 text-xs text-muted">
                Do not use your real name. A nickname is enough.
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-2 font-display font-bold">Pick an animal</legend>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a, i) => (
                <button
                  type="button"
                  key={a.label}
                  aria-pressed={avatar === i}
                  aria-label={a.label}
                  onClick={() => setAvatar(i)}
                  className={`grid min-h-12 place-items-center rounded-2xl border p-1 ${
                    avatar === i ? "border-cyan bg-cyan/15" : "border-edge bg-panel/50"
                  }`}
                >
                  <Avatar index={i} size={38} />
                </button>
              ))}
            </div>
          </fieldset>

          <button className="btn btn-primary w-full text-lg" disabled={busy} type="submit">
            {busy ? "Opening the map..." : returning ? "Keep playing" : "Start playing"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Ages 9 to 11. No account needed. Nothing is sent to us except the answers to your questions, and those are not
          tied to a name.
        </p>
        <button type="button" className="mt-3 w-full text-center text-sm font-semibold text-muted underline" onClick={onGrownups}>
          For grown-ups
        </button>
      </section>
    </main>
  );
}

