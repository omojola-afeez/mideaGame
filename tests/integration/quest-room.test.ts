import { describe, expect, it } from "vitest";
import { startServer } from "../../src/server/app";
import { Client } from "@colyseus/sdk";
import type { QuestState } from "../../src/shared/state";

interface QuestRoomLike {
  state: QuestState;
  send: (type: string, payload?: unknown) => void;
  onMessage: (type: string, callback: (payload: unknown) => void) => () => void;
  leave: (options?: unknown) => Promise<void> | void;
}

function waitFor(predicate: () => boolean, timeoutMs: number, label = "wait"): Promise<void> {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - started > timeoutMs) return reject(new Error(`${label} timed out`));
      setTimeout(tick, 25);
    };
    tick();
  });
}

describe("QuestRoom round flow", () => {
  it("starts a round, accepts a valid answer and rejects forged answers", async () => {
    const running = await startServer({ port: 0, host: "127.0.0.1" });
    const client = new Client({ hostname: "127.0.0.1", secure: false, port: running.port });
    const room = (await client.joinOrCreate("quest", { name: "Ada", avatar: 0 })) as unknown as QuestRoomLike;

    const rejections: Array<{ type: string; reason?: string }> = [];
    const acks: Array<{ q: number }> = [];
    room.onMessage("rejected", (payload) => rejections.push(payload as { type: string; reason?: string }));
    room.onMessage("answer_ack", (payload) => acks.push(payload as { q: number }));

    room.send("start_round", {
      parts: [{ subject: "mathematics", topic: "number", level: "bronze", count: 8, reviewCodes: [], excludeCodes: [] }],
      timed: true,
      band: "10-12",
    });

    await waitFor(() => room.state.phase === "QUESTION", 10_000, "phase");
    expect(room.state.phase).toBe("QUESTION");
    expect(room.state.question.total).toBe(8);
    expect(room.state.question.options.length).toBe(4);

    const current = room.state.question.index;
    room.send("answer", { q: current + 1, choice: 0 });
    await waitFor(() => rejections.length > 0, 5_000, "rejections");
    expect(rejections[0]?.type).toBe("answer");
    expect(rejections[0]?.reason).toBe("STALE_QUESTION");

    room.send("answer", { q: current, choice: 0 });
    await waitFor(() => acks.length > 0, 10_000, "acks");
    expect(acks[0]?.q).toBe(current);
    expect(room.state.phase).toBe("REVEAL");
    expect(room.state.question.explanation.length).toBeGreaterThan(0);
    expect(room.state.results.length).toBe(1);

    room.send("answer", { q: current, choice: 0 });
    await waitFor(() => rejections.length > 1, 5_000, "rejects-after");
    expect(rejections[1]?.reason).toBe("WRONG_PHASE");

    await room.leave();
    await running.stop();
  }, 90_000);
});
