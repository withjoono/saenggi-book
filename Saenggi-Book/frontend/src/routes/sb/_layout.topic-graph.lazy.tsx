import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { publicClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, BookOpen, Network } from "lucide-react";

export const Route = createLazyFileRoute("/sb/_layout/topic-graph")({
  component: TopicGraphPage,
});

// ── 타입 ─────────────────────────────────────────────────────────────────────
interface TopicResult {
  id: string;
  label: string;
  worksCount: number;
  domain?: string;
  field?: string;
  subfield?: string;
  keywords?: string[];
}

interface GraphNode {
  id: string;
  label: string;
  type: "domain" | "field" | "subfield" | "topic" | "sibling";
  worksCount?: number;
  description?: string;
  keywords?: string[];
  // force-graph 내부 위치 (런타임에 추가됨)
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: "hierarchy" | "sibling";
}

// ── 색상 ─────────────────────────────────────────────────────────────────────
const NODE_COLORS: Record<GraphNode["type"], string> = {
  domain: "#1e3a5f",
  field: "#2563eb",
  subfield: "#16a34a",
  topic: "#dc2626",
  sibling: "#9ca3af",
};

const NODE_RADIUS: Record<GraphNode["type"], number> = {
  domain: 10,
  field: 8,
  subfield: 7,
  topic: 9,
  sibling: 5,
};

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────
function TopicGraphPage() {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphEdge>>();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TopicResult[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [source, setSource] = useState<string>("");

  const [searchLoading, setSearchLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);

  // 그래프 데이터 변경 시 force 재설정
  useEffect(() => {
    if (!graphData || !graphRef.current) return;
    const fg = graphRef.current as any;
    fg.d3Force("charge")?.strength(-400);
    fg.d3Force("link")?.distance(120);
    fg.d3Force("center")?.strength(0.05);
  }, [graphData]);

  // 검색
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const { data } = await publicClient.get("/open-alex/concepts", {
        params: { search: query, perPage: 10 },
      });
      setSearchResults(data?.data?.results ?? []);
    } catch (err) {
      console.error("[topic-graph] 검색 실패:", err);
    } finally {
      setSearchLoading(false);
    }
  }, [query]);

  // 그래프 로드
  const loadGraph = useCallback(async (topicId: string) => {
    setGraphLoading(true);
    setGraphData(null);
    setSelected(null);
    setSearchResults([]);
    try {
      const { data } = await publicClient.get(`/open-alex/concepts/${topicId}/graph`);
      const payload = data?.data;
      if (payload) {
        setGraphData({ nodes: payload.nodes, edges: payload.edges });
        setSource(payload.source ?? "");
      }
    } catch (err) {
      console.error("[topic-graph] 그래프 로드 실패:", err);
    } finally {
      setGraphLoading(false);
    }
  }, []);

  // 노드 클릭
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelected(node);
    graphRef.current?.centerAt(node.x ?? 0, node.y ?? 0, 400);
    graphRef.current?.zoom(2, 400);

    // topic 클릭 시 하위 그래프 로드
    if (node.type === "topic" || node.type === "sibling") {
      loadGraph(node.id);
    }
  }, [loadGraph]);

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
        <Button onClick={handleSearch} disabled={searchLoading}>
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          검색
        </Button>
      </div>

      {/* 검색 결과 목록 */}
      {searchResults.length > 0 && (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="mb-2 text-sm text-muted-foreground">주제를 클릭하면 그래프를 불러옵니다</p>
          <div className="flex flex-col gap-1">
            {searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => loadGraph(r.id)}
                className="flex items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted"
              >
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {[r.domain, r.field, r.subfield].filter(Boolean).join(" › ")}
                    {r.worksCount > 0 && ` · 논문 ${r.worksCount.toLocaleString()}편`}
                  </p>
                  {r.keywords && r.keywords.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.keywords.slice(0, 4).map((k) => (
                        <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 그래프 영역 */}
      <div className="relative overflow-hidden rounded-xl border bg-slate-950 shadow-inner" style={{ height: 560 }}>
        {/* 범례 */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-lg bg-black/50 px-3 py-2 text-xs text-white">
          {(Object.entries(NODE_COLORS) as [GraphNode["type"], string][]).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: color }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>

        {/* source 배지 */}
        {source && (
          <div className="absolute right-3 top-3 z-10">
            <Badge variant={source === "neo4j" ? "default" : "secondary"} className="text-xs">
              {source === "neo4j" ? "📦 Neo4j" : "🌐 OpenAlex API"}
            </Badge>
          </div>
        )}

        {/* 로딩 */}
        {graphLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {/* 빈 상태 */}
        {!graphLoading && !graphData && (
          <div className="flex h-full items-center justify-center text-slate-400">
            <div className="text-center">
              <Network className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">위에서 주제를 검색하고 클릭하세요</p>
            </div>
          </div>
        )}

        {/* 그래프 */}
        {graphData && !graphLoading && (
          <ForceGraph2D
            ref={graphRef}
            graphData={{ nodes: graphData.nodes, links: graphData.edges }}
            nodeId="id"
            linkSource="source"
            linkTarget="target"
            backgroundColor="#020617"
            nodeColor={(node) => NODE_COLORS[(node as GraphNode).type] ?? "#6b7280"}
            nodeVal={(node) => NODE_RADIUS[(node as GraphNode).type] ?? 8}
            nodeLabel={(node) => (node as GraphNode).label}
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

              // 원
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();

              // 선택된 노드 강조
              if (selected?.id === n.id) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.stroke();
              }

              // 라벨 (zoom 1 이하에서만 표시)
              if (globalScale >= 0.6) {
                const fontSize = Math.min(4, 12 / globalScale);
                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillStyle = "#f1f5f9";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const maxLen = 22;
                const label = n.label.length > maxLen ? n.label.slice(0, maxLen) + "…" : n.label;
                ctx.fillText(label, node.x!, node.y! + r + fontSize + 1);
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
            <span className="text-xs uppercase text-muted-foreground">{selected.type}</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold">{selected.label}</h2>
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
              이 주제로 그래프 보기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
