import type { MemoryReceiptEvidence } from "./model.js";

export interface ReceiptExtractionInput {
  sourceId: string;
  text: string;
  importedAt: string;
  contentHash?: string;
}

const MONEY = /(?:[$€£]\s*)?([0-9]+(?:[.,][0-9]{2}))/;

export function extractReceiptEvidence(input: ReceiptExtractionInput): MemoryReceiptEvidence {
  const lines = input.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const totalLine = lines.find((line) => /\btotal\b/i.test(line));
  const totalMatch = totalLine?.match(MONEY);
  const merchant = lines.find((line) => !/\b(?:total|tax|subtotal|date|receipt)\b/i.test(line));

  return {
    id: `receipt:${input.sourceId}`,
    sourceId: input.sourceId,
    kind: "receipt",
    merchant,
    totalAmount: totalMatch ? Number(totalMatch[1].replace(",", ".")) : undefined,
    lineItems: [],
    confidence: merchant || totalMatch ? 0.7 : 0.35,
    original: true,
    capturedAt: input.importedAt,
    excerpt: input.text.slice(0, 1000),
  };
}
