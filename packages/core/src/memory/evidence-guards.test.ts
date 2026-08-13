import { describe, expect, it } from "vitest";
import { evidenceKindIsFinancial, isFinancialTransactionEvidence, isReceiptEvidence } from "./evidence-guards.js";
import type { MemoryEvidence } from "./model.js";

const receipt: MemoryEvidence = {
  id: "receipt:1",
  sourceId: "source:1",
  kind: "receipt",
  confidence: 0.98,
  original: true,
};

const transaction: MemoryEvidence = {
  id: "txn:1",
  sourceId: "source:2",
  kind: "financial-transaction",
  confidence: 0.95,
  original: true,
};

describe("evidence type guards", () => {
  it("identifies receipts without widening unrelated evidence", () => {
    expect(isReceiptEvidence(receipt)).toBe(true);
    expect(isReceiptEvidence(transaction)).toBe(false);
  });

  it("identifies financial transactions", () => {
    expect(isFinancialTransactionEvidence(transaction)).toBe(true);
    expect(evidenceKindIsFinancial("receipt")).toBe(true);
    expect(evidenceKindIsFinancial("photo")).toBe(false);
  });
});
