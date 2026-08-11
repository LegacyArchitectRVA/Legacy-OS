import type { MemoryGraph, MemoryPerson, MemoryRelationship } from "./model.js";

export interface RelationshipObservation {
  fromPersonId: string;
  label: string;
  toPersonId?: string;
  sourceId: string;
  confidence: number;
}

export interface RelationshipMatch {
  relationshipId: string;
  label: string;
  score: number;
  sourceIds: string[];
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ");

export function matchRelationship(
  graph: MemoryGraph,
  observation: RelationshipObservation,
): RelationshipMatch[] {
  if (observation.confidence < 0.8) return [];
  const label = normalize(observation.label);

  return graph.relationships
    .filter((relationship) => {
      if (relationship.fromPersonId !== observation.fromPersonId) return false;
      if (observation.toPersonId && relationship.toPersonId !== observation.toPersonId) return false;
      return normalize(relationship.label) === label;
    })
    .map((relationship) => ({
      relationshipId: relationship.id,
      label: relationship.label,
      score: Math.min(1, Math.min(observation.confidence, relationship.confidence)),
      sourceIds: relationship.sourceIds,
    }))
    .sort((a, b) => b.score - a.score);
}

export function canCreateRelationship(observation: RelationshipObservation): boolean {
  return Boolean(
    observation.fromPersonId &&
      observation.toPersonId &&
      observation.sourceId &&
      observation.confidence >= 0.9,
  );
}

export function createRelationship(
  graph: MemoryGraph,
  observation: RelationshipObservation,
): MemoryGraph {
  if (!canCreateRelationship(observation)) return graph;
  const relationship: MemoryRelationship = {
    id: `relationship:${observation.fromPersonId}:${observation.toPersonId}:${normalize(observation.label)}`,
    fromPersonId: observation.fromPersonId,
    toPersonId: observation.toPersonId!,
    label: observation.label,
    confidence: observation.confidence,
    sourceIds: [observation.sourceId],
  };
  if (graph.relationships.some((existing) => existing.id === relationship.id)) return graph;
  return { ...graph, relationships: [...graph.relationships, relationship] };
}

export function getRelationshipLabel(
  graph: MemoryGraph,
  fromPersonId: string,
  toPersonId: string,
): string | undefined {
  return graph.relationships.find(
    (relationship) => relationship.fromPersonId === fromPersonId && relationship.toPersonId === toPersonId,
  )?.label;
}

export function personExists(graph: MemoryGraph, personId: string): boolean {
  return graph.people.some((person: MemoryPerson) => person.id === personId);
}
