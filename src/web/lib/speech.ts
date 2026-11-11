export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Uses the phone or browser voice. No network call and no paid service. */
export function speak(text: string): boolean {
  if (!speechSupported() || !text.trim()) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-NG";
    u.rate = 0.92;
    u.pitch = 1.02;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (!speechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* nothing to stop */
  }
}