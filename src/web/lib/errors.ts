import { ERROR_CODES, ERROR_MESSAGES } from "../../shared/constants";

/** Turn anything thrown by the start flow into a sentence a child or parent can act on. */
export function friendlyError(err: unknown): string {
  const e = err as { code?: number; message?: string } | null;
  const message = String(e?.message ?? "");
  const code = e?.code;

  for (const key of Object.keys(ERROR_MESSAGES) as Array<keyof typeof ERROR_MESSAGES>) {
    if (message.includes(key)) return ERROR_MESSAGES[key];
  }
  if (code === ERROR_CODES.badName) return ERROR_MESSAGES.BAD_NAME;
  if (code === ERROR_CODES.rateLimited || code === 429) return ERROR_MESSAGES.RATE_LIMITED;
  if (code === 503) return ERROR_MESSAGES.ROOM_BUSY;
  if (/fetch|network|Failed|ECONN|timeout|WebSocket/i.test(message) || code === undefined) {
    return "Cannot reach the game server. Check your connection and try again.";
  }
  return "The game did not start. Try again.";
}

export const REJECT_MESSAGES: Record<string, string> = {
  WRONG_PHASE: "That is not open right now.",
  STALE_QUESTION: "That question has already ended.",
  ALREADY_ANSWERED: "You already picked an answer.",
  TOO_LATE: "Time ran out before that answer arrived.",
  NO_QUESTIONS: "No questions are ready for that topic yet.",
  UNKNOWN_PLAYER: "You are no longer in this game.",
  BAD_REQUEST: "That request was not valid.",
  SERVER_ERROR: "Something went wrong on the server.",
};