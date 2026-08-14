import type { MemoryEvidence } from "./model.js";

export interface FinancialTransactionRecord extends MemoryEvidence {
  kind: "financial-transaction";
  merchant?: string;
  transactionDate?: string;
  amount?: number;
  currency?: string;
  accountLast4?: string;
}

export interface ReceiptRecord extends MemoryEvidence {
  kind: "receipt";
  merchant?: string;
  transactionDate?: string;
  totalAmount?: number;
  currency?: string;
  lineItems: Array<{
    description: string;
    quantity?: number;
    amount?: number;
  }>;
}

export interface ExtractedFinancialEvidence {
  merchant?: string;
  date?: string;
  amount?: number;
  currency?: string;
  lineItems: ReceiptRecord["lineItems"];
  confidence: number;
}

const MONEY = /(?:[$€£]\s?)(\d+(?:,\d{3})*(?:\.\d{2})?)/;
const ISO_DATE = /\b(20\d{2}-\d{2}-\d{2})\b/;

function parseAmount(value: string): number {
  return Number(value.replace(/,/g, ""));
}

export function extractFinancialEvidence(text: string): ExtractedFinancialEvidence {
  const amountMatch = text.match(MONEY);
  const dateMatch = text.match(ISO_DATE);
  const merchantMatch = text.match(/(?:merchant|restaurant|store)\s*:\s*([^\n]+)/i);

  const merchant = merchantMatch?.[1]?.trim();
  const amount = amountMatch ? parseAmount(amountMatch[1]) : undefined;
  const date = dateMatch?.[1];

  let confidence = 0;
  if (merchant) confidence += 0.35;
  if (date) confidence += 0.25;
  if (amount !== undefined) confidence += 0.25;
  if (/receipt|transaction|statement/i.test(text)) confidence += 0.15;

  return {
    merchant,
    date,
    amount,
    lineItems: [],
    confidence: Math.min(confidence, 1),
  };
}

export function correlateFinancialEvidence(
  transaction: FinancialTransactionRecord,
  receipt: ReceiptRecord,
): { matched: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (transaction.merchant && receipt.merchant && transaction.merchant.toLowerCase() === receipt.merchant.toLowerCase()) {
    reasons.push("merchant");
  }
  if (transaction.transactionDate && receipt.transactionDate && transaction.transactionDate === receipt.transactionDate) {
    reasons.push("date");
  }
  if (transaction.amount !== undefined && receipt.totalAmount !== undefined && transaction.amount === receipt.totalAmount) {
    reasons.push("amount");
  }
  return { matched: reasons.length > 0, reasons };
}
