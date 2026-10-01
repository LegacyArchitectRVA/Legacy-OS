// Real, free, keyless context enrichment for Legacy Recall.
//
// When a memory has a place and a date, this looks up what actually
// happened in the world at that place and time (right now: historical
// weather) so the recreation endpoint can fill in real detail instead of
// inventing it. Every lookup fails soft: if geocoding or the weather
// archive is unavailable, callers get `null` and proceed without it.
// Nothing here fabricates anything about the person or the memory itself.

const GEOCODE_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const ARCHIVE_ENDPOINT = "https://archive-api.open-meteo.com/v1/archive";
const LOOKUP_TIMEOUT_MS = 4_000;

export type GeocodedPlace = {
  name: string;
  latitude: number;
  longitude: number;
};

export type HistoricalWeather = {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
  summary: string;
};

export type SceneContext = {
  place: GeocodedPlace;
  weather: HistoricalWeather;
};

function withTimeout(ms: number) {
  return AbortSignal.timeout(ms);
}

function weatherCodeToSummary(code: number): string {
  if (code === 0) return "clear skies";
  if (code <= 3) return "partly cloudy";
  if (code <= 49) return "foggy";
  if (code <= 59) return "drizzling";
  if (code <= 69) return "raining";
  if (code <= 79) return "snowing";
  if (code <= 99) return "stormy";
  return "unrecorded conditions";
}

export async function geocodePlace(query: string): Promise<GeocodedPlace | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  try {
    const url = `${GEOCODE_ENDPOINT}?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`;
    const response = await fetch(url, { signal: withTimeout(LOOKUP_TIMEOUT_MS) });
    if (!response.ok) return null;
    const data = await response.json();
    const first = Array.isArray(data?.results) ? data.results[0] : undefined;
    if (!first || typeof first.latitude !== "number" || typeof first.longitude !== "number") return null;
    return { name: [first.name, first.admin1, first.country].filter(Boolean).join(", "), latitude: first.latitude, longitude: first.longitude };
  } catch {
    return null;
  }
}

export async function getHistoricalWeather(place: GeocodedPlace, isoDate: string): Promise<HistoricalWeather | null> {
  const date = isoDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  // The archive only has data up to roughly yesterday; skip anything newer.
  if (new Date(date).getTime() > Date.now()) return null;
  try {
    const url = `${ARCHIVE_ENDPOINT}?latitude=${place.latitude}&longitude=${place.longitude}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
    const response = await fetch(url, { signal: withTimeout(LOOKUP_TIMEOUT_MS) });
    if (!response.ok) return null;
    const data = await response.json();
    const daily = data?.daily;
    if (!daily?.time?.length) return null;
    const tempMaxC = daily.temperature_2m_max?.[0];
    const tempMinC = daily.temperature_2m_min?.[0];
    const precipitationMm = daily.precipitation_sum?.[0];
    const code = daily.weathercode?.[0];
    if (typeof tempMaxC !== "number" || typeof tempMinC !== "number") return null;
    return {
      date,
      tempMaxC,
      tempMinC,
      precipitationMm: typeof precipitationMm === "number" ? precipitationMm : 0,
      summary: weatherCodeToSummary(typeof code === "number" ? code : 100),
    };
  } catch {
    return null;
  }
}

/** Best-effort: resolve a place + date into real historical context. Never throws. */
export async function getSceneContext(location: string | undefined, occurredAt: string | undefined): Promise<SceneContext | null> {
  if (!location || !occurredAt) return null;
  const place = await geocodePlace(location);
  if (!place) return null;
  const weather = await getHistoricalWeather(place, occurredAt);
  if (!weather) return null;
  return { place, weather };
}
