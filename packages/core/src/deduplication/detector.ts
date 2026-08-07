export type DuplicateCandidate = {
  existingId: string;
  incomingId: string;
  score: number;
};

export type DeduplicationRecord = {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, unknown>;
};

export class DuplicateDetector {
  findCandidate(
    incoming: DeduplicationRecord,
    existing: DeduplicationRecord[],
  ): DuplicateCandidate | null {
    let best: DuplicateCandidate | null = null;

    for (const item of existing) {
      const score = this.similarity(incoming, item);

      if (score >= 0.9 && (!best || score > best.score)) {
        best = {
          existingId: item.id,
          incomingId: incoming.id,
          score,
        };
      }
    }

    return best;
  }

  private similarity(a: DeduplicationRecord, b: DeduplicationRecord): number {
    let score = 0;

    if (a.name.toLowerCase() === b.name.toLowerCase()) score += 0.6;
    if (a.type === b.type) score += 0.2;
    if (JSON.stringify(a.metadata) === JSON.stringify(b.metadata)) score += 0.2;

    return score;
  }
}
