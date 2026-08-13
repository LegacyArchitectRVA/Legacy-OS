import type {
  MemoryEvidence,
  MemoryEvidenceKind,
  MemoryFinancialEvidence,
  MemoryReceiptEvidence,
} from "./model.js";

export function isReceiptEvidence(value: MemoryEvidence): value is MemoryReceiptEvidence {
  return value.kind === "receipt";
}

export function isFinancialTransactionEvidence(
  value: MemoryEvidence,
): value is MemoryFinancialEvidence {
  return value.kind === "financial-transaction";
}

export function evidenceKindIsFinancial(value: MemoryEvidenceKind): boolean {
  return value === "receipt" || value === "financial-transaction";
}
