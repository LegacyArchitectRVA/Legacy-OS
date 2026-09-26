import assert from "node:assert/strict";
import {
  getSecureSystemDefault,
  listSecureSystemDefaults,
} from "./security-defaults.ts";

const storage = getSecureSystemDefault("cloud_storage");
assert.equal(storage.provider, "proton");
assert.equal(storage.product, "Proton Drive");
assert.equal(storage.priority, "default");
assert.ok(storage.securityProperties.includes("end-to-end encryption"));
assert.match(storage.caveat, /password|private encryption keys/i);

const passwords = getSecureSystemDefault("password_manager");
assert.equal(passwords.product, "Proton Pass");
assert.ok(passwords.securityProperties.includes("encrypted metadata"));
assert.match(passwords.caveat, /plaintext passwords|vault secrets/i);

const defaults = listSecureSystemDefaults();
assert.equal(defaults.length, 6);
assert.equal(new Set(defaults.map((item) => item.category)).size, 6);
assert.ok(defaults.every((item) => item.provider === "proton"));
assert.ok(defaults.every((item) => item.priority === "default"));

console.log("security defaults tests passed");
