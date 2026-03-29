import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineAnalysisResult, COMPETENCY_COLORS, COMPETENCY_LABELS, CompetencyCategory } from "@/types/analysis.type";

interface Props {
    timelineResult: TimelineAnalysisResult | null;
    isLoading?: boolean;
}

export default function CompetencyTimeline({ timelineResult, isLoading }: Props) {
    const [activeTab, setActiveTab] = useState<CompetencyCategory>("career");

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="animate-pulse font-medium text-gray-500">
                        AI가 3년간의 성장 서사를 추론하고 있습니다...
                    </p>
                </div>
            </div>
        );
    }

    if (!timelineResult) {
        return null;
    }

    const tabs: { id: CompetencyCategory; label: string; icon: string }[] = [
        { id: "academic", label: "학업 성장기", icon: "📚" },
        { id: "career", label: "진로 탐색 및 발전", icon: "🔭" },
        { id: "community", label: "공동체 리더십", icon: "🤝" }
    ];

    const currentData = timelineResult[activeTab as keyof TimelineAnalysisResult];
    const nodes = currentData?.nodes || [];
    const edges = currentData?.edges || [];

    // 노드를 찾아 반환 (없으면 null)
    const getNode = (id: string) => nodes.find(n => n.id === id);

    // 단순 수직 구성을 위해 시작 노드(아무데도 target이 아닌 노드) 찾기
    // 혹은 노드의 입력 순서 유지. LLM이 보통 서사순으로 배열을 줍니다.
    const orderedNodes = [...nodes];
    orderedNodes.sort((a, b) => {
        // 학년 순 정렬 (임시)
        return String(a.grade).localeCompare(String(b.grade));
    });

    return (
        <div className="w-full space-y-6">
            {/* 탭 네비게이션 */}
            <div className="flex w-full items-center gap-2 overflow-x-auto rounded-full bg-gray-100 p-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-all ${
                                isActive
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* 타임라인 렌더링 영역 */}
            <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                {nodes.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                        해당 카테고리의 뚜렷한 서사 라인이 파악되지 않았습니다.
                    </div>
                ) : (
                    <div className="relative mx-auto mt-4 max-w-2xl space-y-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {orderedNodes.map((node, index) => {
                                    // 내가 Source인 Edge 찾아서 밑에 연결고리를 그려주기 위함
                                    const outgoingEdges = edges.filter(e => e.source === node.id);

                                    return (
                                        <div key={node.id} className="relative flex flex-col items-center">
                                            {/* 활동 카드 */}
                                            <div 
                                                className="z-10 w-full rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                                style={{ borderLeftWidth: "4px", borderLeftColor: COMPETENCY_COLORS[activeTab] || "#gray" }}
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                                                        {node.grade}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">{node.materialTitle}</h4>
                                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                                    {node.summary}
                                                </p>
                                            </div>

                                            {/* 아웃고잉 연결선 ও 배지 */}
                                            {outgoingEdges.map((edge, eIdx) => {
                                                const targetNode = getNode(edge.target);
                                                // 타겟이 리스트에 존재할 때만 엣지 렌더링
                                                if (!targetNode) return null;

                                                return (
                                                    <div key={`edge-${eIdx}`} className="relative flex w-full flex-col items-center py-6">
                                                        <div 
                                                            className="absolute inset-0 flex items-center justify-center"
                                                        >
                                                            <div className="h-full w-0.5" style={{ backgroundColor: `${COMPETENCY_COLORS[activeTab]}40` }} />
                                                        </div>
                                                        <div 
                                                            className="z-20 max-w-[80%] rounded-xl border border-dashed bg-white px-4 py-2 font-medium shadow-sm"
                                                            style={{ borderColor: COMPETENCY_COLORS[activeTab], color: COMPETENCY_COLORS[activeTab] }}
                                                        >
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-lg">💡</span>
                                                                <span>{edge.reason}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* 타겟을 명시하지 않은 마지막 카드면 끝부분 여백 없음 */}
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
