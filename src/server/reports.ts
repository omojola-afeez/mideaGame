import { randomUUID } from "node:crypto";
import type { Report } from "../shared/schemas";
import { log } from "./log";
import { counters } from "./metrics";

export interface ReportEntry extends Report {
  id: string;
  at: number;
}

const MAX_REPORTS = 500;
const reports: ReportEntry[] = [];

/**
 * Phase 1 keeps reports in memory and writes a count to the log.
 * A free Render service restarts, so the owner must read the queue before a deploy.
 * Phase 2 moves this to the database.
 */
export function addReport(input: Report): ReportEntry {
  const entry: ReportEntry = { ...input, id: randomUUID().slice(0, 8), at: Date.now() };
  reports.push(entry);
  if (reports.length > MAX_REPORTS) reports.shift();
  counters.reportsReceived += 1;
  log("info", "question_reported", { code: input.code, reason: input.reason });
  return entry;
}

export function listReports(): ReportEntry[] {
  return [...reports];
}

export function clearReports(): void {
  reports.length = 0;
}

export function reportCount(): number {
  return reports.length;
}