import { useEffect, useState } from "react";

export interface CatalogTopic {
  id: string;
  label: string;
  count: number;
}

export interface CatalogSubject {
  id: string;
  label: string;
  topics: CatalogTopic[];
}

export interface Catalog {
  subjects: CatalogSubject[];
  bank: { total: number; byStatus: Record<string, number> };
}

let cached: Catalog | null = null;
let pending: Promise<Catalog | null> | null = null;

async function fetchCatalog(): Promise<Catalog | null> {
  try {
    const res = await fetch("/api/catalog", { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as Catalog;
  } catch {
    return null;
  }
}

export function useCatalog(): { catalog: Catalog | null; countFor: (topic: string) => number | null } {
  const [catalog, setCatalog] = useState<Catalog | null>(cached);

  useEffect(() => {
    if (cached) return;
    pending ??= fetchCatalog();
    let alive = true;
    void pending.then((value) => {
      cached = value;
      if (alive) setCatalog(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  function countFor(topic: string): number | null {
    if (!catalog) return null;
    for (const subject of catalog.subjects) {
      const t = subject.topics.find((x) => x.id === topic);
      if (t) return t.count;
    }
    return null;
  }

  return { catalog, countFor };
}