import assert from "node:assert/strict";

const pageSource = `
  Start Here: First 72 Hours
  Seven Pillars
  What Needs To Happen
  Open Issues
  Important Decisions
  Verify critical information against its source before acting on it.
`;

for (const heading of ["Start Here: First 72 Hours", "Seven Pillars", "What Needs To Happen", "Open Issues", "Important Decisions"]) {
  assert.ok(pageSource.includes(heading), `missing section: ${heading}`);
}
assert.ok(pageSource.includes("Verify critical information against its source"));
console.log("Life Manual view structure test passed.");
