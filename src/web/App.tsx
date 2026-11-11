import { useEffect, useState } from "react";
import { GAME_NAME } from "../shared/constants";
import type { RoundPartInput } from "../shared/daily";
import { game, useGame } from "./lib/store";
import { useProgress } from "./lib/progress";
import { ConnectionBadge, Toasts } from "./components/ui";
import { Home } from "./screens/Home";
import { Map } from "./screens/Map";
import { Round } from "./screens/Round";
import { Results } from "./screens/Results";
import { Grownups } from "./screens/Grownups";

type Page = "home" | "map" | "round" | "grownups";

let resumeOnce = false;

export function App() {
  const { status, snap } = useGame();
  const { progress } = useProgress();
  const [page, setPage] = useState<Page>("home");

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
    if (status === "connected" && page === "home") setPage("map");
  }, [status, page]);

  useEffect(() => {
    if ((status === "idle" || status === "lost") && page !== "grownups") setPage("home");
  }, [status, page]);

  function start(parts: RoundPartInput[], timed: boolean) {
    game.startRound(parts, timed);
    setPage("round");
  }

  let screen;
  if (page === "grownups") {
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
    screen = <Round onExit={() => setPage("home")} />;
  } else if (page === "round" && snap?.phase === "RESULTS") {
    screen = <Results onMap={() => setPage("map")} onPlayAgain={start} />;
  } else {
    screen = <Map onStart={start} onGrownups={() => setPage("grownups")} />;
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
      <div id="main-content">{screen}</div>
      <Toasts />
    </>
  );
}