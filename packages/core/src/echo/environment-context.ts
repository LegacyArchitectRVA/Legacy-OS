export type EnvironmentContextKind = "weather" | "sun" | "season" | "location";

export interface EnvironmentContext {
  kind: EnvironmentContextKind;
  sourceId: string;
  observedAt: string;
  location: { latitude: number; longitude: number; label?: string };
  values: Record<string, string | number | boolean>;
  confidence: number;
  limitation?: string;
}

export interface EnvironmentProvider {
  readonly kind: EnvironmentContextKind;
  supports(input: { latitude: number; longitude: number; observedAt: string }): boolean;
  lookup(input: { latitude: number; longitude: number; observedAt: string }): Promise<EnvironmentContext | null>;
}

export function createEnvironmentRequest(
  latitude: number,
  longitude: number,
  observedAt: string,
): { latitude: number; longitude: number; observedAt: string } {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Invalid latitude");
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Invalid longitude");
  if (Number.isNaN(Date.parse(observedAt))) throw new Error("Invalid observation time");
  return { latitude, longitude, observedAt };
}

/** NOAA/NCEI-backed providers should implement this boundary; no weather is fabricated when unavailable. */
export function selectEnvironmentProvider(
  providers: readonly EnvironmentProvider[],
  request: { latitude: number; longitude: number; observedAt: string },
): EnvironmentProvider | undefined {
  return providers.find((provider) => provider.supports(request));
}
