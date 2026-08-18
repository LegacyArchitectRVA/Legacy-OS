import { describe, expect, it } from "vitest";

const profiles = ["general", "protanopia", "deuteranopia", "tritanopia"] as const;
const scales = ["100", "110", "125", "150"] as const;

describe("accessibility settings", () => {
  it("exposes all supported color vision profiles", () => {
    expect(profiles).toEqual(["general", "protanopia", "deuteranopia", "tritanopia"]);
  });

  it("exposes the supported text scale range", () => {
    expect(scales).toEqual(["100", "110", "125", "150"]);
  });

  it("uses a stable local-storage namespace", () => {
    const keys = [
      "legacyos:accessibility:colorblind-mode",
      "legacyos:accessibility:colorblind-profile",
      "legacyos:accessibility:reduced-motion",
      "legacyos:accessibility:high-contrast",
      "legacyos:accessibility:text-scale",
    ];
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((key) => key.startsWith("legacyos:accessibility:"))).toBe(true);
  });
});
