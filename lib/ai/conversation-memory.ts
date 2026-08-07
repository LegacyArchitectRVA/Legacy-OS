export type ConversationMemory = {
  workspaceId: string;
  messages: string[];
  updatedAt: string;
};

export function appendMemory(memory: ConversationMemory, message: string) {
  return {
    ...memory,
    messages: [...memory.messages, message],
    updatedAt: new Date().toISOString(),
  };
}
