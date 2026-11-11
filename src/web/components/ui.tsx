import { useEffect, useRef, useState, type ReactNode } from "react";
import { AVATARS, LEVEL_LABELS, type Level } from "../../shared/constants";
import { AVATAR_IMAGES } from "../lib/avatars";
import { REPORT_REASON_LABELS, type Report } from "../../shared/schemas";
import { game, useGame } from "../lib/store";
import { sendReport } from "../lib/report";

export function WaveMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M4 34h10l5-16 8 30 7-24 5 10h21"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Avatar({ index, size = 44 }: { index: number; size?: number }) {
  const a = AVATARS[index] ?? AVATARS[0];
  const image = AVATAR_IMAGES[index] ?? AVATAR_IMAGES[0];
  return (
    <span
      role="img"
      aria-label={a.label}
      className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-edge bg-raised"
      style={{ width: size, height: size }}
    >
      <img src={image} alt={a.label} width={size} height={size} className="h-full w-full object-cover" draggable={false} />
    </span>
  );
}

export function Stars({ value, size = "text-lg" }: { value: number; size?: string }) {
  return (
    <span className={`stars ${size}`} aria-label={`${value} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span key={i} data-off={i >= value ? "true" : undefined} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

const LEVEL_CLASS: Record<Level, string> = {
  bronze: "level-badge level-bronze",
  silver: "level-badge level-silver",
  gold: "level-badge level-gold",
};

export function LevelBadge({ level, className = "" }: { level: Level; className?: string }) {
  return <span className={`${LEVEL_CLASS[level]} ${className}`}>{LEVEL_LABELS[level]}</span>;
}

const BAR_COUNT = 32;
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const a = Math.sin(i * 0.62) * 0.3 + Math.sin(i * 1.9 + 1) * 0.14;
  return Math.max(0.22, Math.min(1, 0.6 + a));
});

export function WaveTimer({ fraction, urgent, label }: { fraction: number; urgent: boolean; label: string }) {
  const f = Math.max(0, Math.min(1, fraction));
  const lit = Math.ceil(f * BAR_COUNT);
  return (
    <div role="timer" aria-label={label} className="wave" data-urgent={urgent}>
      {BAR_HEIGHTS.map((h, i) => (
        <span key={i} style={{ height: `${h * 100}%`, opacity: i < lit ? 1 : 0.14 }} />
      ))}
    </div>
  );
}

/** Re-renders while active, for countdowns driven by the server clock. */
export function useTick(active: boolean, everyMs = 200): number {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setN((n) => n + 1), everyMs);
    return () => clearInterval(id);
  }, [active, everyMs]);
  return game.now();
}

export function Toasts() {
  const { toasts } = useGame();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className="pop-in rounded-full border border-edge bg-raised px-4 py-2 text-sm shadow-lg">
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function ConnectionBadge() {
  const { status } = useGame();
  if (status !== "reconnecting") return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[70] bg-gold px-4 py-2 text-center text-sm font-bold text-[#2a1c00]">
      Connection lost. Reconnecting. Your round is held for a short time.
    </div>
  );
}

export function Sheet({
  title,
  onClose,
  children,
  labelledBy = "sheet-title",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={labelledBy} className="text-2xl font-extrabold">
            {title}
          </h2>
          <button type="button" className="btn btn-ghost !min-h-10 !px-3 !py-1 text-sm" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ReportDialog({ code, onClose }: { code: string; onClose: () => void }) {
  const [reason, setReason] = useState<Report["reason"]>("wrong_answer");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit() {
    setState("sending");
    const res = await sendReport({ code, reason, note: note.trim() || undefined });
    if (res.ok) {
      setState("sent");
      return;
    }
    setError(res.error ?? "The report did not send.");
    setState("error");
  }

  return (
    <Sheet title="Report a question" onClose={onClose} labelledBy="report-title">
      {state === "sent" ? (
        <div className="space-y-4">
          <p className="text-lg">Thank you. A grown-up will check this question.</p>
          <button className="btn btn-primary w-full" onClick={onClose}>
            Back to the game
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted">Question {code}. This goes to the teacher review queue.</p>
          <fieldset className="space-y-2">
            <legend className="mb-2 font-bold">What is wrong?</legend>
            {(Object.keys(REPORT_REASON_LABELS) as Array<keyof typeof REPORT_REASON_LABELS>).map((key) => (
              <label key={key} className="flex min-h-11 items-center gap-3 rounded-xl border border-edge px-3 py-2">
                <input
                  type="radio"
                  name="report-reason"
                  value={key}
                  checked={reason === key}
                  onChange={() => setReason(key)}
                  className="h-5 w-5 accent-cyan"
                />
                <span>{REPORT_REASON_LABELS[key]}</span>
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor="report-note" className="mb-2 block font-bold">
              Anything else? Optional
            </label>
            <textarea
              id="report-note"
              className="field min-h-24 py-3"
              maxLength={400}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell us what you noticed"
            />
          </div>
          {state === "error" && (
            <p role="alert" className="text-sm text-rose">
              {error}
            </p>
          )}
          <button className="btn btn-primary w-full" onClick={() => void submit()} disabled={state === "sending"}>
            {state === "sending" ? "Sending..." : "Send report"}
          </button>
          <p className="text-xs text-muted">No name, device or location is sent with this report.</p>
        </div>
      )}
    </Sheet>
  );
}