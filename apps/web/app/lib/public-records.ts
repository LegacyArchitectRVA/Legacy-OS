export type PublicRecordKind = "property" | "court" | "business" | "license" | "vital" | "obituary" | "news" | "archive" | "government";

export type PublicRecordSource = {
  id: string;
  kind: PublicRecordKind;
  title: string;
  url: string;
  jurisdiction?: string;
  retrievedAt: string;
  accessBasis: "public-web" | "government-portal" | "foia" | "state-public-records-law";
  privacyReview: "not-reviewed" | "reviewed" | "restricted";
};

export type PublicRecordMatch = {
  sourceId: string;
  personId: string;
  confidence: number;
  matchedFields: string[];
  status: "candidate" | "supported" | "verified" | "rejected";
};

export function classifyPublicRecordMatch(confidence: number): PublicRecordMatch["status"] {
  if (confidence >= 0.95) return "verified";
  if (confidence >= 0.75) return "supported";
  return "candidate";
}

export function isRecordEligibleForReconstruction(source: PublicRecordSource): boolean {
  return source.privacyReview !== "restricted" && source.url.startsWith("https://");
}
