export interface RecommendTopicRequestDto {
    major: string;
    subject: string;
    taskType: string;
    originalTopic: string;
}

export interface RecommendedTopic {
    title: string;
    description: string;
    expectedEffect: string;
}

export interface GenerateDraftRequestDto {
    selectedTopic: string;
    studentActivities: string[];
}

export interface GenerateDraftResponse {
    draft: string;
}
