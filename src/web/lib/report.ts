import type { Report } from "../../shared/schemas";

/** Reports go to the server queue. No nickname, device id or location is sent. */
export async function sendReport(input: Report): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, error: "Too many reports. Try again later." };
    return { ok: false, error: "The report did not send. Try again." };
  } catch {
    return { ok: false, error: "The report did not send. Check your connection." };
  }
}