import { nestApiClient } from "@/stores/server/api-client";
import { RecommendTopicRequestDto, RecommendedTopic, GenerateDraftRequestDto, GenerateDraftResponse } from "@/types/setuk-builder.type";

export const setukBuilderApi = {
    recommendTopics: async (dto: RecommendTopicRequestDto): Promise<RecommendedTopic[]> => {
        const response = await nestApiClient.post('/setuk-builder/recommend-topics', dto);
        return response.data;
    },
    generateDraft: async (dto: GenerateDraftRequestDto): Promise<GenerateDraftResponse> => {
        const response = await nestApiClient.post('/setuk-builder/generate-draft', dto);
        return response.data;
    }
};
