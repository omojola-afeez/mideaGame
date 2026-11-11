import { existsSync } from "node:fs";
import path from "node:path";
import type { Server as HttpServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import express from "express";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { BANDS, ROUND, ROOM_TYPE, SUBJECTS, TOPICS, bandById } from "../shared/constants";
import { reportSchema } from "../shared/schemas";
import { log } from "./log";
import { counters, snapshot } from "./metrics";
import { matchmakeLimiter, reportLimiter } from "./runtime";
import { QuestRoom } from "./rooms/QuestRoom";
import { bank, bankSummary } from "./data/bank";
import { addReport, clearReports, listReports } from "./reports";

export interface StartOptions {
  port: number;
  staticDir?: string;
  /** Extra allowed origins for WebSocket and matchmaking requests, besides the host itself. */
  allowedOrigins?: string[];
  host?: string;
}

export interface Running {
  server: Server;
  port: number;
  stop: () => Promise<void>;
}

function clientIp(req: IncomingMessage): string {
  const fwd = req.headers["x-forwarded-for"];
  const first = typeof fwd === "string" ? fwd.split(",")[0]?.trim() : undefined;
  return first || req.socket.remoteAddress || "unknown";
}

/** Browsers always send Origin on cross-site requests. Same-host and listed origins pass. */
export function originAllowed(origin: string | undefined, host: string | undefined, allowed: string[]): boolean {
  if (!origin) return true; // non-browser clients (tests, health probes) send none
  if (allowed.includes(origin)) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function tokenMatches(given: string | undefined, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function startServer(opts: StartOptions): Promise<Running> {
  const allowed = opts.allowedOrigins ?? [];
  let shuttingDown = false;

  const transport = new WebSocketTransport({
    pingInterval: 5000,
    pingMaxRetries: 3,
    maxPayload: 4 * 1024,
    beforeUpgrade: (request) => {
      const origin = request.headers.get("origin") ?? undefined;
      const host = request.headers.get("host") ?? undefined;
      if (!originAllowed(origin, host, allowed)) {
        log("warn", "origin_rejected");
        return new Response("Forbidden", { status: 403 });
      }
    },
  });

  const server = new Server({
    transport,
    greet: false,
    express: (app) => {
      app.disable("x-powered-by");
      app.use(express.json({ limit: "4kb" }));

      app.get("/healthz", (_req, res) => {
        res.json({ ok: true });
      });
      app.get("/readyz", (_req, res) => {
        res.json({ ok: true, ready: !shuttingDown });
      });
      app.get("/api/metrics", (_req, res) => {
        res.setHeader("Cache-Control", "no-store");
        res.json(snapshot());
      });

      /** Public catalog. It has counts and labels only, never questions or answers. */
      app.get("/api/catalog", (req, res) => {
        res.setHeader("Cache-Control", "public, max-age=300");
        const bandParam = typeof req.query.band === "string" ? req.query.band : "10-12";
        const band = bandById(bandParam)?.id ?? "10-12";
        res.json({
          band,
          bands: BANDS.map((b) => ({ id: b.id, label: b.label, ages: b.ages, classes: b.classes })),
          roundSize: ROUND.size,
          subjects: SUBJECTS.map((s) => ({
            id: s.id,
            label: s.label,
            short: s.short,
            topics: TOPICS.filter((t) => t.subjectId === s.id).map((t) => ({
              id: t.id,
              label: t.label,
              count: bank.stats.byBandTopic[`${band}:${t.id}`] ?? 0,
            })),
          })),
          bank: bankSummary(),
        });
      });

      app.post("/api/reports", (req, res) => {
        const parsed = reportSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: "bad_report" });
          return;
        }
        if (!bank.byCode.has(parsed.data.code)) {
          res.status(404).json({ error: "unknown_question" });
          return;
        }
        if (!reportLimiter.allow(clientIp(req))) {
          counters.rateLimited += 1;
          res.status(429).json({ error: "rate_limited" });
          return;
        }
        const entry = addReport(parsed.data);
        res.status(201).json({ ok: true, id: entry.id });
      });

      /** The owner reads the queue with a token. Without REPORT_TOKEN the route does not exist. */
      app.get("/api/reports", (req, res) => {
        const expected = process.env.REPORT_TOKEN;
        if (!expected || !tokenMatches(req.get("x-report-token"), expected)) {
          res.status(404).json({ error: "not_found" });
          return;
        }
        const rows = listReports();
        if (req.query.clear === "1") clearReports();
        res.setHeader("Cache-Control", "no-store");
        res.json({ reports: rows });
      });

      const dir = opts.staticDir;
      if (dir && existsSync(path.join(dir, "index.html"))) {
        app.use(
          express.static(dir, {
            index: "index.html",
            setHeaders: (res, file) => {
              if (file.includes(`${path.sep}assets${path.sep}`)) {
                res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
              } else {
                res.setHeader("Cache-Control", "no-cache");
              }
            },
          }),
        );
        app.get(/^\/(?!matchmake|api|healthz|readyz).*/, (_req, res) => {
          res.setHeader("Cache-Control", "no-cache");
          res.sendFile(path.join(dir, "index.html"));
        });
      }
    },
  });

  server.define(ROOM_TYPE, QuestRoom);

  await server.listen(opts.port, opts.host);

  // Colyseus answers matchmaking routes before Express runs, so the checks sit in front of both.
  const http = (transport as unknown as { server: HttpServer }).server;
  const downstream = http.listeners("request") as Array<(req: IncomingMessage, res: ServerResponse) => void>;
  http.removeAllListeners("request");
  http.on("request", (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Robots-Tag", "noindex");
    res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws: wss:; media-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    if (req.url?.startsWith("/matchmake")) {
      if (!originAllowed(req.headers.origin, req.headers.host, allowed)) {
        res.writeHead(403, { "content-type": "application/json" }).end('{"error":"forbidden"}');
        return;
      }
      if (!matchmakeLimiter.allow(clientIp(req))) {
        counters.rateLimited += 1;
        res.writeHead(429, { "content-type": "application/json", "retry-after": "30" }).end('{"error":"rate_limited"}');
        return;
      }
    }
    for (const listener of downstream) listener.call(http, req, res);
  });
  const address = http.address();
  const port = typeof address === "object" && address ? address.port : opts.port;
  log("info", "server_listening", { port, questions: bank.stats.total });

  return {
    server,
    port,
    stop: async () => {
      shuttingDown = true;
      await server.gracefullyShutdown(false);
    },
  };
}