import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { publicClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, BookOpen, Network, Maximize2, X, List, ArrowLeft } from "lucide-react";

export const Route = createLazyFileRoute("/sb/_layout/topic-graph")({
  component: TopicGraphPage,
});

// ── 타입 ─────────────────────────────────────────────────────────────────────
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

// ── 상수 ─────────────────────────────────────────────────────────────────────
const NODE_COLORS: Record<GraphNode["type"], string> = {
  domain: "#1e3a5f",
  field: "#2563eb",
  subfield: "#16a34a",
  topic: "#dc2626",
  sibling: "#9ca3af",
};

const NODE_RADIUS: Record<GraphNode["type"], number> = {
  domain: 12,
  field: 9,
  subfield: 8,
  topic: 10,
  sibling: 6,
};

const NODE_LABELS: Record<GraphNode["type"], string> = {
  domain: "대분야",
  field: "분야",
  subfield: "세부분야",
  topic: "주제",
  sibling: "연관주제",
};

// ── 검색 결과 → 그래프 변환 ───────────────────────────────────────────────────
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
    // domain/field/subfield: 신형 {id,label} 또는 구형 string 모두 처리
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
    addEdge({ source: sub.id, target: r.id, type: "hierarchy" });
  }

  return { nodes, edges };
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────
function TopicGraphPage() {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphEdge>>();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TopicResult[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [source, setSource] = useState<string>("");
  const [mode, setMode] = useState<"idle" | "search" | "detail">("idle");

  const [searchLoading, setSearchLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showList, setShowList] = useState(false);

  // force 파라미터 — 검색 모드는 넓게, 상세 모드는 촘촘하게
  useEffect(() => {
    if (!graphData || !graphRef.current) return;
    const fg = graphRef.current as any;
    const isSearch = mode === "search";
    fg.d3Force("charge")?.strength(isSearch ? -600 : -400);
    fg.d3Force("link")?.distance(isSearch ? 160 : 120);
    fg.d3Force("center")?.strength(0.05);
  }, [graphData, mode]);

  // 전체화면 전환 시 재조정
  useEffect(() => {
    if (!graphRef.current) return;
    const timer = setTimeout(() => graphRef.current?.zoomToFit(400, 60), 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // ── 검색 → 즉시 그래프 표시
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setGraphData(null);
    setSelected(null);
    setSearchResults([]);
    setShowList(false);
    try {
      const { data } = await publicClient.get("/open-alex/concepts", {
        params: { search: query, perPage: 25 },
      });
      const results: TopicResult[] = data?.data?.results ?? [];
      setSearchResults(results);
      if (results.length > 0) {
        setGraphData(buildSearchGraph(results));
        setSource("search");
        setMode("search");
      }
    } catch (err) {
      console.error("[topic-graph] 검색 실패:", err);
    } finally {
      setSearchLoading(false);
    }
  }, [query]);

  // ── 주제 상세 그래프 로드
  const loadGraph = useCallback(async (topicId: string) => {
    setGraphLoading(true);
    setGraphData(null);
    setSelected(null);
    setShowList(false);
    try {
      const { data } = await publicClient.get(`/open-alex/concepts/${topicId}/graph`);
      const payload = data?.data;
      if (payload) {
        setGraphData({ nodes: payload.nodes, edges: payload.edges });
        setSource(payload.source ?? "");
        setMode("detail");
      }
    } catch (err) {
      console.error("[topic-graph] 그래프 로드 실패:", err);
    } finally {
      setGraphLoading(false);
    }
  }, []);

  // ── 검색 결과 그래프로 돌아가기
  const backToSearch = useCallback(() => {
    if (searchResults.length === 0) return;
    setGraphData(buildSearchGraph(searchResults));
    setSource("search");
    setMode("search");
    setSelected(null);
  }, [searchResults]);

  // ── 노드 클릭
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelected(node);
    graphRef.current?.centerAt(node.x ?? 0, node.y ?? 0, 400);
    graphRef.current?.zoom(2.5, 400);
    if (node.type === "topic" || node.type === "sibling") {
      loadGraph(node.id);
    }
  }, [loadGraph]);

  const isDetailMode = mode === "detail";

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Network className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">수행평가 주제 탐색</h1>
      </div>

      {/* 검색창 */}
      <div className="flex gap-2">
        <Input
          placeholder="주제 검색 (예: 기후변화, 인공지능, 세계사)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-md"
        />
        <Button onClick={handleSearch} disabled={searchLoading || graphLoading}>
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          검색
        </Button>
        {/* 상세 모드에서 검색 결과로 복귀 */}
        {isDetailMode && searchResults.length > 0 && (
          <Button variant="outline" onClick={backToSearch}>
            <ArrowLeft className="h-4 w-4" />
            검색 결과
          </Button>
        )}
        {/* 목록 토글 */}
        {searchResults.length > 0 && (
          <Button variant="ghost" size="icon" onClick={() => setShowList(v => !v)} title="목록 보기">
            <List className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 검색 결과 수 / 안내 */}
      {mode === "search" && searchResults.length > 0 && (
        <p className="text-sm text-muted-foreground">
          검색 결과 <strong>{searchResults.length}개</strong> · 빨간 주제 노드를 클릭하면 상세 그래프로 이동합니다
        </p>
      )}

      {/* 목록 패널 (토글) */}
      {showList && searchResults.length > 0 && (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
            {searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => { loadGraph(r.id); setShowList(false); }}
                className="flex items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted"
              >
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  {r.labelEn && r.labelEn !== r.label && (
                    <p className="text-xs text-muted-foreground/70 italic">{r.labelEn}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {[r.domain.label, r.field.label, r.subfield.label].join(" › ")}
                    {r.worksCount > 0 && ` · 논문 ${r.worksCount.toLocaleString()}편`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 그래프 영역 */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 bg-slate-950"
            : "relative overflow-hidden rounded-xl border bg-slate-950 shadow-inner"
        }
        style={isFullscreen ? undefined : { height: 580 }}
      >
        {/* 범례 */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-lg bg-black/50 px-3 py-2 text-xs text-white">
          {(Object.entries(NODE_COLORS) as [GraphNode["type"], string][]).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: color }} />
              <span>{NODE_LABELS[type]}</span>
            </div>
          ))}
        </div>

        {/* 우상단 */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {source === "search" && (
            <Badge variant="secondary" className="text-xs">🔍 검색 결과 그래프</Badge>
          )}
          {source === "neo4j" && (
            <Badge variant="default" className="text-xs">📦 Neo4j</Badge>
          )}
          {(source === "openalex" || source === "openalex-only") && (
            <Badge variant="secondary" className="text-xs">🌐 OpenAlex</Badge>
          )}
          {isFullscreen ? (
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-3 w-3" />
              돌아가기
            </button>
          ) : (
            graphData && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
                전체화면
              </button>
            )
          )}
        </div>

        {/* 로딩 */}
        {(graphLoading || searchLoading) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/80">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-sm text-slate-300">
              {searchLoading ? "검색 중…" : "그래프 로드 중…"}
            </p>
          </div>
        )}

        {/* 빈 상태 */}
        {!graphLoading && !searchLoading && !graphData && (
          <div className="flex h-full items-center justify-center text-slate-400">
            <div className="text-center">
              <Network className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">위에서 주제를 검색하면 지식 그래프가 나타납니다</p>
            </div>
          </div>
        )}

        {/* 그래프 */}
        {graphData && !graphLoading && !searchLoading && (
          <ForceGraph2D
            ref={graphRef}
            graphData={{ nodes: graphData.nodes, links: graphData.edges }}
            nodeId="id"
            linkSource="source"
            linkTarget="target"
            backgroundColor="#020617"
            nodeColor={(node) => NODE_COLORS[(node as GraphNode).type] ?? "#6b7280"}
            nodeVal={(node) => NODE_RADIUS[(node as GraphNode).type] ?? 8}
            nodeLabel={(node) => {
              const n = node as GraphNode;
              return n.labelEn && n.labelEn !== n.label ? `${n.label} (${n.labelEn})` : n.label;
            }}
            linkColor={(link) => (link as GraphEdge).type === "sibling" ? "#4b5563" : "#374151"}
            linkWidth={(link) => (link as GraphEdge).type === "hierarchy" ? 2 : 1}
            linkDirectionalParticles={(link) => (link as GraphEdge).type === "hierarchy" ? 2 : 0}
            linkDirectionalParticleSpeed={0.004}
            d3AlphaDecay={0.015}
            d3VelocityDecay={0.25}
            onEngineStop={() => graphRef.current?.zoomToFit(400, 60)}
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const n = node as GraphNode;
              const r = NODE_RADIUS[n.type] ?? 8;
              const color = NODE_COLORS[n.type] ?? "#6b7280";

              ctx.beginPath();
              ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();

              if (selected?.id === n.id) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.stroke();
              }

              if (globalScale >= 0.5) {
                const fontSize = Math.min(5, 14 / globalScale);
                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillStyle = "#f1f5f9";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                const maxLen = 18;
                const raw = n.label ?? "";
                const label = raw.length > maxLen ? raw.slice(0, maxLen) + "…" : raw;
                ctx.fillText(label, node.x!, node.y! + r + 2);
              }
            }}
          />
        )}
      </div>

      {/* 선택된 노드 상세 */}
      {selected && (
        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: NODE_COLORS[selected.type] }} />
            <span className="text-xs text-muted-foreground">{NODE_LABELS[selected.type]}</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold">{selected.label}</h2>
          {selected.labelEn && selected.labelEn !== selected.label && (
            <p className="text-sm text-muted-foreground italic">{selected.labelEn}</p>
          )}
          {selected.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{selected.description}</p>
          )}
          {selected.worksCount != null && (
            <p className="mt-1 text-sm">관련 논문 <strong>{selected.worksCount.toLocaleString()}</strong>편</p>
          )}
          {selected.keywords && selected.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selected.keywords.map((k) => (
                <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
              ))}
            </div>
          )}
          {(selected.type === "topic" || selected.type === "sibling") && (
            <Button size="sm" className="mt-3" onClick={() => loadGraph(selected.id)}>
              이 주제 상세 그래프 보기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
