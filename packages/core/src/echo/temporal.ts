export interface TemporalEvidence {
  sourceId: string;
  capturedAt?: string;
  startAt?: string;
  endAt?: string;
  place?: string;
  eventKey?: string;
}

export interface TemporalCluster {
  id: string;
  sourceIds: string[];
  startAt?: string;
  endAt?: string;
  places: string[];
  confidence: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function timeOf(item: TemporalEvidence): number | undefined {
  const value = item.startAt ?? item.capturedAt;
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : time;
}

export function clusterTemporalEvidence(
  evidence: readonly TemporalEvidence[],
  windowDays = 2,
): TemporalCluster[] {
  const clusters: TemporalCluster[] = [];
  const sorted = [...evidence].sort((a, b) => (timeOf(a) ?? 0) - (timeOf(b) ?? 0));

  for (const item of sorted) {
    const time = timeOf(item);
    const existing = clusters.find((cluster) => {
      if (time === undefined || !cluster.startAt) return false;
      const clusterTime = Date.parse(cluster.startAt);
      return !Number.isNaN(clusterTime) && Math.abs(time - clusterTime) <= windowDays * DAY_MS;
    });

    if (!existing) {
      clusters.push({
        id: `temporal:${clusters.length + 1}`,
        sourceIds: [item.sourceId],
        startAt: item.startAt ?? item.capturedAt,
        endAt: item.endAt ?? item.capturedAt,
        places: item.place ? [item.place] : [],
        confidence: time === undefined ? 0.4 : 0.8,
      });
      continue;
    }

    existing.sourceIds.push(item.sourceId);
    existing.endAt = item.endAt ?? item.capturedAt ?? existing.endAt;
    if (item.place && !existing.places.includes(item.place)) existing.places.push(item.place);
    existing.confidence = Math.min(0.99, existing.confidence + 0.03);
  }

  return clusters;
}

export function evidenceFallsWithinWindow(
  evidence: TemporalEvidence,
  startAt: string,
  endAt: string,
): boolean {
  const time = timeOf(evidence);
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  return time !== undefined && !Number.isNaN(start) && !Number.isNaN(end) && time >= start && time <= end;
}
