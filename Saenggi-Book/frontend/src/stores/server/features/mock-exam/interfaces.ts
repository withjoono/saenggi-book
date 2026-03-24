// Stub: mock-exam feature was migrated to independent MogoMogo app.
// This provides empty implementations to satisfy remaining imports.

export interface IMockExamScore {
  code: string;
  grade: number;
  standardScore?: number;
}

export interface IMockExamStandardScoresResponse {
  data: IMockExamScore[];
}
