export type VisualMediaKind = "image" | "video" | "scene";
export type VisualDisplayMode = "original" | "merge" | "restore" | "holographic";

export interface VisualAsset {
  id: string;
  kind: VisualMediaKind;
  sourceUri: string;
  capturedAt?: string;
  qualityScore?: number;
  historicalLocation?: { latitude: number; longitude: number; capturedAt?: string };
}

export interface VisualRecallRequest {
  asset: VisualAsset;
  requestedMode: VisualDisplayMode;
  informationAuthorized: boolean;
  reconstructionAuthorized: boolean;
  reconstructionPurchased?: boolean;
}

export interface VisualRecallDecision {
  mode: VisualDisplayMode | "denied";
  assetId: string;
  reason: "authorized" | "information-denied" | "reconstruction-unavailable" | "reconstruction-not-authorized" | "version-unavailable";
  fallbackFrom?: VisualDisplayMode;
}

/** Information access is independent from reconstruction authorization. */
export function decideVisualRecall(request: VisualRecallRequest): VisualRecallDecision {
  if (!request.informationAuthorized) return { mode: "denied", assetId: request.asset.id, reason: "information-denied" };
  if (request.requestedMode === "original") return { mode: "original", assetId: request.asset.id, reason: "authorized" };
  if (!request.reconstructionAuthorized || request.reconstructionPurchased === false) {
    return {
      mode: "original",
      assetId: request.asset.id,
      reason: request.reconstructionAuthorized ? "reconstruction-unavailable" : "reconstruction-not-authorized",
      fallbackFrom: request.requestedMode,
    };
  }
  if (request.asset.qualityScore !== undefined && request.asset.qualityScore >= 0.8) {
    return { mode: "original", assetId: request.asset.id, reason: "version-unavailable", fallbackFrom: request.requestedMode };
  }
  return { mode: request.requestedMode, assetId: request.asset.id, reason: "authorized" };
}

export const visualDisplayModes: VisualDisplayMode[] = ["original", "merge", "restore", "holographic"];
