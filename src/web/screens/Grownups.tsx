import { useState } from "react";
import { BANDS, GAME_NAME, ROUND } from "../../shared/constants";
import { useCatalog } from "../lib/catalog";
import { progressStore, totalStars, useProgress } from "../lib/progress";
import { game } from "../lib/store";
import { SettingsPanel } from "./Map";
import { WaveMark } from "../components/ui";

export function Grownups({ onBack, onHome }: { onBack: () => void; onHome: () => void }) {
  const { progress } = useProgress();
  const { catalog } = useCatalog();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const total = catalog?.bank.total ?? null;
  const draft = catalog?.bank.byStatus.draft ?? null;

  function deleteData() {
    progressStore.reset();
    void game.leave();
    setDeleted(true);
    setConfirmDelete(false);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <header className="flex items-center gap-3">
        <button type="button" className="btn btn-ghost !min-h-10 !px-3 text-sm" onClick={onBack}>
          Back
        </button>
        <div className="flex flex-1 items-center gap-2 text-cyan">
          <WaveMark size={28} />
          <span className="font-display font-bold">For grown-ups</span>
        </div>
      </header>

      <h1 className="mt-8 text-4xl font-extrabold">A plain guide to {GAME_NAME}</h1>
      <p className="mt-3 text-lg text-muted">
        {GAME_NAME} is for Nigerian children aged 4 to 12. At sign up the child picks an age band, and every question they
        see is written for that band. They pick English, Maths, Code and AI and more. It is free, it has no accounts yet, and
        it does not talk to strangers.
      </p>

      <section className="card mt-6 space-y-3 p-5">
        <h2 className="font-display text-2xl font-extrabold">What your child does</h2>
        <p className="text-muted">
          Your child picks their age band, a nickname and an animal, then chooses English, Maths, Code and AI, Science,
          Home Economics, Social Studies or Arabic. A round has {ROUND.size} questions. After every answer the game shows
          the right answer and a one line reason. Missed questions return after 1 day, then 3 days, then 7 days.
        </p>
        <p className="text-muted">
          The Daily mix has 10 questions from all three subjects. A new set is offered each day. There is no chat, no
          friend requests, no photos, no advertising and nothing to buy.
        </p>
      </section>

      <section className="card mt-4 space-y-3 p-5">
        <h2 className="font-display text-2xl font-extrabold">Content is draft until a teacher reviews it</h2>
        <p className="text-muted">
          Every question is written as a draft and must be checked by a second teacher before it is marked reviewed.
          The game does not call an AI service while a child plays. Questions can be flagged with the Report a problem
          button. Reports go to a queue for the owner.
        </p>
        {total !== null && (
          <p className="rounded-xl border border-edge bg-panel/60 p-3 text-sm">
            Question bank: <strong>{total}</strong> questions. Draft: <strong>{draft ?? 0}</strong>.
          </p>
        )}
        <p className="text-sm text-muted">
          The subject list is based on the Nigerian curriculum. It still needs a check against the current NERDC
          curriculum before a wider launch.
        </p>
      </section>

      <section className="card mt-4 space-y-3 p-5">
        <h2 className="font-display text-2xl font-extrabold">What is stored</h2>
        <p className="text-muted">
          The nickname, animal, stars, coins, level and review dates are stored only in this browser, on this device.
          There is no account, no email, no real name, no school and no location. The server sees the question codes and
          the answers during a round, but not a name that identifies your child.
        </p>
        <p className="text-muted">
          The server keeps counts for health checks. Reports contain the question code and what was wrong, never the
          child&apos;s nickname.
        </p>
        <div className="rounded-xl border border-edge bg-panel/60 p-3 text-sm">
          <p>
            Stars: <strong>{totalStars(progress)}</strong>. Coins: <strong>{progress.coins}</strong>. Rounds played:{" "}
            <strong>{progress.totals.rounds}</strong>. Questions answered: <strong>{progress.totals.answered}</strong>.
          </p>
        </div>
        {deleted ? (
          <p role="status" className="rounded-xl border border-mint/50 bg-mint/10 p-3 text-sm">
            The data on this device has been deleted. You can close the page.
          </p>
        ) : confirmDelete ? (
          <div className="rounded-xl border border-rose/50 bg-rose/10 p-3">
            <p className="text-sm">This removes the nickname, progress and review dates from this browser. It cannot be undone.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn btn-danger flex-1" onClick={deleteData}>
                Yes, delete it
              </button>
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            Delete my child&apos;s data on this device
          </button>
        )}
      </section>

      <section className="card mt-4 space-y-3 p-5">
        <h2 className="font-display text-2xl font-extrabold">Controls</h2>
        <SettingsPanel />
        <p className="text-sm text-muted">
          The timer can be turned off. Read aloud uses the voice already built into the phone or browser. High contrast
          makes the screen easier to see.
        </p>
      </section>

      <section className="card mt-4 space-y-3 p-5">
        <h2 className="font-display text-2xl font-extrabold">Privacy notice, draft</h2>
        <p className="text-muted">
          We collect almost nothing. A child uses a nickname, not a real name. Progress stays on the device in this
          phase. We do not sell data, show ads, use third party trackers or track location. A parent or guardian can
          delete the data from this page. When accounts arrive in phase 2, a parent email and consent record will be
          added, with a download and delete option.
        </p>
        <p className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">
          This draft is not legal advice. A Nigerian lawyer must review the privacy notice and the consent flow before
          a public launch, as required by the Nigeria Data Protection Act 2023.
        </p>
      </section>

      <section className="card mt-4 space-y-3 p-5">
        <h2 className="font-display text-2xl font-extrabold">Cost and hosting</h2>
        <p className="text-muted">
          The pilot targets free hosting. The free server sleeps when nobody is playing, so the first child may wait
          about a minute. The database is not connected in phase 1. Before a school day or a real launch, the owner
          needs to approve a paid always on server and backups. Nothing is charged without that approval.
        </p>
      </section>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn btn-ghost flex-1" onClick={onBack}>
          Back to the game
        </button>
        <button type="button" className="btn btn-primary flex-1" onClick={onHome}>
          Go to the start screen
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Phase 1 pilot. Age bands: {BANDS.map((b) => `${b.label} (${b.ages})`).join(", ")}. No accounts, no chat, no
        advertising, no purchases.
      </p>
    </main>
  );
}