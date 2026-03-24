import React, { useEffect, useRef, useState, useMemo, useCallback, Suspense, lazy } from 'react';
import * as d3 from 'd3-force';
import styles from './IssueOnlyGraph.module.css';
import { MaterialItem, CompetencyCategory, COMPETENCY_COLORS, COMPETENCY_LABELS } from '@/types/analysis.type';

const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

// ==================== Types ====================

interface MaterialNode {
    id: string;
    label: string;
    category: CompetencyCategory;
    severity: 'high' | 'medium' | 'low';
    detail?: string;
    isCenter?: boolean;
    materialIndex?: number;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
}

interface MaterialLink {
    source: string;
    target: string;
}

interface MaterialGraphProps {
    materials: MaterialItem[];
    centerLabel?: string;
    initialHeight?: number;
    onMaterialClick?: (materialIndex: number) => void;
}

// ==================== Config ====================

const CENTER_COLOR = '#6366f1';
const NODE_RADIUS = 28;
const CENTER_RADIUS = 34;

const SEVERITY_LABELS: Record<string, string> = {
    high: '강',
    medium: '중',
    low: '약',
};

// ==================== Component ====================

export default function MaterialGraph({
    materials,
    centerLabel = '생기부',
    initialHeight = 500,
    onMaterialClick,
}: MaterialGraphProps) {
    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: initialHeight });
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    // 전체화면 토글
    const toggleFullscreen = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!isFullscreen) {
            if (wrapperRef.current.requestFullscreen) {
                wrapperRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [isFullscreen]);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // materials → 그래프 데이터
    const graphData = useMemo(() => {
        const centerNode: MaterialNode = {
            id: '__center__',
            label: centerLabel,
            category: 'academic',
            severity: 'high',
            isCenter: true,
            fx: 0,
            fy: 0,
        };

        const n = materials.length;
        const materialNodes: MaterialNode[] = materials.map((mat, idx) => {
            const sev = mat.severity || 'medium';
            const baseRadius = sev === 'high' ? 150 : sev === 'medium' ? 230 : 310;
            const angle = (2 * Math.PI * idx) / Math.max(n, 1) - Math.PI / 2;

            return {
                id: `mat-${idx}`,
                label: mat.title || `소재 ${idx + 1}`,
                category: mat.category || 'other',
                severity: sev,
                detail: mat.summary || '',
                materialIndex: idx,
                x: Math.cos(angle) * baseRadius,
                y: Math.sin(angle) * baseRadius,
            };
        });

        const nodes = [centerNode, ...materialNodes];
        const links: MaterialLink[] = materialNodes.map(nd => ({
            source: '__center__',
            target: nd.id,
        }));

        return { nodes, links };
    }, [materials, centerLabel]);

    // 줌핏
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            setTimeout(() => {
                graphRef.current?.zoomToFit(400, 80);
            }, 800);
        }
    }, [graphData, isFullscreen]);

    // 연결 노드 하이라이트
    const connectedSet = useMemo(() => {
        if (!hoveredId) return null;
        const set = new Set<string>();
        set.add(hoveredId);
        graphData.links.forEach(l => {
            const src = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
            const tgt = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
            if (src === hoveredId) set.add(tgt);
            if (tgt === hoveredId) set.add(src);
        });
        return set;
    }, [hoveredId, graphData.links]);

    // 물리 설정
    useEffect(() => {
        if (!graphRef.current) return;
        const fg = graphRef.current;

        fg.d3Force('charge')?.strength((nd: any) => nd.isCenter ? -2000 : -800);

        fg.d3Force('link')?.distance((link: any) => {
            const target = typeof link.target === 'object' ? link.target : null;
            if (!target) return 250;
            const sev = target.severity || 'medium';
            switch (sev) {
                case 'high': return 160;
                case 'medium': return 250;
                case 'low': return 340;
                default: return 250;
            }
        });

        fg.d3Force('link')?.strength(0.3);

        fg.d3Force('collide', d3.forceCollide()
            .radius((nd: any) => (nd.isCenter ? CENTER_RADIUS : NODE_RADIUS) + 30)
            .strength(1)
            .iterations(4)
        );
    }, [graphData]);

    // 노드 클릭
    const handleNodeClick = useCallback((node: any) => {
        if (node.isCenter || node.materialIndex === undefined) return;
        onMaterialClick?.(node.materialIndex);
    }, [onMaterialClick]);

    // 텍스트 줄바꿈
    const wrapText = (text: string, maxChars: number): string[] => {
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

    // ==================== Canvas 렌더링 ====================

    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isDimmed = connectedSet && !connectedSet.has(node.id);
        const alpha = isDimmed ? 0.15 : 1;

        const isCenter = node.isCenter;
        const color = isCenter ? CENTER_COLOR : (COMPETENCY_COLORS[node.category as CompetencyCategory] || COMPETENCY_COLORS.other);
        const radius = isCenter ? CENTER_RADIUS : NODE_RADIUS;

        ctx.save();
        ctx.globalAlpha = alpha;

        // 글로우
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}22`;
        ctx.fill();

        // 원
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 텍스트
        const maxCharsPerLine = isCenter ? 4 : 6;
        const fontSize = (isCenter ? 10 : 8.5) / globalScale;
        ctx.font = `bold ${fontSize}px 'Noto Sans KR', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        const lines = wrapText(node.label, maxCharsPerLine);
        const lineHeight = fontSize * 1.25;
        const totalH = lineHeight * lines.length;
        const startY = node.y - totalH / 2 + lineHeight / 2;

        lines.forEach((line: string, i: number) => {
            ctx.fillText(line, node.x, startY + i * lineHeight);
        });

        // 어필 강도 뱃지
        if (!isCenter && node.severity) {
            const badgeLabel = SEVERITY_LABELS[node.severity] || '';
            const badgeSize = 7 / globalScale;
            ctx.font = `bold ${badgeSize}px sans-serif`;
            ctx.beginPath();
            ctx.arc(node.x + radius * 0.7, node.y - radius * 0.7, 9 / globalScale, 0, 2 * Math.PI);
            ctx.fillStyle = isDimmed ? 'rgba(15,23,42,0.3)' : '#0f172a';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(badgeLabel, node.x + radius * 0.7, node.y - radius * 0.7);
        }

        ctx.restore();
        node.__bckgDimensions = [radius * 2, radius * 2];
    }, [connectedSet]);

    // 링크 렌더링
    const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
        const sx = link.source?.x ?? 0;
        const sy = link.source?.y ?? 0;
        const tx = link.target?.x ?? 0;
        const ty = link.target?.y ?? 0;

        const targetNode = typeof link.target === 'object' ? link.target : null;
        const category = targetNode?.category || 'other';
        const color = COMPETENCY_COLORS[category as CompetencyCategory] || COMPETENCY_COLORS.other;

        const isDimmed = connectedSet && !(connectedSet.has(link.source?.id) && connectedSet.has(link.target?.id));

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = isDimmed ? 'rgba(148,163,184,0.06)' : `${color}88`;
        ctx.lineWidth = isDimmed ? 0.5 : 2.5;
        ctx.stroke();
    }, [connectedSet]);

    if (materials.length === 0) {
        return (
            <div className={styles.emptyState}>
                <span>분석된 소재가 없습니다</span>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className={`${styles.wrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
            <div className={styles.legend}>
                <span className={styles.legendTitle}>📊 생기부 소재 관계도</span>
                <span className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ backgroundColor: CENTER_COLOR }} />
                    중심
                </span>
                {(Object.entries(COMPETENCY_COLORS) as [CompetencyCategory, string][]).map(([cat, color]) => (
                    <span key={cat} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ backgroundColor: color }} />
                        {COMPETENCY_LABELS[cat]}
                    </span>
                ))}
                <span className={styles.legendHint}>클릭하면 소재 상세 보기</span>
                <button className={styles.fullscreenBtn} onClick={toggleFullscreen} title={isFullscreen ? '축소' : '전체화면'}>
                    {isFullscreen ? '⬜ 축소' : '⛶ 전체화면'}
                </button>
            </div>

            <div
                ref={containerRef}
                className={styles.graphContainer}
                style={{ height: isFullscreen ? '100%' : `${initialHeight}px` }}
            >
                <Suspense fallback={
                    <div style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        그래프 로딩 중...
                    </div>
                }>
                    {/* @ts-ignore */}
                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeLabel=""
                        nodeRelSize={6}
                        linkDirectionalParticles={0}
                        backgroundColor="#0f172a"
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.25}
                        cooldownTicks={150}
                        warmupTicks={50}
                        onNodeHover={(node: any) => setHoveredId(node?.id || null)}
                        onNodeClick={handleNodeClick}
                        nodeCanvasObject={paintNode}
                        linkCanvasObject={paintLink}
                        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                            const radius = node.isCenter ? CENTER_RADIUS : NODE_RADIUS;
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
                            ctx.fillStyle = color;
                            ctx.fill();
                        }}
                    />
                </Suspense>
            </div>
        </div>
    );
}
