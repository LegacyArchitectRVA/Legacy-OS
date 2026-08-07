export interface EnvironmentCheck {
  configured: boolean;
  missingVariables: string[];
}

export function checkEnvironment(required: string[]): EnvironmentCheck {
  const missingVariables = required.filter((key) => !process.env[key]);

  return {
    configured: missingVariables.length === 0,
    missingVariables,
  };
}
