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
  distanceKm?: number;
  confidence: number;
  limitation?: string;
}

/**
 * Historical weather is contextual evidence, never proof of what a person
 * experienced. The provider implementation belongs outside the core domain.
 */
export interface HistoricalWeatherProvider {
  lookup(request: WeatherLookupRequest): Promise<HistoricalWeatherObservation | null>;
}

export async function enrichWithHistoricalWeather(
  request: WeatherLookupRequest,
  provider: HistoricalWeatherProvider,
): Promise<WeatherContext | null> {
  const observation = await provider.lookup(request);
  if (!observation) return null;

  return {
    observation,
    confidence: observation.stationId ? 0.85 : 0.6,
    limitation: "Weather is station-based historical context and may differ from conditions at the exact scene location.",
  };
}
