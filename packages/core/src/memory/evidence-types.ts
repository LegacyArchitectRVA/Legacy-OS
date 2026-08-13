import type { MemoryEvidence } from "./model.js";

export interface ReceiptLineItem {
  description: string;
  quantity?: number;
  amount?: number;
}

export interface ReceiptEvidence extends MemoryEvidence {
  kind: "document";
  receiptType: "receipt";
  merchant?: string;
  transactionDate?: string;
  totalAmount?: number;
  currency?: string;
  lineItems?: ReceiptLineItem[];
}

export interface FinancialTransactionEvidence extends MemoryEvidence {
  kind: "document";
  transactionType: "financial-transaction";
  merchant?: string;
  transactionDate?: string;
  amount?: number;
  currency?: string;
  accountLast4?: string;
}

export type StructuredFinancialEvidence = ReceiptEvidence | FinancialTransactionEvidence;

export function isReceiptEvidence(evidence: MemoryEvidence): evidence is ReceiptEvidence {
  return (evidence as ReceiptEvidence).receiptType === "receipt";
}

export function isFinancialTransactionEvidence(
  evidence: MemoryEvidence,
): evidence is FinancialTransactionEvidence {
  return (evidence as FinancialTransactionEvidence).transactionType === "financial-transaction";
}
