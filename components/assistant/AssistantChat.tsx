export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function AssistantChat({ messages = [] }: { messages?: AssistantMessage[] }) {
  return {
    title: 'LegacyOS Assistant',
    description: 'Workspace-aware operational guidance',
    messages,
    capabilities: [
      'Search business knowledge',
      'Review SOPs',
      'Identify continuity risks',
      'Recommend next actions'
    ]
  };
}
