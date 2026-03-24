// Stub: mock-exam feature was migrated to independent MogoMogo app.
// Returns empty data to satisfy remaining imports.

import { useQuery } from "@tanstack/react-query";

export const useGetMockExamStandardScores = () => {
  return useQuery({
    queryKey: ["mockExamStandardScores-stub"],
    queryFn: async () => ({ data: [] }),
    enabled: false,
  });
};
