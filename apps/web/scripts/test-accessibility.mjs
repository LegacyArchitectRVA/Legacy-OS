import { readFile } from "node:fs/promises";

const file = new URL("../app/components/AccessibilitySettings.tsx", import.meta.url);
const source = await readFile(file, "utf8");

const required = [
  'legacyos:accessibility:colorblind-mode',
  'legacyos:accessibility:colorblind-profile',
  'legacyos:accessibility:reduced-motion',
  'legacyos:accessibility:high-contrast',
  'legacyos:accessibility:text-scale',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  '100',
  '110',
  '125',
  '150',
  'role="switch"',
  'aria-checked',
  'focus-visible',
];

const missing = required.filter((token) => !source.includes(token));
if (missing.length) {
  console.error(`Accessibility regression: missing ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Accessibility regression checks passed.");
