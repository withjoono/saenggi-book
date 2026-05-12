import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { publicClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Loader2, BookOpen, Network, Maximize2, X,
  ArrowLeft, ChevronRight, FileText,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/sb/_layout/topic-graph")({
  component: TopicGraphPage,
});

// ── 타입 ──────────────────────────────────────────────────────────────────────
interface HierarchyItem { id: string; label: string; }

interface TopicResult {
  id: string;
  label: string;
  labelEn?: string;
  worksCount: number;
  domain: HierarchyItem;
  field: HierarchyItem;
  subfield: HierarchyItem;
  keywords?: string[];
  description?: string;
}

interface GraphNode {
  id: string;
  label: string;
  labelEn?: string;
  type: "domain" | "field" | "subfield" | "topic" | "sibling";
  worksCount?: number;
  description?: string;
  keywords?: string[];
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: "hierarchy" | "sibling";
}

// ── 상수 ──────────────────────────────────────────────────────────────────────
const NODE_COLORS: Record<GraphNode["type"], string> = {
  domain:   "#1e3a5f",
  field:    "#2563eb",
  subfield: "#16a34a",
  topic:    "#dc2626",
  sibling:  "#9ca3af",
};

const NODE_RADIUS: Record<GraphNode["type"], number> = {
  domain:   12,
  field:    9,
  subfield: 8,
  topic:    10,
  sibling:  6,
};

const NODE_LABELS: Record<GraphNode["type"], string> = {
  domain:   "대분야",
  field:    "분야",
  subfield: "세부분야",
  topic:    "주제",
  sibling:  "연관주제",
};

// ── 검색 결과 → 그래프 변환 ────────────────────────────────────────────────────
function buildSearchGraph(results: TopicResult[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenNodes = new Set<string>();
  const seenEdges = new Set<string>();

  const addNode = (node: GraphNode) => {
    if (!seenNodes.has(node.id)) { seenNodes.add(node.id); nodes.push(node); }
  };
  const addEdge = (e: GraphEdge) => {
    const key = `${e.source}->${e.target}`;
    if (!seenEdges.has(key)) { seenEdges.add(key); edges.push(e); }
  };

  for (const r of results) {
    const dom = typeof r.domain === "string"
      ? { id: r.domain as string, label: r.domain as string }
      : (r.domain ?? { id: "unknown", label: "" });
    const fld = typeof r.field === "string"
      ? { id: r.field as string, label: r.field as string }
      : (r.field ?? { id: "unknown", label: "" });
    const sub = typeof r.subfield === "string"
      ? { id: r.subfield as string, label: r.subfield as string }
      : (r.subfield ?? { id: "unknown", label: "" });

    if (!dom.id || !fld.id || !sub.id || !r.id) continue;

    addNode({ id: dom.id, label: dom.label ?? "", type: "domain" });
    addNode({ id: fld.id, label: fld.label ?? "", type: "field" });
    addNode({ id: sub.id, label: sub.label ?? "", type: "subfield" });
    addNode({
      id: r.id, label: r.label ?? "", labelEn: r.labelEn, type: "topic",
      worksCount: r.worksCount, keywords: r.keywords, description: r.description,
    });
    addEdge({ source: dom.id, target: fld.id, type: "hierarchy" });
    addEdge({ source: fld.id, target: sub.id, type: "hierarchy" });
    addEdge({ source: sub.id, target: r.id,   type: "hierarchy" });
  }

  return { nodes, edges };
}

// ── edge source/target 정규화 (ForceGraph2D가 내부적으로 객체로 변환) ────────────
function resolveId(val: string | { id: string }): string {
  return typeof val === "object" ? val.id : val;
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
function TopicGraphPage() {
  const graphRef     = useRef<ForceGraphMethods<GraphNode, GraphEdge>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery]                 = useState("");
  const [searchResults, setSearchResults] = useState<TopicResult[]>([]);
  const [graphData, setGraphData]         = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [selected, setSelected]           = useState<GraphNode | null>(null);
  const [mode, setMode]                   = useState<"idle" | "search" | "detail">("idle");
  const [searchLoading, setSearchLoading] = useState(false);
  const [graphLoading, setGraphLoading]   = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [canvasSize, setCanvasSize]       = useState({ width: 0, height: 0 });

  // ── 컨테이너 크기 추적 (ResizeObserver) ─────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── 선택 노드의 직계 하위 항목 (graphData 내 edges 기반) ─────────────────────
  const childNodes = useMemo((): GraphNode[] => {
    if (!selected || !graphData) return [];
    const childIds = new Set(
      graphData.edges
        .filter((e) => resolveId(e.source as any) === selected.id && e.type === "hierarchy")
        .map((e) => resolveId(e.target as any))
    );
    return graphData.nodes.filter((n) => childIds.has(n.id));
  }, [selected, graphData]);

  // ── force 파라미터 ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!graphData || !graphRef.current) return;
    const fg = graphRef.current as any;
    const isSearch = mode === "search";
    fg.d3Force("charge")?.strength(isSearch ? -600 : -400);
    fg.d3Force("link")?.distance(isSearch ? 160 : 120);
    fg.d3Force("center")?.strength(0.05);
  }, [graphData, mode]);

  // ── 전체화면 전환 시 그래프 재조정 ────────────────────────────────────────────
  useEffect(() => {
    if (!graphRef.current) return;
    const timer = setTimeout(() => graphRef.current?.zoomToFit(400, 60), 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // ── 검색 ──────────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setGraphData(null);
    setSelected(null);
    setSearchResults([]);
    try {
      const { data } = await publicClient.get("/open-alex/concepts", {
        params: { search: query, perPage: 25 },
      });
      const results: TopicResult[] = data?.data?.results ?? [];
      setSearchResults(results);
      if (results.length > 0) {
        setGraphData(buildSearchGraph(results));
      }
      setMode("search");
    } catch {
      toast.error("검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setMode("idle");
    } finally {
      setSearchLoading(false);
    }
  }, [query]);

  // ── 주제 상세 그래프 로드 ──────────────────────────────────────────────────────
  const loadGraph = useCallback(async (topicId: string) => {
    setGraphLoading(true);
    setGraphData(null);
    setSelected(null);
    try {
      const { data } = await publicClient.get(`/open-alex/concepts/${topicId}/graph`);
      const payload = data?.data;
      if (payload) {
        setGraphData({ nodes: payload.nodes, edges: payload.edges });
        setMode("detail");
      } else {
        toast.error("상세 그래프 데이터를 불러올 수 없습니다.");
      }
    } catch {
      toast.error("상세 그래프를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setGraphLoading(false);
    }
  }, []);

  // ── 검색 결과 그래프로 복귀 ─────────────────────────────────────────────────────
  const backToSearch = useCallback(() => {
    if (searchResults.length === 0) return;
    setGraphData(buildSearchGraph(searchResults));
    setMode("search");
    setSelected(null);
  }, [searchResults]);

  // ── 그래프 노드 클릭 → 오른쪽 패널에 표시 ─────────────────────────────────────
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelected(node);
    graphRef.current?.centerAt(node.x ?? 0, node.y ?? 0, 400);
    graphRef.current?.zoom(2.5, 400);
  }, []);

  // ── 패널 내 하위 항목 클릭 ────────────────────────────────────────────────────
  const handleChildClick = useCallback((child: GraphNode) => {
    setSelected(child);
    graphRef.current?.centerAt(child.x ?? 0, child.y ?? 0, 400);
    graphRef.current?.zoom(2.5, 400);
    if (child.type === "topic" || child.type === "sibling") {
      loadGraph(child.id);
    }
  }, [loadGraph]);

  const isLoading = searchLoading || graphLoading;
  const hasGraph  = !!graphData && !isLoading;

  // ── 캔버스 높이 ───────────────────────────────────────────────────────────────
  const canvasStyle = isFullscreen
    ? undefined
    : { height: graphData ? 560 : 200 } as React.CSSProperties;

  return (
    <div className="flex flex-col gap-4">
      {/* ── 헤더 ── */}
      <div className="flex items-center gap-2">
        <Network className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">수행평가 주제 탐색</h1>
      </div>

      {/* ── 검색창 ── */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="주제 검색 (예: 기후변화, 인공지능, 세계사)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 min-w-[200px] max-w-lg"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {searchLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Search className="h-4 w-4" />
          }
          검색
        </Button>
        {mode === "detail" && searchResults.length > 0 && (
          <Button variant="outline" onClick={backToSearch} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4" />
            검색 결과로
          </Button>
        )}
      </div>

      {/* ── 듀얼 패널 ── */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 flex flex-col lg:flex-row bg-background"
            : "flex flex-col lg:flex-row gap-3"
        }
      >
        {/* ── 좌: 그래프 캔버스 ───────────────────────────────────── */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border bg-slate-950 shadow-inner flex-1"
          style={canvasStyle}
        >
          {/* 범례 — graphData 있을 때만 */}
          {graphData && (
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-lg bg-black/50 px-3 py-2 text-xs text-white pointer-events-none">
              {(Object.entries(NODE_COLORS) as [GraphNode["type"], string][]).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  <span>{NODE_LABELS[type]}</span>
                </div>
              ))}
              <p className="mt-1 border-t border-white/20 pt-1 text-[10px] text-white/50">
                노드 클릭 → 오른쪽에서 탐색
              </p>
            </div>
          )}

          {/* 전체화면 토글 */}
          <div className="absolute right-3 top-3 z-10">
            {isFullscreen ? (
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-3 w-3" /> 닫기
              </button>
            ) : hasGraph && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                <Maximize2 className="h-3 w-3" /> 전체화면
              </button>
            )}
          </div>

          {/* 로딩 오버레이 */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/80">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="text-sm text-slate-300">
                {searchLoading ? "검색 중…" : "그래프 불러오는 중…"}
              </p>
            </div>
          )}

          {/* 빈 상태 */}
          {!isLoading && !graphData && (
            <div className="flex h-full items-center justify-center text-slate-400" style={{ minHeight: 180 }}>
              {mode === "search" ? (
                <div className="text-center">
                  <Network className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm">"{query}"에 대한 검색 결과가 없습니다</p>
                  <p className="text-xs mt-1 opacity-60">다른 키워드로 검색해보세요</p>
                </div>
              ) : (
                <div className="text-center">
                  <Network className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm">위에서 주제를 검색하면 지식 그래프가 나타납니다</p>
                </div>
              )}
            </div>
          )}

          {/* 그래프 */}
          {hasGraph && (
            <ForceGraph2D
              ref={graphRef}
              width={canvasSize.width || undefined}
              height={canvasSize.height || undefined}
              graphData={{ nodes: graphData!.nodes, links: graphData!.edges }}
              nodeId="id"
              linkSource="source"
              linkTarget="target"
              backgroundColor="#020617"
              nodeColor={(node) => NODE_COLORS[(node as GraphNode).type] ?? "#6b7280"}
              nodeVal={(node) => NODE_RADIUS[(node as GraphNode).type] ?? 8}
              nodeLabel={(node) => {
                const n = node as GraphNode;
                return n.labelEn && n.labelEn !== n.label
                  ? `${n.label} (${n.labelEn})`
                  : n.label;
              }}
              linkColor={(link) =>
                (link as GraphEdge).type === "sibling" ? "#4b5563" : "#374151"
              }
              linkWidth={(link) =>
                (link as GraphEdge).type === "hierarchy" ? 2 : 1
              }
              linkDirectionalParticles={(link) =>
                (link as GraphEdge).type === "hierarchy" ? 2 : 0
              }
              linkDirectionalParticleSpeed={0.004}
              d3AlphaDecay={0.015}
              d3VelocityDecay={0.25}
              onEngineStop={() => graphRef.current?.zoomToFit(400, 60)}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const n = node as GraphNode;
                const r = NODE_RADIUS[n.type] ?? 8;
                const color = NODE_COLORS[n.type] ?? "#6b7280";
                const isSelected = selected?.id === n.id;

                // 선택 글로우
                if (isSelected) {
                  ctx.beginPath();
                  ctx.arc(node.x!, node.y!, r + 5, 0, 2 * Math.PI);
                  ctx.fillStyle = "rgba(255,255,255,0.12)";
                  ctx.fill();
                }

                // 노드 원
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();

                // 선택 테두리
                if (isSelected) {
                  ctx.strokeStyle = "#ffffff";
                  ctx.lineWidth = 2.5;
                  ctx.stroke();
                }

                // 레이블
                if (globalScale >= 0.4) {
                  const fontSize = Math.min(5, 14 / globalScale);
                  ctx.font = `${isSelected ? "bold " : ""}${fontSize}px sans-serif`;
                  ctx.fillStyle = isSelected ? "#ffffff" : "#e2e8f0";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";
                  const raw = n.label ?? "";
                  const label = raw.length > 18 ? raw.slice(0, 18) + "…" : raw;
                  ctx.fillText(label, node.x!, node.y! + r + 2);
                }
              }}
            />
          )}
        </div>

        {/* ── 우: 탐색 패널 ──────────────────────────────────────── */}
        {!isFullscreen && (
          <div className="w-full lg:w-72 shrink-0 rounded-xl border bg-background shadow-sm flex flex-col overflow-hidden"
            style={{ height: graphData ? 560 : undefined, minHeight: 200 }}
          >
            {selected ? (
              // 선택된 노드 상세 + 하위 항목
              <>
                <div className="p-4 border-b flex items-start justify-between gap-2 shrink-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: NODE_COLORS[selected.type] }}
                      />
                      <span className="text-xs text-muted-foreground">{NODE_LABELS[selected.type]}</span>
                    </div>
                    <h2 className="font-semibold text-sm leading-tight line-clamp-2">
                      {selected.label}
                    </h2>
                    {selected.labelEn && selected.labelEn !== selected.label && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">{selected.labelEn}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                    title="닫기"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {/* 설명 */}
                    {selected.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selected.description}
                      </p>
                    )}

                    {/* 논문 수 */}
                    {(selected.worksCount ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm rounded-md bg-muted/50 px-3 py-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>관련 논문 <strong>{selected.worksCount!.toLocaleString()}</strong>편</span>
                      </div>
                    )}

                    {/* 키워드 */}
                    {(selected.keywords?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">키워드</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.keywords!.map((k) => (
                            <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 하위 항목 리스트 */}
                    {childNodes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          하위 항목
                          <span className="ml-1 text-muted-foreground/60">({childNodes.length})</span>
                        </p>
                        <div className="flex flex-col gap-0.5">
                          {childNodes.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleChildClick(child)}
                              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted transition-colors group"
                            >
                              <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{ background: NODE_COLORS[child.type] }}
                              />
                              <span className="flex-1 min-w-0 truncate text-sm">{child.label}</span>
                              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 상세 그래프 버튼 */}
                    {(selected.type === "topic" || selected.type === "sibling") && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => loadGraph(selected.id)}
                        disabled={graphLoading}
                      >
                        {graphLoading
                          ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                          : <Network className="h-3 w-3 mr-1.5" />
                        }
                        이 주제 상세 그래프 보기
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : mode === "search" && searchResults.length > 0 ? (
              // 검색 결과 목록
              <>
                <div className="p-4 border-b shrink-0">
                  <p className="text-sm font-medium">
                    검색 결과
                    <span className="ml-1.5 text-muted-foreground font-normal">
                      {searchResults.length}개
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    항목을 클릭하면 상세 그래프를 볼 수 있습니다
                  </p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {searchResults.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => loadGraph(r.id)}
                        className="flex items-start gap-3 w-full rounded-md p-2 text-left hover:bg-muted transition-colors group"
                      >
                        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight">{r.label}</p>
                          {r.labelEn && r.labelEn !== r.label && (
                            <p className="text-xs text-muted-foreground/70 italic">{r.labelEn}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {[r.domain?.label, r.field?.label, r.subfield?.label]
                              .filter(Boolean)
                              .join(" › ")}
                          </p>
                          {r.worksCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              논문 {r.worksCount.toLocaleString()}편
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              // 안내 상태
              <div className="flex flex-col items-center justify-center flex-1 px-4 py-10 text-center text-muted-foreground">
                <Network className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">주제를 탐색해보세요</p>
                <p className="text-xs mt-1.5 opacity-70 leading-relaxed">
                  검색 후 그래프의 노드를 클릭하면<br />
                  관련 항목과 상세 정보가 여기에 표시됩니다
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
