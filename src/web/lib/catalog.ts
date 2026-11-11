import { useEffect, useState } from "react";

export interface CatalogTopic {
  id: string;
  label: string;
  count: number;
}

export interface CatalogSubject {
  id: string;
  label: string;
  short: string;
  topics: CatalogTopic[];
}

export interface Catalog {
  band: string;
  bands: Array<{ id: string; label: string; ages: string; classes: string }>;
  subjects: CatalogSubject[];
  bank: { total: number; byStatus: Record<string, number> };
}

let cached: Catalog | null = null;
const cacheByBand = new Map<string, Catalog>();

async function fetchCatalog(band: string): Promise<Catalog | null> {
  try {
    const res = await fetch(`/api/catalog?band=${encodeURIComponent(band)}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as Catalog;
  } catch {
    return null;
  }
}

export function useCatalog(band: string = "10-12"): {
  catalog: Catalog | null;
  countFor: (topic: string) => number | null;
} {
  const [catalog, setCatalog] = useState<Catalog | null>(() => cacheByBand.get(band) ?? cached);

  useEffect(() => {
    const existing = cacheByBand.get(band);
    if (existing) {
      setCatalog(existing);
      return;
    }
    let alive = true;
    void fetchCatalog(band).then((value) => {
      if (value) cacheByBand.set(band, value);
      if (alive) setCatalog(value);
    });
    return () => {
      alive = false;
    };
  }, [band]);

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
