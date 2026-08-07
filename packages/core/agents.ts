export type AgentRole =
  | "business-brain"
  | "executive-advisor"
  | "production-assistant"
  | "legacy-concierge";

export interface AgentContext {
  workspaceId: string;
  userId?: string;
  knowledge: string[];
}

export interface AgentRequest {
  role: AgentRole;
  prompt: string;
  context: AgentContext;
}

export function createAgentRequest(input: AgentRequest) {
  return input;
}
