import type { VisualAsset, VisualDisplayMode, VisualRecallDecision } from "./visual-recall";

export interface VisualRecallUIModel {
  title: string;
  mediaKind: VisualAsset["kind"];
  sourceUri: string;
  availableModes: VisualDisplayMode[];
  selectedMode: VisualDisplayMode | "denied";
  fallbackNotice?: string;
  historicalTimeline?: Array<{ capturedAt: string; sourceUri: string }>;
  reconstructionPurchaseAvailable: boolean;
}

const labels: Record<VisualDisplayMode, string> = {
  original: "Original",
  merge: "Merge",
  restore: "Restore",
  holographic: "Holographic",
};

export function buildVisualRecallUI(
  asset: VisualAsset,
  decision: VisualRecallDecision,
  availableModes: VisualDisplayMode[],
  historicalTimeline: Array<{ capturedAt: string; sourceUri: string }> = [],
): VisualRecallUIModel {
  const fallbackNotice = decision.fallbackFrom
    ? `${labels[decision.fallbackFrom]} isn't available for this memory, so Echo is showing the authorized original instead.`
    : undefined;

  return {
    title: `${labels[decision.mode === "denied" ? "original" : decision.mode]} recall`,
    mediaKind: asset.kind,
    sourceUri: asset.sourceUri,
    availableModes: availableModes.filter((mode) => mode === "original" || decision.mode === mode || mode !== "holographic"),
    selectedMode: decision.mode,
    fallbackNotice,
    historicalTimeline,
    reconstructionPurchaseAvailable: decision.reason === "reconstruction-unavailable" && decision.mode !== "denied",
  };
}
