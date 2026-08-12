export type LocationSourceKind = "gps" | "address" | "receipt" | "photo-metadata" | "message" | "calendar" | "manual";

export interface LocationObservation {
  sourceId: string;
  kind: LocationSourceKind;
  latitude?: number;
  longitude?: number;
  placeText?: string;
  capturedAt?: string;
  confidence: number;
}

export interface ResolvedLocation {
  latitude?: number;
  longitude?: number;
  placeText: string;
  confidence: number;
  sourceIds: string[];
  limitations: string[];
}

function validCoordinate(value: number | undefined, min: number, max: number): boolean {
  return value !== undefined && Number.isFinite(value) && value >= min && value <= max;
}

export function resolveLocation(observations: readonly LocationObservation[]): ResolvedLocation | null {
  if (observations.length === 0) return null;

  const usable = observations.filter((item) =>
    validCoordinate(item.latitude, -90, 90) && validCoordinate(item.longitude, -180, 180),
  );
  const text = observations.find((item) => item.placeText?.trim());
  const sourceIds = [...new Set(observations.map((item) => item.sourceId))];

  if (usable.length === 0 && !text) return null;

  const weighted = usable.reduce(
    (sum, item) => ({
      latitude: sum.latitude + item.latitude! * item.confidence,
      longitude: sum.longitude + item.longitude! * item.confidence,
      weight: sum.weight + item.confidence,
    }),
    { latitude: 0, longitude: 0, weight: 0 },
  );

  const limitations: string[] = [];
  if (usable.length === 0) limitations.push("Location was resolved from text rather than coordinates.");
  if (usable.length === 1) limitations.push("Only one coordinate-bearing source was available.");

  return {
    latitude: weighted.weight ? weighted.latitude / weighted.weight : undefined,
    longitude: weighted.weight ? weighted.longitude / weighted.weight : undefined,
    placeText: text?.placeText?.trim() ?? "Unknown location",
    confidence: Math.min(0.99, Math.max(...observations.map((item) => item.confidence))),
    sourceIds,
    limitations,
  };
}
