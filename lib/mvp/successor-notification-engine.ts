export interface SuccessorNotification {
  urgency: 'low' | 'medium' | 'high';
  title: string;
  message: string;
}

export function createSuccessorNotification(input: {
  missingItems: string[];
  critical: boolean;
}): SuccessorNotification {
  return {
    urgency: input.critical ? 'high' : input.missingItems.length > 0 ? 'medium' : 'low',
    title: input.critical ? 'Continuity action required' : 'Continuity update available',
    message:
      input.missingItems.length > 0
        ? `Review these items: ${input.missingItems.join(', ')}`
        : 'Your continuity information is current.',
  };
}
