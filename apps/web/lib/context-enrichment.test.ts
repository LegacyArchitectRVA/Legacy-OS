import assert from "node:assert/strict";
import { geocodePlace, getHistoricalWeather, getSceneContext } from "./context-enrichment.ts";

const originalFetch = globalThis.fetch;

function mockFetch(handler: (url: string) => Response) {
  globalThis.fetch = (async (input: string | URL | Request) => handler(String(input))) as typeof fetch;
}

// geocodePlace: happy path
mockFetch((url) => {
  assert.match(url, /geocoding-api\.open-meteo\.com/);
  return new Response(JSON.stringify({ results: [{ name: "Smith Mountain Lake", admin1: "Virginia", country: "United States", latitude: 37.03, longitude: -79.51 }] }), { status: 200 });
});
const place = await geocodePlace("Smith Mountain Lake");
assert.deepEqual(place, { name: "Smith Mountain Lake, Virginia, United States", latitude: 37.03, longitude: -79.51 });

// geocodePlace: empty query never calls fetch
mockFetch(() => { throw new Error("should not be called"); });
assert.equal(await geocodePlace(""), null);
assert.equal(await geocodePlace("   "), null);

// geocodePlace: no results resolves to null, not a throw
mockFetch(() => new Response(JSON.stringify({ results: [] }), { status: 200 }));
assert.equal(await geocodePlace("Nowhere"), null);

// geocodePlace: a failed request fails soft
mockFetch(() => new Response("", { status: 500 }));
assert.equal(await geocodePlace("Anywhere"), null);

// geocodePlace: a network error fails soft
globalThis.fetch = (async () => { throw new Error("network down"); }) as typeof fetch;
assert.equal(await geocodePlace("Anywhere"), null);

// getHistoricalWeather: happy path
const testPlace = { name: "Smith Mountain Lake, Virginia, United States", latitude: 37.03, longitude: -79.51 };
mockFetch((url) => {
  assert.match(url, /archive-api\.open-meteo\.com/);
  return new Response(JSON.stringify({ daily: { time: ["2019-06-15"], temperature_2m_max: [27.5], temperature_2m_min: [15.2], precipitation_sum: [0], weathercode: [1] } }), { status: 200 });
});
const weather = await getHistoricalWeather(testPlace, "2019-06-15");
assert.deepEqual(weather, { date: "2019-06-15", tempMaxC: 27.5, tempMinC: 15.2, precipitationMm: 0, summary: "partly cloudy" });

// getHistoricalWeather: rejects a malformed date without calling fetch
mockFetch(() => { throw new Error("should not be called"); });
assert.equal(await getHistoricalWeather(testPlace, "not-a-date"), null);

// getHistoricalWeather: rejects a future date without calling fetch
assert.equal(await getHistoricalWeather(testPlace, "2999-01-01"), null);

// getSceneContext: missing location or date short-circuits without calling fetch
mockFetch(() => { throw new Error("should not be called"); });
assert.equal(await getSceneContext(undefined, "2019-06-15"), null);
assert.equal(await getSceneContext("Smith Mountain Lake", undefined), null);

// getSceneContext: combines a successful geocode + weather lookup
let call = 0;
mockFetch((url) => {
  call += 1;
  if (url.includes("geocoding-api")) return new Response(JSON.stringify({ results: [{ name: "Smith Mountain Lake", admin1: "Virginia", country: "United States", latitude: 37.03, longitude: -79.51 }] }), { status: 200 });
  return new Response(JSON.stringify({ daily: { time: ["2019-06-15"], temperature_2m_max: [27.5], temperature_2m_min: [15.2], precipitation_sum: [0], weathercode: [1] } }), { status: 200 });
});
const scene = await getSceneContext("Smith Mountain Lake", "2019-06-15");
assert.equal(call, 2);
assert.equal(scene?.place.name, "Smith Mountain Lake, Virginia, United States");
assert.equal(scene?.weather.summary, "partly cloudy");

// getSceneContext: a failed geocode never calls the weather endpoint
mockFetch((url) => {
  if (url.includes("geocoding-api")) return new Response(JSON.stringify({ results: [] }), { status: 200 });
  throw new Error("should not reach the weather endpoint");
});
assert.equal(await getSceneContext("Nowhere", "2019-06-15"), null);

globalThis.fetch = originalFetch;
console.log("Context enrichment tests passed.");
