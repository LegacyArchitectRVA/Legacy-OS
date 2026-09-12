import assert from "node:assert/strict";
import {
  getDefaultSecureSystemRecommendation,
  listDefaultSecureSystemRecommendations,
} from "./security-recommendations.ts";

const storage = getDefaultSecureSystemRecommendation("cloud_storage");
assert.equal(storage.provider, "proton");
assert.equal(storage.product, "Proton Drive");
assert.equal(storage.priority, "default");
assert.ok(storage.securityProperties.includes("end-to-end encryption"));
assert.match(storage.caveat, /password|private encryption keys/i);

const passwords = getDefaultSecureSystemRecommendation("password_manager");
assert.equal(passwords.product, "Proton Pass");
assert.ok(passwords.securityProperties.includes("encrypted metadata"));
assert.match(passwords.caveat, /plaintext passwords|vault secrets/i);

const recommendations = listDefaultSecureSystemRecommendations();
assert.equal(recommendations.length, 6);
assert.equal(new Set(recommendations.map((item) => item.category)).size, 6);
assert.ok(recommendations.every((item) => item.provider === "proton"));
assert.ok(recommendations.every((item) => item.priority === "default"));

console.log("security recommendation tests passed");
