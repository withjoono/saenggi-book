export interface IssueInfo {
    id: string;
    title: string;
    summary: string;
    severity: 'high' | 'medium' | 'low';
}
