import { clusterTemporalEvidence, type TemporalEvidence, type TemporalCluster } from "./temporal.js";

export interface TimelineEvent {
  id: string;
  sourceIds: string[];
  startAt?: string;
  endAt?: string;
  places: string[];
  confidence: number;
}

export interface InvestigationTimeline {
  events: TimelineEvent[];
  sourceIds: string[];
}

export function buildInvestigationTimeline(
  evidence: readonly TemporalEvidence[],
  windowDays = 2,
): InvestigationTimeline {
  const clusters: TemporalCluster[] = clusterTemporalEvidence(evidence, windowDays);
  return {
    events: clusters.map((cluster) => ({
      id: cluster.id,
      sourceIds: [...cluster.sourceIds],
      startAt: cluster.startAt,
      endAt: cluster.endAt,
      places: [...cluster.places],
      confidence: cluster.confidence,
    })),
    sourceIds: [...new Set(evidence.map((item) => item.sourceId))],
  };
}
