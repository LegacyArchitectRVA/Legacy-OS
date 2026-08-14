import { describe, expect, it } from "vitest";
import { correlateFinancialEvidence, extractFinancialEvidence } from "./financial-evidence.js";

describe("financial evidence extraction", () => {
  it("extracts explicit merchant, date, and amount without inventing line items", () => {
    const result = extractFinancialEvidence(
      "Restaurant: Example Grill\nDate: 2026-06-14\nTotal: $48.32\nReceipt",
    );

    expect(result.merchant).toBe("Example Grill");
    expect(result.date).toBe("2026-06-14");
    expect(result.amount).toBe(48.32);
    expect(result.lineItems).toEqual([]);
  });

  it("correlates records only on fields actually present", () => {
    const transaction = {
      id: "tx-1",
      sourceId: "bank-1",
      kind: "financial-transaction" as const,
      original: true,
      confidence: 1,
      merchant: "Example Grill",
      transactionDate: "2026-06-14",
      amount: 48.32,
    };
    const receipt = {
      id: "receipt-1",
      sourceId: "receipt-1",
      kind: "receipt" as const,
      original: true,
      confidence: 1,
      merchant: "Example Grill",
      transactionDate: "2026-06-14",
      totalAmount: 48.32,
      lineItems: [],
    };

    expect(correlateFinancialEvidence(transaction, receipt)).toEqual({
      matched: true,
      reasons: ["merchant", "date", "amount"],
    });
  });
});
