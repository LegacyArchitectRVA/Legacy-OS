export type MediaKind = "image" | "video" | "scene" | "location";
export type DisplayVariant = "original" | "merge" | "restore";
export type DisplayMode = "flat" | "holographic";

export interface MediaSource {
  id: string;
  kind: MediaKind;
  uri: string;
  capturedAt?: string;
  qualityScore: number;
  provenance: "uploaded" | "family-submission" | "historical-location" | "system-generated";
}

export interface HistoricalSnapshot {
  id: string;
  sourceId: string;
  capturedAt: string;
  provider: "google-earth" | "user-source" | "other";
  uri: string;
  confidence: number;
}

export interface VisualDisplayPlan {
  sourceId: string;
  mode: DisplayMode;
  variant: DisplayVariant;
  historicalSnapshotId?: string;
  reconstructionEnabled: boolean;
  reconstructionEntitlement?: "included" | "purchased" | "unavailable";
}

export interface VisualDisplayDecision {
  allowed: boolean;
  mode: DisplayMode;
  variant: DisplayVariant;
  fallback: "none" | "original" | "documented";
  reason:
    | "authorized"
    | "source-missing"
    | "source-invalid"
    | "variant-unavailable"
    | "reconstruction-unavailable"
    | "historical-snapshot-unavailable";
}

function validQuality(score: number): boolean {
  return Number.isFinite(score) && score >= 0 && score <= 1;
}

export function chooseDisplayVariant(source: MediaSource, requested: DisplayVariant): DisplayVariant {
  if (!validQuality(source.qualityScore)) return "original";
  if (requested === "original") return "original";
  return source.qualityScore < 0.65 ? requested : "original";
}

export function decideVisualDisplay(
  source: MediaSource | undefined,
  plan: VisualDisplayPlan,
  historicalSnapshot?: HistoricalSnapshot,
): VisualDisplayDecision {
  if (!source || source.id !== plan.sourceId) {
    return { allowed: false, mode: "flat", variant: "original", fallback: "documented", reason: "source-missing" };
  }

  if (!source.uri || !validQuality(source.qualityScore)) {
    return { allowed: false, mode: "flat", variant: "original", fallback: "documented", reason: "source-invalid" };
  }

  if (plan.historicalSnapshotId && (!historicalSnapshot || historicalSnapshot.id !== plan.historicalSnapshotId)) {
    return { allowed: true, mode: plan.mode, variant: "original", fallback: "original", reason: "historical-snapshot-unavailable" };
  }

  const variant = chooseDisplayVariant(source, plan.variant);

  if (plan.reconstructionEnabled && plan.reconstructionEntitlement === "unavailable") {
    return {
      allowed: true,
      mode: plan.mode,
      variant: "original",
      fallback: "original",
      reason: "reconstruction-unavailable",
    };
  }

  if (variant !== "original" && source.qualityScore >= 0.65) {
    return { allowed: true, mode: plan.mode, variant: "original", fallback: "original", reason: "variant-unavailable" };
  }

  return { allowed: true, mode: plan.mode, variant, fallback: "none", reason: "authorized" };
}

export function createVisualDisplayPlan(
  sourceId: string,
  variant: DisplayVariant = "original",
  mode: DisplayMode = "flat",
): VisualDisplayPlan {
  if (!sourceId) throw new Error("Visual display requires a source");
  return {
    sourceId,
    mode,
    variant,
    reconstructionEnabled: false,
  };
}
