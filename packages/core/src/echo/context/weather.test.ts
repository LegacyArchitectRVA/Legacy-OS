import { describe, expect, it } from "vitest";
import { enrichWithHistoricalWeather } from "./weather.js";

describe("historical weather context", () => {
  it("uses spatial and temporal proximity instead of station existence alone", async () => {
    const result = await enrichWithHistoricalWeather(
      { latitude: 37.5, longitude: -77.4, observedAt: "2026-08-12T18:30:00Z", radiusKm: 50 },
      {
        lookup: async () => ({
          observedAt: "2026-08-12T18:30:00Z",
          stationId: "station-1",
          latitude: 37.5,
          longitude: -77.4,
          source: "NOAA-NCEI" as const,
        }),
      },
    );

    expect(result?.distanceKm).toBe(0);
    expect(result?.confidence).toBe(1);
  });

  it("reduces confidence for distant or stale observations", async () => {
    const result = await enrichWithHistoricalWeather(
      { latitude: 37.5, longitude: -77.4, observedAt: "2026-08-12T18:30:00Z", radiusKm: 50 },
      {
        lookup: async () => ({
          observedAt: "2026-08-14T18:30:00Z",
          stationId: "station-2",
          latitude: 38.5,
          longitude: -77.4,
          source: "NOAA-NCEI" as const,
        }),
      },
    );

    expect(result?.confidence).toBeLessThan(0.5);
    expect(result?.limitation).toContain("station-based");
  });
});
