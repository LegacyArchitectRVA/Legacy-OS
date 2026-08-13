import { describe, expect, it } from "vitest";
import { isFinancialTransactionEvidence, isReceiptEvidence } from "./model.js";

describe("typed evidence model", () => {
  it("identifies itemized receipts", () => {
    expect(isReceiptEvidence({
      id: "receipt:1", sourceId: "source:1", kind: "receipt", original: true,
      lineItems: [{ description: "Steak", amount: 24 }], confidence: 1,
    })).toBe(true);
  });

  it("identifies financial transactions without treating them as receipts", () => {
    expect(isFinancialTransactionEvidence({
      id: "bank:1", sourceId: "source:2", kind: "financial-transaction", original: true,
      amount: 63.42, confidence: 1,
    })).toBe(true);
    expect(isFinancialTransactionEvidence({
      id: "receipt:1", sourceId: "source:1", kind: "receipt", original: true, confidence: 1,
    })).toBe(false);
  });
});
