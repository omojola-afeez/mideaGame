import { useEffect, useState, type FormEvent } from "react";
import { AVATARS, BANDS, LIMITS, makeNickname, type BandId, type SubjectId } from "../../shared/constants";
import { nameSchema } from "../../shared/schemas";
import { game, useGame } from "../lib/store";
import { progressStore, totalStars, useProgress } from "../lib/progress";
import { Avatar } from "../components/ui";
import heroBoy from "../assets/hero/boy.png";
import heroTablet from "../assets/hero/tablet.png";

/** Subjects featured on the landing page, each launching the real game. */
const FEATURED: Array<{ id: SubjectId; label: string; tagline: string; emoji: string; tone: string }> = [
  { id: "english", label: "Animal stories", tagline: "Read and answer.", emoji: "🦁", tone: "from-gold/20 to-violet/25" },
  { id: "mathematics", label: "Number nook", tagline: "Add, multiply and measure.", emoji: "🐘", tone: "from-cyan/20 to-violet/25" },
  { id: "science", label: "Body bay", tagline: "Explore how the world works.", emoji: "🐢", tone: "from-mint/20 to-cyan/20" },
];

export function Home({
  onGrownups,
  offline = false,
  onOfflineStart,
}: {
  onGrownups: () => void;
  offline?: boolean;
  onOfflineStart?: () => void;
}) {
  const { status, error, notice } = useGame();
  const { progress } = useProgress();
  const [name, setName] = useState(progress.profile.nickname || makeNickname());
  const [avatar, setAvatar] = useState(progress.profile.avatar);
  const [band, setBand] = useState<BandId>(progress.profile.band);
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

  function jumpToSignup(subject?: SubjectId) {
    if (subject) {
      try {
        sessionStorage.setItem("brainwave-preferred-subject", subject);
      } catch {
        /* storage is optional */
      }
    }
    // Instant scroll: smooth behaviour fights the page's clip-edge container.
    document.getElementById("signup")?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  async function startGame() {
    const parsed = nameSchema.safeParse(name);
    if (!parsed.success) {
      setNameError("Use 2 to 16 letters, numbers or spaces.");
      document.getElementById("nickname")?.focus();
      return;
    }
    setNameError(null);
    progressStore.setBand(band);
    progressStore.setProfile(parsed.data, avatar);
    if (offline) {
      // No connection? Skip matchmaking and open the offline map.
      onOfflineStart?.();
      return;
    }
    await game.start(parsed.data, avatar);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    await startGame();
  }

  return (
    <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-clip">
      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-edge/70 bg-ink/60 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden="true" role="presentation">
            <defs>
              <linearGradient id="bwave-logo" x1="0" y1="0" x2="64" y2="64">
                <stop stopColor="#38d9f5" />
                <stop offset="0.5" stopColor="#67b7ff" />
                <stop offset="1" stopColor="#a98bff" />
              </linearGradient>
            </defs>
            <path
              d="M22 24a11 11 0 0 1 10-10 11 11 0 0 1 8 4 11 11 0 0 1 8-4 11 11 0 0 1 10 10c3 2 4 6 2 10 2 3 2 9-2 12 1 5-3 9-8 9-2 3-6 5-10 5s-8-2-10-5c-5 0-9-4-8-9-4-3-4-9-2-12-2-4-1-8 2-10Z"
              fill="url(#bwave-logo)"
              stroke="#07122b"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M24 34h5l3-8 4 12 3-7h6" stroke="#07122b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="font-display text-lg font-extrabold leading-tight sm:text-xl">
            Brainwave
            <br className="sm:hidden" /> Quest
          </span>
        </div>
        <span className="rounded-full border border-gold/50 bg-gold/10 px-3 py-1 font-display text-xs font-bold text-gold sm:text-sm">
          Ages 4–12
        </span>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="relative z-10 text-center lg:text-left">
            <p className="font-display text-xs font-extrabold uppercase tracking-[0.22em] text-cyan sm:text-sm">
              FREE · PRIMARY 1 TO 6
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[0.95] sm:text-6xl xl:text-7xl">
              Ready to
              <br />
              <span className="bg-gradient-to-r from-gold via-cyan to-violet bg-clip-text text-transparent">train your brain?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg text-muted lg:mx-0">
              Play fun games, solve exciting challenges and boost your mind!
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button type="button" className="btn btn-gold w-full text-lg sm:w-auto" onClick={() => jumpToSignup()}>
                ▶&nbsp; Play now
              </button>
              <a className="btn btn-ghost w-full text-lg sm:w-auto" href="#how-it-works">
                How it works →
              </a>
            </div>
            {returning && (
              <p className="mt-5 text-sm text-muted">
                Welcome back, <strong className="text-text">{progress.profile.nickname}</strong>. {stars} ⭐ so far.
              </p>
            )}
          </div>

          <div className="relative mx-auto h-72 w-full max-w-md lg:h-[30rem] lg:max-w-none">
            {/* Floating trophy/tablet artwork */}
            <img
              src={heroTablet}
              alt="Tablet showing animal pictures and a gold trophy"
              className="float-up absolute right-0 top-0 z-10 h-44 w-auto drop-shadow-[0_0_30px_rgba(56,217,245,0.45)] sm:h-56 lg:h-64"
              draggable={false}
            />
            <img
              src={heroBoy}
              alt="Nigerian child playing Brainwave Quest on a game controller"
              className="absolute left-0 top-8 z-0 h-full w-[82%] object-cover object-left-top lg:w-full"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* Challenge section */}
      <section id="challenge" className="relative px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-extrabold sm:text-4xl">
            Choose your <span className="text-gold">challenge</span>
          </h2>
          <p className="mt-2 text-center text-muted">Fun games for curious minds of all ages.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {FEATURED.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => jumpToSignup(card.id)}
                className={`group flex flex-col items-center gap-3 rounded-2xl border border-edge bg-gradient-to-br ${card.tone} p-5 text-center transition hover:-translate-y-1 hover:border-cyan/70`}
                aria-label={`Play ${card.label}`}
              >
                <span className="text-6xl" aria-hidden="true">{card.emoji}</span>
                <span className="font-display text-2xl font-extrabold">{card.label}</span>
                <span className="text-sm text-muted">{card.tagline}</span>
                <span className="btn btn-gold !min-h-11 !px-4 text-sm">Play now →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Learn / Play / Improve strip */}
      <section id="how-it-works" className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-edge bg-gradient-to-r from-cyan/10 via-violet/10 to-mint/10 divide-edge divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-4 p-4 sm:p-6">
            <span className="text-4xl" aria-hidden="true">🎓</span>
            <span>
              <strong className="block font-display text-lg">Learn</strong>
              <span className="text-sm text-muted">Short rounds with the real reason why.</span>
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 sm:p-6">
            <span className="text-4xl" aria-hidden="true">🎮</span>
            <span>
              <strong className="block font-display text-lg">Play</strong>
              <span className="text-sm text-muted">Earn stars, coins and day streaks.</span>
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 sm:p-6">
            <span className="text-4xl" aria-hidden="true">📈</span>
            <span>
              <strong className="block font-display text-lg">Improve</strong>
              <span className="text-sm text-muted">Missed questions come back after 1, 3 and 7 days.</span>
            </span>
          </div>
        </div>
      </section>

      {/* Sign up card */}
      <section id="signup" className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div className="card w-full p-5 sm:p-6">
            <h2 className="text-center font-display text-2xl font-extrabold">Pick your explorer</h2>
            <p className="mt-1 text-center text-sm text-muted">Choose your age, your name and your animal.</p>

            {(notice || error) && (
              <div role="alert" className="mt-4 rounded-xl border border-rose/50 bg-rose/10 p-3 text-sm">
                {error ?? notice}
              </div>
            )}

            <form onSubmit={(e) => void submit(e)} className="mt-5 space-y-5">
              <fieldset>
                <legend className="mb-2 block font-display font-bold">How old are you?</legend>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Pick your age group">
                  {BANDS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      role="radio"
                      aria-checked={band === b.id}
                      onClick={() => setBand(b.id)}
                      className={`rounded-2xl border p-3 text-center ${
                        band === b.id ? "border-cyan bg-cyan/15" : "border-edge bg-panel/50"
                      }`}
                    >
                      <span className="block font-display text-lg font-extrabold leading-tight">{b.ages}</span>
                      <span className="mt-1 block text-xs text-muted">{b.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">Your questions match your age group. Grown-ups can change this later.</p>
              </fieldset>

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
                  <button type="button" className="btn btn-ghost shrink-0 !px-3" onClick={() => setName(makeNickname())} aria-label="Shuffle">
                    Shuffle
                  </button>
                </div>
                {nameError ? (
                  <p id="nickname-error" className="mt-2 text-sm text-rose">{nameError}</p>
                ) : (
                  <p id="nickname-help" className="mt-2 text-xs text-muted">Do not use your real name. A nickname is enough.</p>
                )}
              </div>

              <fieldset>
                <legend className="mb-2 font-display font-bold">Pick an animal</legend>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
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
                      <Avatar index={i} size={40} />
                    </button>
                  ))}
                </div>
              </fieldset>

              <button className="btn btn-primary w-full text-lg" disabled={busy} type="submit">
                {busy ? "Opening the map..." : offline ? "Start playing offline" : returning ? "Keep playing" : "Start playing"}
              </button>
              {offline && (
                <p className="rounded-xl border border-edge bg-panel/50 p-3 text-center text-xs text-muted">
                  You are offline. Everything still works — your progress is saved on this device.
                </p>
              )}
            </form>

            <p className="mt-4 text-center text-xs text-muted">
              Ages 4 to 12. No account needed. Nothing is sent to us except the answers to your questions, and those are not tied to a name.
            </p>
            <button type="button" className="mt-3 w-full text-center text-sm font-semibold text-muted underline" onClick={onGrownups}>
              For grown-ups
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-edge/70 bg-ink/80 px-4 py-5 text-center text-xs text-muted sm:px-6">
        <p className="font-display text-sm font-bold text-text">Brainwave Quest · Play. Learn. Grow.</p>
        <p className="mt-1">© 2025 Brainwave Quest. All rights reserved.</p>
      </footer>
    </main>
  );
}
