import { useEffect, useState } from "react";
import { GAME_NAME, topicById, type Level, type TopicId } from "../shared/constants";
import type { RoundPartInput } from "../shared/daily";
import { game, useGame } from "./lib/store";
import { useProgress } from "./lib/progress";
import { useOnline } from "./lib/online";
import { ConnectionBadge, Toasts } from "./components/ui";
import { Home } from "./screens/Home";
import { Map } from "./screens/Map";
import { Round } from "./screens/Round";
import { Results } from "./screens/Results";
import { Grownups } from "./screens/Grownups";
import { OfflineRound, type OfflinePart } from "./screens/OfflineRound";

type Page = "home" | "map" | "round" | "grownups";

let resumeOnce = false;

export function App() {
  const online = useOnline();
  const { status, snap } = useGame();
  const { progress } = useProgress();
  const [page, setPage] = useState<Page>("home");
  const [offlineParts, setOfflineParts] = useState<OfflinePart[] | null>(null);

  useEffect(() => {
    if (resumeOnce) return;
    resumeOnce = true;
    void game.resume();
  }, []);

  useEffect(() => {
    document.title = GAME_NAME;
  }, []);

  useEffect(() => {
    if (progress.settings.highContrast) document.documentElement.dataset.contrast = "high";
    else delete document.documentElement.dataset.contrast;
  }, [progress.settings.highContrast]);

  useEffect(() => {
    if (!online) return;
    if (status === "connected" && page === "home") setPage("map");
  }, [status, page, online]);

  useEffect(() => {
    if (!online) return;
    if ((status === "idle" || status === "lost") && page !== "grownups") setPage("home");
  }, [status, page, online]);

  function start(parts: RoundPartInput[], timed: boolean) {
    if (!online) {
      const resolved = parts
        .map((p) => {
          const topic = topicById(p.topic as TopicId);
          return topic ? { topic, level: p.level as Level } : null;
        })
        .filter((x): x is OfflinePart => x !== null);
      if (resolved.length > 0) setOfflineParts(resolved);
      return;
    }
    game.startRound(parts, timed);
    setPage("round");
  }

  function goHome() {
    void game.leave();
    setPage("home");
  }

  let screen;
  if (offlineParts) {
    screen = (
      <OfflineRound
        parts={offlineParts}
        onExit={() => {
          setOfflineParts(null);
          setPage("map");
        }}
      />
    );
  } else if (!online) {
    if (page === "grownups") {
      screen = (
        <Grownups
          onBack={() => setPage("map")}
          onHome={() => setPage("home")}
        />
      );
    } else if (page === "map") {
      screen = <Map onStart={start} onGrownups={() => setPage("grownups")} onHome={goHome} offline />;
    } else {
      screen = <Home offline onOfflineStart={() => setPage("map")} onGrownups={() => setPage("grownups")} />;
    }
  } else if (page === "grownups") {
    screen = (
      <Grownups
        onBack={() => setPage(snap ? "map" : "home")}
        onHome={() => {
          void game.leave();
          setPage("home");
        }}
      />
    );
  } else if (status === "idle" || status === "lost" || (!snap && status !== "reconnecting")) {
    screen = <Home onGrownups={() => setPage("grownups")} />;
  } else if (page === "round" && (snap?.phase === "QUESTION" || snap?.phase === "REVEAL" || snap?.phase === "READY")) {
    screen = <Round onExit={goHome} />;
  } else if (page === "round" && snap?.phase === "RESULTS") {
    screen = <Results onMap={() => setPage("map")} onPlayAgain={start} />;
  } else {
    screen = <Map onStart={start} onGrownups={() => setPage("grownups")} onHome={goHome} />;
  }

  return (
    <>
      <div className="atmosphere" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-cyan focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <ConnectionBadge />
      {!online && (
        <div className="fixed inset-x-0 top-0 z-[70] bg-gold px-4 py-1.5 text-center text-xs font-bold text-[#2a1c00]">
          Offline mode — your progress is saved on this device.
        </div>
      )}
      <div id="main-content">{screen}</div>
      <Toasts />
    </>
  );
}