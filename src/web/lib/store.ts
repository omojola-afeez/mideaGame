import { useSyncExternalStore } from "react";
import { Client, type Room } from "@colyseus/sdk";
import { MSG, ROOM_TYPE } from "../../shared/constants";
import type { RoundPartInput } from "../../shared/daily";
import { QuestState } from "../../shared/state";
import { progressStore } from "./progress";
import { friendlyError, REJECT_MESSAGES } from "./errors";

export type Snapshot = ReturnType<QuestState["toJSON"]>;
export type Status = "idle" | "connecting" | "connected" | "reconnecting" | "lost";

const RESUME_KEY = "brainwave-quest-resume-v1";

interface ResumeInfo {
  token: string;
  roomId: string;
}

function loadResume(): ResumeInfo | null {
  try {
    const raw = sessionStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<ResumeInfo>;
    if (typeof data.token !== "string" || typeof data.roomId !== "string") return null;
    return { token: data.token, roomId: data.roomId };
  } catch {
    return null;
  }
}

function saveResume(info: ResumeInfo): void {
  try {
    sessionStorage.setItem(RESUME_KEY, JSON.stringify(info));
  } catch {
    /* storage is optional */
  }
}

function clearResume(): void {
  try {
    sessionStorage.removeItem(RESUME_KEY);
  } catch {
    /* storage is optional */
  }
}

export interface Toast {
  id: number;
  text: string;
}

export interface View {
  status: Status;
  snap: Snapshot | null;
  /** Option picked locally on the current question, so the UI answers instantly. */
  pick: { q: number; choice: number } | null;
  acked: boolean;
  error: string | null;
  toasts: Toast[];
  notice: string | null;
  /** Milliseconds to add to Date.now() to get server time. */
  offset: number;
}

const initial: View = {
  status: "idle",
  snap: null,
  pick: null,
  acked: false,
  error: null,
  toasts: [],
  notice: null,
  offset: 0,
};

function serverUrl(): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  if (env?.VITE_SERVER_URL) return env.VITE_SERVER_URL;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const dev = location.port === "5173";
  return dev ? `${proto}://${location.hostname}:2567` : `${proto}://${location.host}`;
}

class GameStore {
  private view: View = initial;
  private listeners = new Set<() => void>();
  private room: Room<any, QuestState> | null = null;
  private client: Client | null = null;
  private toastId = 0;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private samples: Array<{ rtt: number; offset: number }> = [];
  private leaving = false;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getView = (): View => this.view;

  private set(patch: Partial<View>): void {
    this.view = { ...this.view, ...patch };
    this.listeners.forEach((l) => l());
  }

  private getClient(): Client {
    this.client ??= new Client(serverUrl());
    return this.client;
  }

  /** Server time as the client best estimates it. */
  now = (): number => Date.now() + this.view.offset;

  toast(text: string): void {
    const id = ++this.toastId;
    this.set({ toasts: [...this.view.toasts, { id, text }] });
    setTimeout(() => this.set({ toasts: this.view.toasts.filter((t) => t.id !== id) }), 3500);
  }

  async start(name: string, avatar: number): Promise<boolean> {
    return this.connect(async () =>
      this.getClient().create(ROOM_TYPE, { name, avatar }, QuestState),
    );
  }

  /** Called on page load. Tries the stored reconnection token first. */
  async resume(): Promise<boolean> {
    const info = loadResume();
    if (!info) return false;
    return this.connect(async () => this.getClient().reconnect<QuestState>(info.token, QuestState), true);
  }

  private async connect(open: () => Promise<Room<any, QuestState>>, silent = false): Promise<boolean> {
    this.leaving = false;
    this.set({ status: "connecting", error: null, notice: null });
    try {
      const room = await open();
      this.attach(room);
      return true;
    } catch (err) {
      clearResume();
      this.set({ status: "idle", error: silent ? null : friendlyError(err) });
      return false;
    }
  }

  private attach(room: Room<any, QuestState>): void {
    this.room = room;
    this.samples = [];
    saveResume({ token: room.reconnectionToken, roomId: room.roomId });

    const refresh = (): void => {
      if (!room.state || !room.state.phase) return;
      const snap = room.state.toJSON() as Snapshot;
      const patch: Partial<View> = { snap };
      if (this.view.pick && snap.question.index !== this.view.pick.q) {
        patch.pick = null;
        patch.acked = false;
      }
      this.set({ ...patch, status: "connected" });
    };
    room.onStateChange(refresh);
    refresh();

    room.onMessage(MSG.answerAck, () => this.set({ acked: true }));
    room.onMessage(MSG.rejected, (m: { type: string; reason: string }) => {
      if (m.type === MSG.answer) this.set({ pick: null, acked: false });
      this.toast(REJECT_MESSAGES[m.reason] ?? "That did not work. Try again.");
    });
    room.onMessage(MSG.syncReply, (m: { t0: number; serverNow: number }) => {
      const t1 = Date.now();
      const rtt = t1 - m.t0;
      const offset = m.serverNow + rtt / 2 - t1;
      this.samples.push({ rtt, offset });
      if (this.samples.length > 7) this.samples.shift();
      const best = [...this.samples].sort((a, b) => a.rtt - b.rtt)[0];
      if (best) this.set({ offset: best.offset });
    });
    this.startSync(room);

    room.onDrop(() => {
      if (!this.leaving) this.set({ status: "reconnecting" });
    });
    room.onReconnect(() => {
      saveResume({ token: room.reconnectionToken, roomId: room.roomId });
      this.set({ status: "connected" });
      this.sync();
    });
    room.onLeave((code) => {
      this.stopSync();
      if (this.room !== room) return;
      this.room = null;
      if (this.leaving) return;
      clearResume();
      this.set({
        status: "lost",
        snap: null,
        notice:
          code === 4000 || code === 1000
            ? "You left the game."
            : "The connection was lost. Start again or check your network.",
      });
    });
    room.onError(() => {
      this.toast("Connection problem. Trying to recover.");
    });
  }

  private startSync(room: Room<any, QuestState>): void {
    this.stopSync();
    this.sync();
    let burst = 0;
    const fast = setInterval(() => {
      this.sync();
      if (++burst >= 4) clearInterval(fast);
    }, 400);
    this.syncTimer = setInterval(() => {
      if (this.room === room) this.sync();
    }, 20_000);
  }

  private stopSync(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = null;
  }

  private sync(): void {
    try {
      this.room?.send(MSG.sync, { t0: Date.now() });
    } catch {
      /* socket may be closed mid-reconnect */
    }
  }

  private send(type: string, payload?: unknown): void {
    try {
      this.room?.send(type, payload);
    } catch {
      this.toast("Not connected right now.");
    }
  }

  startRound(parts: RoundPartInput[], timed: boolean): void {
    const band = progressStore.get().progress.profile.band;
    this.set({ pick: null, acked: false });
    this.send(MSG.startRound, { parts, timed, band });
  }

  answer(choice: number): void {
    const snap = this.view.snap;
    if (!snap || snap.phase !== "QUESTION" || this.view.pick) return;
    const q = snap.question.index;
    this.set({ pick: { q, choice }, acked: false });
    this.send(MSG.answer, { q, choice });
  }

  next(): void {
    this.set({ pick: null, acked: false });
    this.send(MSG.next, {});
  }

  async leave(): Promise<void> {
    const room = this.room;
    this.leaving = true;
    this.stopSync();
    clearResume();
    this.room = null;
    this.set({ ...initial });
    if (room) {
      try {
        await Promise.race([room.leave(true), new Promise((r) => setTimeout(r, 800))]);
      } catch {
        /* already closed */
      }
    }
  }

  dismissNotice(): void {
    this.set({ notice: null, error: null });
  }
}

export const game = new GameStore();

export function useGame(): View {
  return useSyncExternalStore(game.subscribe, game.getView, game.getView);
}