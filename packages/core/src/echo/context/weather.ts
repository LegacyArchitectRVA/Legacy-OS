export interface WeatherLookupRequest {
  latitude: number;
  longitude: number;
  observedAt: string;
  radiusKm?: number;
}

export interface HistoricalWeatherObservation {
  observedAt: string;
  stationId: string;
  latitude: number;
  longitude: number;
  temperatureF?: number;
  dewPointF?: number;
  precipitationIn?: number;
  windMph?: number;
  windDirection?: string;
  cloudCoverPercent?: number;
  conditions?: string;
  source: "NOAA-NCEI" | "other";
  sourceUrl?: string;
}

export interface WeatherContext {
  observation: HistoricalWeatherObservation;
  distanceKm: number;
  confidence: number;
  limitation: string;
}

export interface HistoricalWeatherProvider {
  lookup(request: WeatherLookupRequest): Promise<HistoricalWeatherObservation | null>;
}

function haversineKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(latitudeB - latitudeA);
  const dLon = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function temporalDistanceHours(a: string, b: string): number {
  return Math.abs(Date.parse(a) - Date.parse(b)) / 3_600_000;
}

/**
 * Historical weather is contextual evidence, never proof of what a person
 * experienced. Confidence is based on spatial and temporal proximity rather
 * than merely the existence of a station ID.
 */
export async function enrichWithHistoricalWeather(
  request: WeatherLookupRequest,
  provider: HistoricalWeatherProvider,
): Promise<WeatherContext | null> {
  const observation = await provider.lookup(request);
  if (!observation) return null;

  const distanceKm = haversineKm(
    request.latitude,
    request.longitude,
    observation.latitude,
    observation.longitude,
  );
  const timeDeltaHours = temporalDistanceHours(request.observedAt, observation.observedAt);
  const radiusKm = request.radiusKm ?? 50;

  const spatialConfidence = Math.max(0, 1 - distanceKm / radiusKm);
  const temporalConfidence = Math.max(0, 1 - timeDeltaHours / 24);
  const confidence = Number((0.6 * spatialConfidence + 0.4 * temporalConfidence).toFixed(3));

  return {
    observation,
    distanceKm,
    confidence,
    limitation: "Weather is station-based historical context; it may differ from conditions at the exact scene location and time.",
  };
}
