export interface HistoricalVisualSnapshot {
  id: string;
  assetId: string;
  capturedAt: string;
  source: "original-media" | "historical-provider" | "user-upload";
  sourceUri?: string;
  confidence: number;
}

export interface VisualTimeline {
  assetId: string;
  snapshots: HistoricalVisualSnapshot[];
}

export function sortVisualSnapshots(snapshots: HistoricalVisualSnapshot[]): HistoricalVisualSnapshot[] {
  return [...snapshots].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

export function selectHistoricalSnapshot(
  timeline: VisualTimeline,
  capturedAt: string,
): HistoricalVisualSnapshot | undefined {
  const snapshots = sortVisualSnapshots(timeline.snapshots);
  return snapshots.find((snapshot) => snapshot.capturedAt === capturedAt);
}

export function nearestHistoricalSnapshot(
  timeline: VisualTimeline,
  capturedAt: string,
): HistoricalVisualSnapshot | undefined {
  const target = Date.parse(capturedAt);
  if (!Number.isFinite(target)) return undefined;

  return sortVisualSnapshots(timeline.snapshots).reduce<HistoricalVisualSnapshot | undefined>(
    (nearest, snapshot) => {
      const current = Date.parse(snapshot.capturedAt);
      if (!Number.isFinite(current)) return nearest;
      if (!nearest) return snapshot;
      return Math.abs(current - target) < Math.abs(Date.parse(nearest.capturedAt) - target)
        ? snapshot
        : nearest;
    },
    undefined,
  );
}

export function addHistoricalProviderSnapshot(
  timeline: VisualTimeline,
  snapshot: HistoricalVisualSnapshot,
): VisualTimeline {
  if (snapshot.assetId !== timeline.assetId) return timeline;
  if (timeline.snapshots.some((item) => item.id === snapshot.id)) return timeline;
  return { ...timeline, snapshots: [...timeline.snapshots, snapshot] };
}
