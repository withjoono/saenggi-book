import { useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Briefcase, Users, Star, X } from "lucide-react";
import { EvalMaterialItem } from "@/types/evaluation.type";
import MaterialTimelineGraph from "../graph/MaterialTimelineGraph";

interface MaterialTreeProps {
    materials: EvalMaterialItem[];
    targetSeries?: string;
    currentGrade?: string;
}

type Tab = 'academic' | 'career' | 'community';

const TAB_CONFIG: Record<Tab, { label: string; icon: typeof BookOpen; color: string; bg: string; border: string }> = {
    academic: {
        label: '학업역량',
        icon: BookOpen,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
    },
    career: {
        label: '진로역량',
        icon: Briefcase,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
    },
    community: {
        label: '공동체역량',
        icon: Users,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
    },
};

/** 등급별 배지 색상 */
function GradeBadge({ level }: { level: number }) {
    const config = level <= 2
        ? { bg: 'bg-amber-100', text: 'text-amber-700', label: `${level}등급 ★★` }
        : level <= 4
        ? { bg: 'bg-blue-100', text: 'text-blue-700', label: `${level}등급 ★` }
        : { bg: 'bg-gray-100', text: 'text-gray-600', label: `${level}등급` };

    return (
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", config.bg, config.text)}>
            {config.label}
        </span>
    );
}

export function MaterialTree({ materials, targetSeries, currentGrade }: MaterialTreeProps) {
    const [activeTab, setActiveTab] = useState<Tab>('career');
    const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);

    const academicCount = materials.filter(m => m.category === 'academic').length;
    const careerCount = materials.filter(m => m.category === 'career').length;
    const communityCount = materials.filter(m => m.category === 'community').length;

    const counts: Record<Tab, number> = {
        academic: academicCount,
        career: careerCount,
        community: communityCount,
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setSelectedNodeIndex(null); // 탭 변경 시 선택 초기화
    };

    const selectedMaterial = selectedNodeIndex !== null ? materials[selectedNodeIndex] : null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6 shadow-sm flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
                <Star className="h-4 w-4 text-indigo-500 fill-indigo-300" />
                <span className="text-sm font-bold text-slate-800">
                    {currentGrade ? `${currentGrade}학년까지의 ` : ''}소재 트리
                </span>
                {targetSeries && (
                    <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        {targetSeries}
                    </span>
                )}
            </div>

            {/* 탭 */}
            <div className="flex border-b border-slate-100">
                {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => {
                    const { label, icon: Icon, color } = TAB_CONFIG[tab];
                    const isActive = activeTab === tab;
                    const count = counts[tab];
                    return (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all hover:bg-slate-50",
                                isActive
                                    ? `${color} border-b-2 border-current bg-white`
                                    : "text-slate-400 hover:text-slate-600 border-b-2 border-transparent"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                            {count > 0 && (
                                <span className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                    isActive ? "bg-current/10" : "bg-slate-100 text-slate-500"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 타임라인 뷰 */}
            <div className="relative border-b border-slate-100 bg-white">
                <MaterialTimelineGraph
                    category={activeTab}
                    materials={materials}
                    selectedNodeIndex={selectedNodeIndex}
                    onNodeClick={(index) => setSelectedNodeIndex(index)}
                />
            </div>

            {/* 선택된 소재 상세내역 */}
            {selectedMaterial ? (
                <div className={cn("p-4 transition-all bg-slate-50", TAB_CONFIG[activeTab].bg)}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <GradeBadge level={selectedMaterial.gradeLevel} />
                            <h4 className="text-sm font-bold text-slate-800 leading-snug">
                                {selectedMaterial.title}
                            </h4>
                        </div>
                        <button 
                            onClick={() => setSelectedNodeIndex(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3 bg-white p-3 rounded border border-slate-200">
                        {selectedMaterial.summary}
                    </p>
                    {selectedMaterial.relatedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 mt-0.5">핵심 키워드:</span>
                            {selectedMaterial.relatedKeywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 shadow-sm"
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-4 py-3 text-center bg-slate-50">
                    <p className="text-xs text-slate-500">
                        그래프의 노드를 클릭하면 상세 내역을 확인할 수 있습니다.
                    </p>
                </div>
            )}
        </div>
    );
}
