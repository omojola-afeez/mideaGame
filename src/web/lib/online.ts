import { useEffect, useState } from "react";

/**
 * True when the browser reports it is online.
 * Setting localStorage `brainwave-offline = "1"` forces offline mode,
 * which is how the offline path is tested and can be demoed on any device.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage?.getItem("brainwave-offline") === "1") return false;
    return typeof navigator === "undefined" ? true : navigator.onLine;
  });

  useEffect(() => {
    const update = () => {
      if (window.localStorage?.getItem("brainwave-offline") === "1") {
        setOnline(false);
        return;
      }
      setOnline(navigator.onLine);
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return online;
}
