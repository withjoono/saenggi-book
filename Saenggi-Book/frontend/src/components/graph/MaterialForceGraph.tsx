import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Suspense } from 'react';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d').then(m => ({ default: m.default })));

import styles from './MaterialForceGraph.module.css';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
    EvalMaterialItem,
    CompetencyCategory,
    GRADE_LEVEL_COLORS,
    EVAL_COMPETENCY_LABELS,
    EVAL_COMPETENCY_COLORS
} from '@/types/evaluation.type';

// ==================== Types ====================

interface GraphNode {
    id: string;
    label: string;
    isCenter?: boolean;
    category?: CompetencyCategory;
    score?: number;
    gradeLevel?: number;
    summary?: string;
    originalIndex?: number;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
}

interface GraphLink {
    source: string;
    target: string;
}

interface MaterialForceGraphProps {
    category: CompetencyCategory;
    materials: EvalMaterialItem[];
    initialHeight?: number;
    onNodeClick?: (index: number) => void;
}

// ==================== Component ====================

export default function MaterialForceGraph({
    category,
    materials,
    initialHeight = 350,
    onNodeClick,
}: MaterialForceGraphProps) {
    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: initialHeight });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

    // Filter materials by category and keep original index
    const categoryMaterials = useMemo(() => {
        return materials
            .map((m, originalIndex) => ({ ...m, originalIndex }))
            .filter(m => m.category === category);
    }, [materials, category]);

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

    // Fullscreen Toggle
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

    // Data Preparation
    const graphData = useMemo(() => {
        const centerColor = EVAL_COMPETENCY_COLORS[category];
        const centerLabel = EVAL_COMPETENCY_LABELS[category];

        const centerNode: GraphNode = {
            id: `center-${category}`,
            label: centerLabel,
            isCenter: true,
            category,
            fx: 0,
            fy: 0,
        };

        const n = categoryMaterials.length;
        const leafNodes: GraphNode[] = categoryMaterials.map((mat, idx) => {
            const angle = (2 * Math.PI * idx) / Math.max(n, 1) - Math.PI / 2;
            const baseRadius = 150 + (mat.gradeLevel * 10); // Better grade = closer

            return {
                id: `mat-${category}-${idx}`,
                label: mat.title,
                isCenter: false,
                category,
                score: mat.score,
                gradeLevel: mat.gradeLevel,
                summary: mat.summary,
                originalIndex: (mat as any).originalIndex,
                x: Math.cos(angle) * baseRadius,
                y: Math.sin(angle) * baseRadius,
            };
        });

        const nodes = [centerNode, ...leafNodes];
        const links: GraphLink[] = leafNodes.map(nd => ({
            source: centerNode.id,
            target: nd.id,
        }));

        // Connect adjacent nodes lightly for organic feel
        for (let i = 0; i < leafNodes.length; i++) {
            if (i > 0) {
                links.push({
                    source: leafNodes[i - 1].id,
                    target: leafNodes[i].id,
                });
            }
            if (i === leafNodes.length - 1 && leafNodes.length > 2) {
                links.push({
                    source: leafNodes[i].id,
                    target: leafNodes[0].id,
                });
            }
        }

        return { nodes, links };
    }, [category, categoryMaterials]);

    // Graph Physics
    useEffect(() => {
        if (!graphRef.current) return;
        const fg = graphRef.current;

        fg.d3Force('charge')?.strength((d: any) => d.isCenter ? -1000 : -600);

        fg.d3Force('link')?.distance((link: any) => {
            const src = typeof link.source === 'object' ? link.source.id : link.source;
            const tgt = typeof link.target === 'object' ? link.target.id : link.target;
            if (src.includes('center') || tgt.includes('center')) {
                return 180;
            }
            return 120; // Adjacent links
        });

        // Optional: reduce strength of adjacent links to keep it star-like mostly
        fg.d3Force('link')?.strength((link: any) => {
            const src = typeof link.source === 'object' ? link.source.id : link.source;
            const tgt = typeof link.target === 'object' ? link.target.id : link.target;
            if (src.includes('center') || tgt.includes('center')) {
                return 1;
            }
            return 0.1;
        });
    }, [graphData]);

    // Zoom to fit on load
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            setTimeout(() => {
                graphRef.current?.zoomToFit(400, 60);
            }, 500);
        }
    }, [graphData, isFullscreen]);

    // Texts wrap
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

    // Canvas Node Renderer
    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isCenter = node.isCenter;
        const isHovered = hoveredNode?.id === node.id;
        const isRelated = hoveredNode?.id === `center-${category}` || (hoveredNode && node.isCenter);
        
        // Dimming effect
        let alpha = 1;
        if (hoveredNode && !isHovered && !isRelated) {
            alpha = 0.3;
        }

        const color = EVAL_COMPETENCY_COLORS[category];
        const gradeColor = node.gradeLevel ? GRADE_LEVEL_COLORS[node.gradeLevel] : color;
        
        const baseRadius = isCenter ? 24 : Math.max(12, 22 - (node.gradeLevel || 5));
        const radius = isHovered ? baseRadius * 1.1 : baseRadius;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 5 + (isHovered ? 4 : 0), 0, 2 * Math.PI);
        ctx.fillStyle = isCenter ? `${color}33` : `${gradeColor}33`;
        ctx.fill();

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isCenter ? color : gradeColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isHovered ? 3 : 1.5;
        ctx.stroke();

        // Node Text
        const maxCharsPerLine = isCenter ? 4 : 8;
        const fontSize = (isCenter ? 12 : 10) / globalScale;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        const lines = wrapText(node.label, maxCharsPerLine);
        const lineHeight = fontSize * 1.3;
        const totalH = lineHeight * lines.length;
        const startY = node.y - totalH / 2 + lineHeight / 2;

        lines.forEach((line: string, i: number) => {
            ctx.fillText(line, node.x, startY + i * lineHeight);
        });

        // Grade Badge
        if (!isCenter && node.gradeLevel) {
            const badgeSize = 8 / globalScale;
            ctx.font = `bold ${badgeSize}px sans-serif`;
            ctx.beginPath();
            ctx.arc(node.x + radius * 0.7, node.y - radius * 0.7, 10 / globalScale, 0, 2 * Math.PI);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = gradeColor;
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();
            ctx.fillStyle = gradeColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${node.gradeLevel}`, node.x + radius * 0.7, node.y - radius * 0.7);
        }

        ctx.restore();
        node.__bckgDimensions = [radius * 2, radius * 2];
    }, [category, hoveredNode]);

    // Canvas Link Renderer
    const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
        const sx = link.source?.x ?? 0;
        const sy = link.source?.y ?? 0;
        const tx = link.target?.x ?? 0;
        const ty = link.target?.y ?? 0;

        const isCenterLink = link.source?.isCenter || link.target?.isCenter;
        const color = EVAL_COMPETENCY_COLORS[category];

        let alpha = isCenterLink ? 0.6 : 0.2;
        if (hoveredNode && link.source.id !== hoveredNode.id && link.target.id !== hoveredNode.id) {
            alpha *= 0.3;
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = isCenterLink ? 2 : 1;
        if (!isCenterLink) {
            ctx.setLineDash([4, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }, [category, hoveredNode]);

    if (categoryMaterials.length === 0) {
        return (
            <div className={styles.wrapper} style={{ height: initialHeight }}>
                <div className={styles.legend}>
                    <span className={styles.legendTitle} style={{ color: EVAL_COMPETENCY_COLORS[category] }}>
                        {EVAL_COMPETENCY_LABELS[category]}
                    </span>
                </div>
                <div className={styles.emptyState}>
                    해당 역량으로 평가된 소재가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className={`${styles.wrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
            <div className={styles.legend}>
                <div className={styles.legendLeft}>
                    <span className={styles.legendTitle} style={{ color: EVAL_COMPETENCY_COLORS[category] }}>
                        {EVAL_COMPETENCY_LABELS[category]}
                    </span>
                    <span className={styles.legendHint}>{categoryMaterials.length}개의 추출된 소재</span>
                </div>
                <button className={styles.fullscreenBtn} onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {isFullscreen ? '축소' : '전체화면'}
                </button>
            </div>

            <div
                ref={containerRef}
                className={styles.graphContainer}
                style={{ height: isFullscreen ? '100%' : `${initialHeight}px` }}
            >
                <Suspense fallback={<div className="text-gray-500">그래프 로딩 중...</div>}>
                    {/* @ts-ignore */}
                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeLabel={(node: any) => node.isCenter ? '' : `<div style="padding: 8px; max-width: 250px; font-size: 13px; background: rgba(15, 23, 42, 0.9); border: 1px solid ${EVAL_COMPETENCY_COLORS[category]}; border-radius: 8px;"><div style="font-weight: bold; margin-bottom: 4px; color: ${GRADE_LEVEL_COLORS[node.gradeLevel]}">[${node.gradeLevel}등급] ${node.score}점</div>${node.summary}</div>`}
                        nodeRelSize={6}
                        linkDirectionalParticles={0}
                        backgroundColor="#0f172a"
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.3}
                        cooldownTicks={100}
                        warmupTicks={50}
                        onNodeHover={(node: any) => setHoveredNode(node || null)}
                        onNodeClick={(node: any) => {
                            if (!node.isCenter && node.originalIndex !== undefined && onNodeClick) {
                                onNodeClick(node.originalIndex);
                            }
                        }}
                        nodeCanvasObject={paintNode}
                        linkCanvasObject={paintLink}
                        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                            const radius = node.isCenter ? 24 : Math.max(12, 22 - (node.gradeLevel || 5));
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
