export class GenerateDraftDto {
    selectedTopic: string;
    studentActivities: string[];

    /** 서사 연결 키워드 (초안에 자연스럽게 녹여넣기 위함) */
    storylineKeywords?: string[];
}
