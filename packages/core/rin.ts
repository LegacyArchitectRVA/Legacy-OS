export type RinInsight = {
  category: 'risk' | 'recommendation' | 'update';
  message: string;
  priority: 'low' | 'medium' | 'high';
};

export type ConciergeReport = {
  generatedAt: string;
  insights: RinInsight[];
};

export function createConciergeReport(insights: RinInsight[]): ConciergeReport {
  return {
    generatedAt: new Date().toISOString(),
    insights,
  };
}
