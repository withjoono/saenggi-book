import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
    EvalMaterialItem,
    CompetencyCategory,
    GRADE_LEVEL_COLORS,
} from '@/types/evaluation.type';

interface MaterialTimelineGraphProps {
    category: CompetencyCategory;
    materials: EvalMaterialItem[];
    selectedNodeIndex: number | null;
    onNodeClick: (index: number) => void;
}

export default function MaterialTimelineGraph({
    category,
    materials,
    selectedNodeIndex,
    onNodeClick,
}: MaterialTimelineGraphProps) {
    
    // 학년별로 노드를 버킷에 담음
    const buckets = useMemo(() => {
        const res: Record<number, Array<{ mat: EvalMaterialItem; originalIndex: number }>> = {
            1: [],
            2: [],
            3: [],
        };

        const legacyMaterials: Array<{ mat: EvalMaterialItem; originalIndex: number }> = [];

        materials.forEach((mat, idx) => {
            if (mat.category !== category) return;
            
            if (mat.sourceGrades && mat.sourceGrades.length > 0) {
                // 가장 높은 학년을 대표 학년으로 (예: 1, 2, 3학년에 걸쳐있다면 3학년 결과물로 배치)
                const grades = mat.sourceGrades.map(g => parseInt(g, 10)).filter(g => !isNaN(g));
                if (grades.length > 0) {
                    const maxGrade = Math.max(...grades);
                    if (maxGrade >= 1 && maxGrade <= 3) {
                        res[maxGrade].push({ mat, originalIndex: idx });
                        return;
                    }
                }
            }
            // 학년 정보가 없거나 파싱 실패한 경우
            legacyMaterials.push({ mat, originalIndex: idx });
        });

        // 과거 데이터를 1, 2, 3학년에 서사 흐름처럼 균등 분배 (가상의 플로우)
        if (legacyMaterials.length > 0) {
            legacyMaterials.forEach((item, i) => {
                const assignedGrade = Math.floor((i / legacyMaterials.length) * 3) + 1;
                res[assignedGrade].push(item);
            });
        }

        return res;
    }, [materials, category]);

    const activeCount = buckets[1].length + buckets[2].length + buckets[3].length;

    if (activeCount === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm">해당 역량의 소재가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="relative p-6 bg-slate-50 min-h-[300px]">
            {/* 수직 타임라인 구분선 */}
            <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-indigo-200 rounded-full hidden sm:block" />
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-indigo-200 rounded-full sm:hidden" />

            <div className="flex flex-col gap-8 relative z-10">
                {[1, 2, 3].map(grade => {
                    const items = buckets[grade];
                    if (items.length === 0) return null;

                    return (
                        <div key={grade} className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            {/* 학년 헤더 버블 */}
                            <div className="sm:mt-2 flex shrink-0 items-center sm:items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-indigo-100 bg-indigo-500 text-sm font-bold text-white shadow-sm ring-4 ring-white z-10">
                                    {grade}
                                </div>
                                <span className="sm:hidden font-bold text-indigo-900 text-sm">{grade}학년 과정</span>
                            </div>

                            {/* 해당 학년 소재 카드들 */}
                            <div className="flex flex-col gap-3 flex-1 ml-11 sm:ml-0">
                                {items.map(({ mat, originalIndex }) => {
                                    const isSelected = selectedNodeIndex === originalIndex;
                                    const gradeColor = GRADE_LEVEL_COLORS[mat.gradeLevel] || '#94a3b8';
                                    
                                    return (
                                        <button
                                            key={originalIndex}
                                            onClick={() => onNodeClick(originalIndex)}
                                            className={cn(
                                                "group relative flex flex-col text-left rounded-xl p-4 transition-all duration-200",
                                                "border-2 hover:-translate-y-0.5 hover:shadow-md",
                                                isSelected 
                                                    ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/20" 
                                                    : "bg-white border-slate-200 hover:border-indigo-300"
                                            )}
                                        >
                                            {/* 왼쪽 장식 선 */}
                                            <div 
                                                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md transition-colors"
                                                style={{ backgroundColor: isSelected ? gradeColor : `${gradeColor}80` }}
                                            />
                                            
                                            <div className="flex items-center gap-2 mb-1.5 ml-2">
                                                <span 
                                                    className="inline-flex items-center justify-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold"
                                                    style={{ color: gradeColor }}
                                                >
                                                    {mat.gradeLevel}등급
                                                </span>
                                                <h4 className={cn(
                                                    "text-sm font-bold",
                                                    isSelected ? "text-indigo-900" : "text-slate-700"
                                                )}>
                                                    {mat.title}
                                                </h4>
                                            </div>

                                            <div className="ml-2 mt-1">
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                    {mat.summary}
                                                </p>
                                            </div>
                                            
                                            {/* 점선 연결 UI (모바일이나 작은 화면에서 흐름 느낌을 더해주기 위해) */}
                                            {!isSelected && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] text-indigo-400 font-medium bg-indigo-50 px-2 py-1 rounded-full">
                                                        클릭하여 상세 보기
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
