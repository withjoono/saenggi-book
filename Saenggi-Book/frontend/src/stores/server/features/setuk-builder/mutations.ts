import { useMutation } from "@tanstack/react-query";
import { setukBuilderApi } from "./api";
import { RecommendTopicRequestDto, GenerateDraftRequestDto } from "@/types/setuk-builder.type";

export const useRecommendTopics = () => {
    return useMutation({
        mutationFn: (data: RecommendTopicRequestDto) => setukBuilderApi.recommendTopics(data),
    });
};

export const useGenerateDraft = () => {
    return useMutation({
        mutationFn: (data: GenerateDraftRequestDto) => setukBuilderApi.generateDraft(data),
    });
};
