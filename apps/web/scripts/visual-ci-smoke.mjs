import assert from "node:assert/strict";
import fs from "node:fs";

const scene = fs.readFileSync("app/successor/ContinuityScene.tsx", "utf8");
assert.match(scene, /@react-three\/fiber/);
assert.match(scene, /@react-three\/drei/);
assert.match(scene, /from "three"/);
assert.match(scene, /<Canvas/);
assert.match(scene, /OrbitControls/);
assert.match(scene, /Environment/);

const page = fs.readFileSync("app/successor/page.tsx", "utf8");
assert.match(page, /ContinuityScene/);
assert.doesNotMatch(page, /\bRin\b/i);

console.log("visual-ci-smoke: passed");
