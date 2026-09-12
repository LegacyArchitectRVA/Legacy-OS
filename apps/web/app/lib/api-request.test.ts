import assert from "node:assert/strict";
import {
  ApiRequestError,
  isRecord,
  optionalString,
  parseJsonBody,
  requiredString,
} from "./api-request.ts";

const parsed = await parseJsonBody<{ name: string }>(
  new Request("https://legacyos.test/api", {
    method: "POST",
    body: JSON.stringify({ name: "Legacy OS" }),
    headers: { "content-type": "application/json" },
  }),
);
assert.deepEqual(parsed, { name: "Legacy OS" });

await assert.rejects(
  () => parseJsonBody(new Request("https://legacyos.test/api", { method: "POST", body: "not-json" })),
  (error: unknown) => error instanceof ApiRequestError && error.status === 400,
);
await assert.rejects(
  () => parseJsonBody(new Request("https://legacyos.test/api", { method: "POST", body: "123456789" }), 8),
  (error: unknown) => error instanceof ApiRequestError && error.status === 413,
);

assert.equal(requiredString("  device  ", "name", 20), "device");
assert.equal(optionalString(undefined, "name", 20), undefined);
assert.equal(optionalString("  source  ", "name", 20), "source");
assert.equal(isRecord({ ok: true }), true);
assert.equal(isRecord([]), false);
assert.throws(() => requiredString("", "name", 20), /name is required/);
assert.throws(() => optionalString(123, "name", 20), /name must be a string/);
assert.throws(() => requiredString("x".repeat(21), "name", 20), /name is too long/);

console.log("API request utility tests passed.");
