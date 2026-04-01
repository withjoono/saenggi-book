import React, { useEffect, useRef, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { CompetencyTimeline as ICompetencyTimeline, COMPETENCY_COLORS, COMPETENCY_LABELS, CompetencyCategory } from "@/types/analysis.type";

const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

interface Props {
    data: ICompetencyTimeline | null;
    category: CompetencyCategory;
    isLoading?: boolean;
}

export default function CompetencyFlowGraph({ data, category, isLoading }: Props) {
    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
    
    // ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setDimensions({ width: Math.floor(width), height: Math.floor(height) });
                }
            }
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const graphData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };
        
        const nodes = (data.nodes || []).map(n => ({
            id: n.id,
            label: n.materialTitle,
            grade: String(n.grade).replace(/[^1-3]/g, '') || '?',
            summary: n.summary,
            // Custom radius for collision
            val: 20
        }));

        const links = (data.edges || []).map((e, idx) => ({
            id: `link-${idx}`,
            source: e.source,
            target: e.target,
            reason: e.reason,
        }));

        return { nodes, links };
    }, [data]);

    // Zoom to fit on load
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            setTimeout(() => {
                graphRef.current?.zoomToFit(400, 50);
            }, 800);
        }
    }, [graphData]);

    // Tweak Physics
    useEffect(() => {
        if (!graphRef.current) return;
        const fg = graphRef.current;
        fg.d3Force('charge')?.strength(-1200);
        fg.d3Force('link')?.distance(80);
        fg.d3ReheatSimulation();
    }, [graphData, dimensions]);

    const wrapText = (text: string, maxChars: number): string[] => {
        if (!text) return [];
        if (text.length <= maxChars) return [text];
        const lines: string[] = [];
        let remaining = text;
        while (remaining.length > 0) {
            if (remaining.length <= maxChars) {
                lines.push(remaining);
                break;
            }
            lines.push(remaining.substring(0, maxChars));
            remaining = remaining.substring(maxChars);
            if (lines.length >= 3) {
                lines[lines.length - 1] = lines[lines.length - 1].substring(0, maxChars - 1) + '…';
                break;
            }
        }
        return lines;
    };

    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const color = COMPETENCY_COLORS[category] || '#6366f1';
        const nodeWidth = 76;
        const nodeHeight = 26;
        const x = node.x - nodeWidth / 2;
        const y = node.y - nodeHeight / 2;

        // --- SWIMLANE BACKGROUND (Independent of Node Alpha) ---
        const siblings = graphData.nodes.filter(n => n.grade === node.grade);
        const minXNode = siblings.reduce((minN, n) => ((n as any).x || 0) < ((minN as any).x || 0) ? n : minN, siblings[0]);

        if (minXNode && minXNode.id === node.id) {
            ctx.save();
            const yLine = node.y - 45; // 경계선을 노드들 약간 위에 렌더링

            // 긴 가로 점선
            ctx.beginPath();
            ctx.moveTo(-3000, yLine);
            ctx.lineTo(3000, yLine);
            ctx.strokeStyle = `${color}40`; 
            ctx.setLineDash([6 / globalScale, 6 / globalScale]);
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();
            
            // 중앙 'N학년' 뱃지
            const txt = `${node.grade}학년`;
            ctx.font = `bold 13px 'Noto Sans KR', sans-serif`;
            const tw = ctx.measureText(txt).width + 20;
            const th = 22;

            ctx.beginPath();
            ctx.roundRect(-tw / 2, yLine - th / 2, tw, th, th / 2);
            ctx.fillStyle = '#f8fafc'; // 배경색 매칭
            ctx.fill();
            ctx.strokeStyle = `${color}60`;
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(txt, 0, yLine);
            ctx.restore();
        }

        // --- NODE DRAWING ---
        const isHovered = hoveredNodeId === node.id || (!hoveredNodeId && !hoveredLinkId);
        const alpha = isHovered ? 1 : 0.2;
        
        ctx.save();
        ctx.globalAlpha = alpha;

        // Card shadow
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        // Card background
        ctx.beginPath();
        ctx.roundRect(x, y, nodeWidth, nodeHeight, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();

        ctx.shadowColor = 'transparent'; // reset shadow

        // Title text (Centered directly)
        ctx.font = `bold ${8 / globalScale}px 'Noto Sans KR', sans-serif`;
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = wrapText(node.label, 9);
        const lineHeight = (8 / globalScale) * 1.3;
        const totalH = lineHeight * lines.length;
        const startY = node.y - totalH / 2 + lineHeight / 2;

        lines.forEach((line: string, i: number) => {
            ctx.fillText(line, node.x, startY + i * lineHeight);
        });

        ctx.restore();
        node.__bckgDimensions = [nodeWidth, nodeHeight]; // For pointer interaction
    }, [category, hoveredNodeId, hoveredLinkId]);

    const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
        const isHovered = hoveredLinkId === link.id || (!hoveredLinkId && !hoveredNodeId);
        const alpha = isHovered ? 1 : 0.15;
        
        const sx = link.source?.x ?? 0;
        const sy = link.source?.y ?? 0;
        const tx = link.target?.x ?? 0;
        const ty = link.target?.y ?? 0;
        
        const color = COMPETENCY_COLORS[category] || '#6366f1';

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = color;
        ctx.lineWidth = (isHovered && hoveredLinkId === link.id ? 2.5 : 1.5) / Math.max(1, 1); // fixed scale roughly
        ctx.stroke();
        ctx.restore();
    }, [category, hoveredLinkId, hoveredNodeId]);

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

    if (!data) return null;

    const storyline = data.overall_storyline || (data as any).overallStoryline;

    // 현재 호버된 요소의 상세 정보
    const hoveredNode = graphData.nodes.find(n => n.id === hoveredNodeId);
    const hoveredLink = graphData.links.find(l => l.id === hoveredLinkId);

    return (
        <div className="w-full space-y-6">
            <div className="relative w-full rounded-2xl border bg-white p-6 shadow-sm md:p-8" style={{ borderColor: `${COMPETENCY_COLORS[category]}40` }}>
                
                {graphData.nodes.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-gray-500 text-center px-4">
                        {storyline || "해당 카테고리의 뚜렷한 서사 라인이 파악되지 않았습니다."}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 스토리라인 요약글 */}
                        {storyline && (
                            <div 
                                className="rounded-xl border p-5 leading-relaxed shadow-sm text-gray-800"
                                style={{ backgroundColor: `${COMPETENCY_COLORS[category]}10`, borderColor: `${COMPETENCY_COLORS[category]}30` }}
                            >
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold" style={{ color: COMPETENCY_COLORS[category] }}>
                                    <span className="text-xl">✨</span> 3년 성장 스토리라인 (Timeline Graph)
                                </h3>
                                <p className="text-sm sm:text-base whitespace-pre-wrap font-medium">
                                    {storyline}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col items-center text-sm text-gray-500">
                            <span>드래그하여 이동하고 스크롤로 줌 인/아웃 할 수 있습니다. 노드나 연결선에 마우스를 올리면 상세 서사가 나타납니다.</span>
                        </div>
                        
                        {/* 차트 영역 */}
                        <div className="flex flex-col md:flex-row gap-4 h-[500px]">
                            {/* 왼쪽: 그래프 캔버스 */}
                            <div 
                                ref={containerRef} 
                                className="flex-1 rounded-xl overflow-hidden bg-gray-50 border relative"
                                style={{ borderColor: `${COMPETENCY_COLORS[category]}30` }}
                            >
                                <Suspense fallback={<div className="flex w-full h-full items-center justify-center text-gray-400">Loading Map...</div>}>
                                    <ForceGraph2D
                                        ref={graphRef}
                                        width={dimensions.width}
                                        height={dimensions.height}
                                        graphData={graphData}
                                        dagMode="td"
                                        dagLevelDistance={140}
                                        backgroundColor="#f8fafc"
                                        nodeRelSize={1}
                                        linkDirectionalArrowLength={6}
                                        linkDirectionalArrowRelPos={1}
                                        onNodeHover={(node: any) => setHoveredNodeId(node?.id || null)}
                                        onLinkHover={(link: any) => setHoveredLinkId(link?.id || null)}
                                        nodeCanvasObject={paintNode}
                                        linkCanvasObject={paintLink}
                                        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                                            const w = node.__bckgDimensions?.[0] || 70;
                                            const h = node.__bckgDimensions?.[1] || 35;
                                            ctx.fillStyle = color;
                                            ctx.fillRect(node.x - w / 2, node.y - h / 2, w, h);
                                        }}
                                        linkPointerAreaPaint={(link: any, color: string, ctx: CanvasRenderingContext2D) => {
                                            const sx = link.source?.x ?? 0;
                                            const sy = link.source?.y ?? 0;
                                            const tx = link.target?.x ?? 0;
                                            const ty = link.target?.y ?? 0;
                                            ctx.strokeStyle = color;
                                            ctx.lineWidth = 15;
                                            ctx.beginPath();
                                            ctx.moveTo(sx, sy);
                                            ctx.lineTo(tx, ty);
                                            ctx.stroke();
                                        }}
                                    />
                                </Suspense>
                            </div>

                            {/* 오른쪽: 상세 서사 패널 */}
                            <div className="w-full md:w-80 flex flex-col gap-4">
                                <div 
                                    className="flex-1 rounded-xl border bg-white p-5 shadow-sm transition-all overflow-y-auto"
                                    style={{ borderColor: `${COMPETENCY_COLORS[category]}40` }}
                                >
                                    {!hoveredNode && !hoveredLink ? (
                                        <div className="flex h-full flex-col items-center justify-center text-gray-400 text-center gap-3">
                                            <span className="text-3xl">👈</span>
                                            <span>원하는 요소에<br/>마우스를 올려보세요</span>
                                        </div>
                                    ) : hoveredNode ? (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="inline-block rounded bg-indigo-50 px-2 flex py-1 text-xs font-bold text-indigo-700 mb-3">
                                                {hoveredNode.grade}학년 활동
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                                                {hoveredNode.label}
                                            </h4>
                                            <div className="h-px w-full bg-gray-100 my-4" />
                                            <p className="text-sm leading-relaxed text-gray-700">
                                                {hoveredNode.summary}
                                            </p>
                                        </div>
                                    ) : hoveredLink ? (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xl">💡</span>
                                                <h4 className="text-[17px] font-bold text-gray-900 leading-tight">
                                                    성장 서사 연결고리
                                                </h4>
                                            </div>
                                            <div className="h-px w-full bg-gray-100 mb-4" />
                                            <p className="font-medium text-[15px] leading-relaxed" style={{ color: COMPETENCY_COLORS[category] }}>
                                                "{hoveredLink.reason}"
                                            </p>
                                            <div className="mt-8 flex flex-col gap-3 opacity-70">
                                                <div className="text-xs bg-gray-50 rounded p-2 border truncate">
                                                    [이전] {(hoveredLink.source as any)?.label ?? "Source"}
                                                </div>
                                                <div className="text-center text-gray-400">↓</div>
                                                <div className="text-xs bg-gray-50 rounded p-2 border truncate">
                                                    [다음] {(hoveredLink.target as any)?.label ?? "Target"}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
