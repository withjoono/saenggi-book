import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompetencyTimeline as ICompetencyTimeline, COMPETENCY_COLORS, COMPETENCY_LABELS, CompetencyCategory } from "@/types/analysis.type";

interface Props {
    data: ICompetencyTimeline | null;
    category: CompetencyCategory;
    isLoading?: boolean;
}

export default function CompetencyTimeline({ data, category, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="animate-pulse font-medium text-gray-500">
                        AI가 3년간의 {COMPETENCY_LABELS[category]} 성장 서사를 추론하고 있습니다...
                    </p>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const nodes = data.nodes || [];
    const edges = data.edges || [];

    // 노드를 찾아 반환 (없으면 null)
    const getNode = (id: string) => nodes.find(n => n.id === id);

    // 단순 수직 구성을 위해 시작 노드(아무데도 target이 아닌 노드) 찾기
    // 혹은 노드의 입력 순서 유지. LLM이 보통 서사순으로 배열을 줍니다.
    const orderedNodes = [...nodes];
    orderedNodes.sort((a, b) => {
        // 학년 순 정렬 (임시)
        return String(a.grade).localeCompare(String(b.grade));
    });

    const storyline = data.overall_storyline || (data as any).overallStoryline;

    return (
        <div className="w-full space-y-6">
            {/* 타임라인 렌더링 영역 */}
            <div className="relative w-full rounded-2xl border bg-white p-6 shadow-sm md:p-8" style={{ borderColor: `${COMPETENCY_COLORS[category]}40` }}>
                {nodes.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-gray-500 text-center px-4">
                        {storyline || "해당 카테고리의 뚜렷한 서사 라인이 파악되지 않았습니다."}
                    </div>
                ) : (
                    <div className="relative mx-auto max-w-2xl space-y-8">
                        {/* 스토리라인 요약글 바탕 */}
                        {storyline && (
                            <div 
                                className="rounded-xl border p-5 leading-relaxed shadow-sm text-gray-800"
                                style={{ backgroundColor: `${COMPETENCY_COLORS[category]}10`, borderColor: `${COMPETENCY_COLORS[category]}30` }}
                            >
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold" style={{ color: COMPETENCY_COLORS[category] }}>
                                    <span className="text-xl">✨</span> 3년 성장 스토리라인 (Timeline)
                                </h3>
                                <p className="text-sm sm:text-base whitespace-pre-wrap font-medium">
                                    {storyline}
                                </p>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4 pt-4"
                            >
                                {/* 노드 & 연결선 렌더링 */}
                                {orderedNodes.map((node) => {
                                    // 내가 Source인 Edge 찾아서 밑에 연결고리를 그려주기 위함
                                    const outgoingEdges = edges.filter(e => e.source === node.id);

                                    return (
                                        <div key={node.id} className="relative flex flex-col items-center">
                                            {/* 활동 카드 */}
                                            <div 
                                                className="z-10 w-full rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                                style={{ borderLeftWidth: "4px", borderLeftColor: COMPETENCY_COLORS[category] || "#gray" }}
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="rounded bg-gray-100 px-2 flex py-1 text-xs font-bold text-gray-700">
                                                        {node.grade}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">{node.materialTitle}</h4>
                                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                                    {node.summary}
                                                </p>
                                            </div>

                                            {/* 아웃고잉 연결선 & 배지 */}
                                            {outgoingEdges.map((edge, eIdx) => {
                                                const targetNode = getNode(edge.target);
                                                // 타겟이 리스트에 존재할 때만 엣지 렌더링
                                                if (!targetNode) return null;

                                                return (
                                                    <div key={`edge-${eIdx}`} className="relative flex w-full flex-col items-center py-6">
                                                        <div 
                                                            className="absolute inset-0 flex items-center justify-center"
                                                        >
                                                            <div className="h-full w-0.5" style={{ backgroundColor: `${COMPETENCY_COLORS[category]}40` }} />
                                                        </div>
                                                        <div 
                                                            className="z-20 max-w-[80%] rounded-xl border border-dashed bg-white px-4 py-2 font-medium shadow-sm"
                                                            style={{ borderColor: COMPETENCY_COLORS[category], color: COMPETENCY_COLORS[category] }}
                                                        >
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-lg">💡</span>
                                                                <span>{edge.reason}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
