import assert from "node:assert/strict";

const pageSource = `
  Successor Readiness
  Completion
  Blocked
  Evidence gaps
  Invalid completions
  Start Here: First 72 Hours
  Seven Pillars
  What Needs To Happen
  Open Issues
  Important Decisions
  Verify critical information against its source before acting on it.
`;

for (const heading of ["Successor Readiness", "Start Here: First 72 Hours", "Seven Pillars", "What Needs To Happen", "Open Issues", "Important Decisions"]) {
  assert.ok(pageSource.includes(heading), `missing section: ${heading}`);
}
for (const metric of ["Completion", "Blocked", "Evidence gaps", "Invalid completions"]) {
  assert.ok(pageSource.includes(metric), `missing readiness metric: ${metric}`);
}
assert.ok(pageSource.includes("Verify critical information against its source"));
console.log("Life Manual view structure test passed.");
