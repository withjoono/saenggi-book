import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { publicClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Loader2, BookOpen, Network, Maximize2, X, ExternalLink,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/sb/_layout/topic-graph")({
  component: TopicGraphPage,
});

// ── 타입 ──────────────────────────────────────────────────────────────────────
interface PaperItem {
  id: string;
  titleKo: string;
  titleEn?: string;
  abstract?: string;
  authors: string[];
  journal?: string;
  publisher?: string;
  year?: number;
  url?: string;
}

type NodeType = "root" | "journal" | "year" | "paper";

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  paper?: PaperItem;
  count?: number;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── 상수 ──────────────────────────────────────────────────────────────────────
const NODE_COLORS: Record<NodeType, string> = {
  root:    "#2563eb",
  journal: "#16a34a",
  year:    "#9333ea",
  paper:   "#dc2626",
};

const NODE_RADIUS: Record<NodeType, number> = {
  root:    16,
  journal: 10,
  year:    8,
  paper:   6,
};

const NODE_LABELS: Record<NodeType, string> = {
  root:    "검색어",
  journal: "학술지",
  year:    "연도",
  paper:   "논문",
};

// ── 논문 목록 → 그래프 변환 ────────────────────────────────────────────────────
function buildPaperGraph(query: string, papers: PaperItem[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const rootId = "root";
  nodes.push({ id: rootId, label: query, type: "root" });

  // 저널별 그룹화
  const journalMap = new Map<string, PaperItem[]>();
  for (const paper of papers) {
    const journal = paper.journal?.trim() || "기타";
    if (!journalMap.has(journal)) journalMap.set(journal, []);
    journalMap.get(journal)!.push(paper);
  }

  // 저널이 너무 많으면 상위 N개 + 나머지 묶기
  const MAX_JOURNALS = 8;
  const sortedJournals = [...journalMap.entries()].sort((a, b) => b[1].length - a[1].length);

  const topJournals = sortedJournals.slice(0, MAX_JOURNALS);
  const etcPapers = sortedJournals.slice(MAX_JOURNALS).flatMap(([, ps]) => ps);
  if (etcPapers.length > 0) {
    topJournals.push(["기타 학술지", etcPapers]);
  }

  for (const [journal, jPapers] of topJournals) {
    const jid = `journal-${journal}`;
    nodes.push({ id: jid, label: journal, type: "journal", count: jPapers.length });
    edges.push({ source: rootId, target: jid });

    for (const paper of jPapers) {
      const pid = `paper-${paper.id}`;
      const title = paper.titleKo?.length > 20
        ? paper.titleKo.slice(0, 20) + "…"
        : paper.titleKo;
      nodes.push({ id: pid, label: title, type: "paper", paper });
      edges.push({ source: jid, target: pid });
    }
  }

  return { nodes, edges };
}

function resolveId(val: string | { id: string }): string {
  return typeof val === "object" ? val.id : val;
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
function TopicGraphPage() {
  const graphRef     = useRef<ForceGraphMethods<GraphNode, GraphEdge>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery]               = useState("");
  const [papers, setPapers]             = useState<PaperItem[]>([]);
  const [papersTotal, setPapersTotal]   = useState(0);
  const [papersPage, setPapersPage]     = useState(1);
  const [graphData, setGraphData]       = useState<GraphData | null>(null);
  const [selected, setSelected]         = useState<GraphNode | null>(null);
  const [loading, setLoading]           = useState(false);
  const [moreLoading, setMoreLoading]   = useState(false);
  const [searched, setSearched]         = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasSize, setCanvasSize]     = useState({ width: 0, height: 0 });
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);

  // 컨테이너 크기 추적
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

  // force 파라미터
  useEffect(() => {
    if (!graphData || !graphRef.current) return;
    const fg = graphRef.current as any;
    fg.d3Force("charge")?.strength(-500);
    fg.d3Force("link")?.distance((link: any) => {
      const srcId = resolveId(link.source);
      const tgtId = resolveId(link.target);
      if (srcId === "root" || tgtId === "root") return 180;
      if (tgtId.startsWith("paper-")) return 100;
      return 140;
    });
    fg.d3Force("center")?.strength(0.05);
  }, [graphData]);

  // 전체화면 전환 시 재조정
  useEffect(() => {
    if (!graphRef.current) return;
    const timer = setTimeout(() => graphRef.current?.zoomToFit(400, 60), 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // 선택 노드의 직계 하위 논문
  const childPapers = useMemo((): GraphNode[] => {
    if (!selected || !graphData) return [];
    if (selected.type === "root") {
      return graphData.nodes.filter(n => n.type === "journal");
    }
    if (selected.type === "journal") {
      const childIds = new Set(
        graphData.edges
          .filter(e => resolveId(e.source as any) === selected.id)
          .map(e => resolveId(e.target as any))
      );
      return graphData.nodes.filter(n => childIds.has(n.id));
    }
    return [];
  }, [selected, graphData]);

  const fetchPapers = useCallback(async (searchQuery: string, page: number) => {
    if (page === 1) setLoading(true);
    else setMoreLoading(true);
    try {
      const { data } = await publicClient.get("/science-on/articles", {
        params: { query: searchQuery, page, per_page: 20 },
      });
      const payload = data?.data;
      const results: PaperItem[] = payload?.results ?? [];
      if (page === 1) {
        setPapers(results);
        setSearched(true);
        setSearchedQuery(searchQuery);
        setGraphData(results.length > 0 ? buildPaperGraph(searchQuery, results) : null);
        setSelected(null);
      } else {
        setPapers(prev => {
          const next = [...prev, ...results];
          setGraphData(buildPaperGraph(searchedQuery, next));
          return next;
        });
      }
      setPapersTotal(payload?.total ?? 0);
      setPapersPage(page);
    } catch {
      toast.error("논문 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  }, [searchedQuery]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    await fetchPapers(query.trim(), 1);
  }, [query, fetchPapers]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelected(node);
    graphRef.current?.centerAt(node.x ?? 0, node.y ?? 0, 400);
    graphRef.current?.zoom(2.5, 400);
  }, []);

  const hasGraph = !!graphData && !loading;
  const canvasStyle = isFullscreen
    ? undefined
    : { height: graphData ? 540 : 200 } as React.CSSProperties;

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Network className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">수행평가 주제 탐색</h1>
      </div>

      {/* 검색창 */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="주제 검색 (예: 기후변화, 인공지능, 세계사)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 min-w-[200px] max-w-lg"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Search className="h-4 w-4" />
          }
          검색
        </Button>
      </div>

      {/* 듀얼 패널: 그래프 + 사이드 패널 */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 flex flex-col lg:flex-row bg-background"
            : "flex flex-col lg:flex-row gap-3"
        }
      >
        {/* 좌: 그래프 캔버스 */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-inner flex-1 ring-1 ring-slate-200/60"
          style={canvasStyle}
        >
          {/* 범례 */}
          {graphData && (
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-lg bg-white/95 border border-gray-200 shadow-sm px-3 py-2 text-xs text-gray-700 pointer-events-none">
              {(Object.entries(NODE_COLORS) as [NodeType, string][]).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span>{NODE_LABELS[type]}</span>
                </div>
              ))}
              <p className="mt-1 border-t border-gray-200 pt-1 text-[10px] text-gray-400">
                노드 클릭 → 오른쪽에서 탐색
              </p>
            </div>
          )}

          {/* 전체화면 토글 */}
          <div className="absolute right-3 top-3 z-10">
            {isFullscreen ? (
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-xs text-gray-700 hover:bg-black/20 transition-colors"
              >
                <X className="h-3 w-3" /> 닫기
              </button>
            ) : hasGraph && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-xs text-gray-700 hover:bg-black/20 transition-colors"
              >
                <Maximize2 className="h-3 w-3" /> 전체화면
              </button>
            )}
          </div>

          {/* 로딩 오버레이 */}
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/90">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <p className="text-sm text-gray-500">지식 그래프 생성 중…</p>
            </div>
          )}

          {/* 빈 상태 */}
          {!loading && !graphData && (
            <div className="flex h-full items-center justify-center" style={{ minHeight: 180 }}>
              {searched ? (
                <div className="text-center text-gray-400">
                  <Network className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm">"{searchedQuery}"에 대한 결과가 없습니다</p>
                  <p className="text-xs mt-1 opacity-60">다른 키워드로 검색해보세요</p>
                </div>
              ) : (
                <div className="text-center px-6">
                  <Network className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">주제를 검색하면 지식 그래프가 나타납니다</p>
                  <p className="text-xs text-gray-400 mt-2">예시 키워드</p>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-1.5">
                    {["기후변화", "인공지능", "양자역학", "진화론", "세계사"].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setQuery(kw)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full transition-colors"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
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
              backgroundColor="#ffffff"
              linkColor={() => "#94a3b8"}
              linkWidth={1.2}
              linkDirectionalParticles={(link) =>
                resolveId((link as GraphEdge).source as any) === "root" ? 2 : 0
              }
              linkDirectionalParticleSpeed={0.004}
              d3AlphaDecay={0.015}
              d3VelocityDecay={0.25}
              onEngineStop={() => graphRef.current?.zoomToFit(400, 60)}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const n = node as GraphNode;
                const r = NODE_RADIUS[n.type] ?? 6;
                const color = NODE_COLORS[n.type] ?? "#6b7280";
                const isSelected = selected?.id === n.id;

                if (isSelected) {
                  ctx.beginPath();
                  ctx.arc(node.x!, node.y!, r + 6, 0, 2 * Math.PI);
                  ctx.fillStyle = `${color}33`;
                  ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();

                ctx.strokeStyle = isSelected ? "#1f2937" : "rgba(0,0,0,0.18)";
                ctx.lineWidth = isSelected ? 2.5 : 1;
                ctx.stroke();

                if (globalScale >= 0.35) {
                  const fontSize = Math.min(5, 13 / globalScale);
                  ctx.font = `${isSelected ? "bold " : ""}${fontSize}px sans-serif`;
                  ctx.fillStyle = isSelected ? "#111111" : "#374151";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";
                  const raw = n.label ?? "";
                  const label = raw.length > 16 ? raw.slice(0, 16) + "…" : raw;
                  ctx.fillText(label, node.x!, node.y! + r + 2);
                }
              }}
              nodePointerAreaPaint={(node, color, ctx) => {
                const r = NODE_RADIUS[(node as GraphNode).type] ?? 6;
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, r + 4, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
              }}
            />
          )}
        </div>

        {/* 우: 탐색 패널 */}
        {!isFullscreen && (
          <div
            className="w-full lg:w-72 shrink-0 rounded-xl border bg-background shadow-sm flex flex-col overflow-hidden"
            style={{ height: graphData ? 540 : undefined, minHeight: 200 }}
          >
            {selected ? (
              <>
                <div className="p-4 border-b flex items-start justify-between gap-2 shrink-0">
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mb-1"
                      style={{
                        background: `${NODE_COLORS[selected.type]}22`,
                        color: NODE_COLORS[selected.type],
                      }}
                    >
                      {NODE_LABELS[selected.type]}
                    </span>
                    <p className="text-sm font-semibold leading-snug line-clamp-3">{selected.label}</p>
                    {selected.type === "journal" && selected.count !== undefined && (
                      <p className="text-xs text-muted-foreground mt-0.5">{selected.count}편 수록</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {selected.type === "paper" && selected.paper && (
                      <PaperDetail paper={selected.paper} />
                    )}

                    {(selected.type === "root" || selected.type === "journal") && childPapers.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {selected.type === "root" ? "학술지 목록" : "수록 논문"}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {childPapers.map(child => (
                            <button
                              key={child.id}
                              onClick={() => {
                                setSelected(child);
                                graphRef.current?.centerAt(child.x ?? 0, child.y ?? 0, 400);
                                graphRef.current?.zoom(2.5, 400);
                              }}
                              className="text-left text-xs px-2.5 py-2 rounded-lg border hover:bg-muted/50 transition-colors leading-snug"
                            >
                              <span className="font-medium">{child.label}</span>
                              {child.type === "journal" && child.count !== undefined && (
                                <span className="text-muted-foreground ml-1">({child.count}편)</span>
                              )}
                              {child.type === "paper" && child.paper?.year && (
                                <span className="text-muted-foreground ml-1">({child.paper.year})</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="p-4 border-b shrink-0">
                  <p className="text-sm font-semibold">사용 방법</p>
                  <p className="text-xs text-muted-foreground mt-0.5">3단계로 논문 주제를 탐색해보세요</p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium">키워드 검색</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        관심 있는 주제를 검색하면 관련 국내 논문이 지식 그래프로 나타납니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium">그래프에서 노드 클릭</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        학술지(초록) 또는 논문(빨간) 노드를 클릭하면 상세 정보가 표시됩니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium">원문 논문 확인</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        논문 노드 클릭 후 "원문 보기"로 Science ON에서 전체 논문을 확인하세요.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">노드 색상 안내</p>
                    <div className="flex flex-col gap-1.5">
                      {(Object.entries(NODE_COLORS) as [NodeType, string][]).map(([type, color]) => (
                        <div key={type} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                          <span className="text-muted-foreground">{NODE_LABELS[type]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 논문 목록 */}
      {searched && !loading && (
        <div className="flex flex-col gap-3">
          {papers.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Science ON 검색 결과{" "}
                <span className="font-medium text-foreground">
                  {papersTotal.toLocaleString()}편
                </span>{" "}
                중 {papers.length}편
              </p>
              {papers.map((paper, idx) => (
                <PaperCard
                  key={paper.id || idx}
                  paper={paper}
                  expanded={expandedPaper === (paper.id || String(idx))}
                  onToggle={() =>
                    setExpandedPaper(prev =>
                      prev === (paper.id || String(idx)) ? null : (paper.id || String(idx))
                    )
                  }
                />
              ))}
              {papers.length < papersTotal && (
                <button
                  onClick={() => fetchPapers(searchedQuery, papersPage + 1)}
                  disabled={moreLoading}
                  className="w-full text-sm text-muted-foreground hover:text-foreground py-3 border rounded-xl hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
                >
                  {moreLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      불러오는 중…
                    </>
                  ) : (
                    `더 보기 (${papers.length}/${papersTotal.toLocaleString()})`
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <BookOpen className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                "{searchedQuery}"에 대한 국내 논문이 없습니다
              </p>
              <p className="text-xs text-gray-400">다른 키워드로 검색해보세요</p>
            </div>
          )}
        </div>
      )}

      {/* 초기 상태 */}
      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <BookOpen className="h-12 w-12 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            주제를 검색하면 지식 그래프와 관련 국내 논문이 나타납니다
          </p>
          <p className="text-xs text-gray-400">예시 키워드</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {["기후변화", "인공지능", "양자역학", "진화론", "세계사"].map((kw) => (
              <button
                key={kw}
                onClick={() => setQuery(kw)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 논문 상세 (사이드 패널용) ──────────────────────────────────────────────────
function PaperDetail({ paper }: { paper: PaperItem }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold leading-snug">{paper.titleKo}</p>
        {paper.titleEn && paper.titleEn !== paper.titleKo && (
          <p className="text-xs text-muted-foreground italic mt-0.5 leading-snug">{paper.titleEn}</p>
        )}
      </div>
      {(paper.authors?.length ?? 0) > 0 && (
        <p className="text-xs text-muted-foreground">
          {paper.authors!.slice(0, 3).join(", ")}
          {paper.authors!.length > 3 && ` 외 ${paper.authors!.length - 3}인`}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {paper.year ?? "연도 미상"}
        {paper.journal ? ` · ${paper.journal}` : ""}
      </p>
      {paper.abstract && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
          {paper.abstract}
        </p>
      )}
      {paper.url && (
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
        >
          <ExternalLink className="h-3 w-3" />
          원문 보기 (Science ON)
        </a>
      )}
    </div>
  );
}

// ── 논문 카드 (목록용) ─────────────────────────────────────────────────────────
function PaperCard({
  paper,
  expanded,
  onToggle,
}: {
  paper: PaperItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <button className="w-full text-left space-y-1.5" onClick={onToggle}>
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm leading-snug flex-1">{paper.titleKo}</p>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          }
        </div>
        {paper.titleEn && paper.titleEn !== paper.titleKo && (
          <p className="text-xs text-muted-foreground italic leading-snug">{paper.titleEn}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {(paper.authors?.length ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground/80">
              {paper.authors!.slice(0, 2).join(", ")}
              {paper.authors!.length > 2 && ` 외 ${paper.authors!.length - 2}인`}
            </span>
          )}
          <span className="text-xs text-muted-foreground/60">
            {paper.year ?? "연도 미상"}
            {paper.journal ? ` · ${paper.journal}` : ""}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="pt-2 border-t border-border/50 space-y-2">
          {paper.abstract && (
            <p className="text-xs text-muted-foreground leading-relaxed">{paper.abstract}</p>
          )}
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <ExternalLink className="h-3 w-3" />
              원문 보기 (Science ON)
            </a>
          )}
        </div>
      )}
    </div>
  );
}
