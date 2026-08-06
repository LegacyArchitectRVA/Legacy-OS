export type LegacyAgent = {
  name: string;
  purpose: string;
  rules: string[];
};

export const agents: LegacyAgent[] = [
  {
    name: 'Business Brain',
    purpose: 'Maintain and retrieve approved organizational knowledge.',
    rules: ['Use available sources', 'Identify missing information', 'Avoid unsupported answers'],
  },
  {
    name: 'Executive Advisor',
    purpose: 'Pressure-test decisions and assumptions.',
    rules: ['Surface risks', 'Challenge assumptions', 'Provide alternatives'],
  },
  {
    name: 'Production Assistant',
    purpose: 'Maintain operational and brand consistency.',
    rules: ['Follow approved standards', 'Track versions', 'Request approval when needed'],
  },
];
