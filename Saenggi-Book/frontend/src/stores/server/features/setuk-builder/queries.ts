import { useQuery } from "@tanstack/react-query";
import { setukBuilderApi } from "./api";

export const setukBuilderQueryKeys = {
    all: ["setuk-builder"] as const,
    subjects: () => [...setukBuilderQueryKeys.all, "subjects"] as const,
};

/**
 * 2022 교과목 목록 조회 (대상과목 자동완성용)
 */
export const useGetSubjectList = () => {
    return useQuery<string[]>({
        queryKey: setukBuilderQueryKeys.subjects(),
        queryFn: setukBuilderApi.fetchSubjectList,
        staleTime: 60 * 60 * 1000, // 1시간 (정적 데이터)
    });
};
