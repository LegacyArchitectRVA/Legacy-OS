export type WorkspaceSetup = {
  name: string;
  industry?: string;
  mission?: string;
};

export function WorkspaceOnboarding({ setup }: { setup: WorkspaceSetup }) {
  return {
    step: 'workspace-creation',
    setup,
    nextSteps: [
      'Add business profile',
      'Upload operational documents',
      'Create first SOP library'
    ]
  };
}
