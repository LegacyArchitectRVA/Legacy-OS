import { describe, expect, it } from "vitest";

import { recallEvidenceTypes, recallVerificationStatuses } from "./recall-evidence-store";

describe("Recall evidence contracts", () => {
  it("keeps the persisted evidence types explicit", () => {
    expect(recallEvidenceTypes).toEqual(["document", "photo", "audio", "video", "link", "note"]);
  });

  it("keeps verification states explicit", () => {
    expect(recallVerificationStatuses).toEqual(["unverified", "verified", "disputed"]);
  });
});
