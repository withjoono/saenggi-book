import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { publicClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/sb/_layout/topic-graph")({
  component: TopicGraphPage,
});

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

function TopicGraphPage() {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [papersTotal, setPapersTotal] = useState(0);
  const [papersPage, setPapersPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");

  const fetchPapers = useCallback(async (searchQuery: string, page: number) => {
    if (page === 1) setLoading(true);
    else setMoreLoading(true);
    try {
      const { data } = await publicClient.get("/science-on/articles", {
        params: { query: searchQuery, page, per_page: 10 },
      });
      const payload = data?.data;
      if (page === 1) {
        setPapers(payload?.results ?? []);
        setSearched(true);
        setSearchedQuery(searchQuery);
      } else {
        setPapers((prev) => [...prev, ...(payload?.results ?? [])]);
      }
      setPapersTotal(payload?.total ?? 0);
      setPapersPage(page);
    } catch {
      toast.error("논문 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    await fetchPapers(query.trim(), 1);
  }, [query, fetchPapers]);

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
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
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          검색
        </Button>
      </div>

      {/* 결과 */}
      {!searched ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <BookOpen className="h-12 w-12 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            주제를 검색하면 관련 국내 논문이 나타납니다
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
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : papers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <BookOpen className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            "{searchedQuery}"에 대한 국내 논문이 없습니다
          </p>
          <p className="text-xs text-gray-400">다른 키워드로 검색해보세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Science ON 검색 결과{" "}
            <span className="font-medium text-foreground">
              {papersTotal.toLocaleString()}편
            </span>{" "}
            중 {papers.length}편
          </p>
          {papers.map((paper, idx) => (
            <div
              key={paper.id || idx}
              className="rounded-xl border bg-card p-4 space-y-2"
            >
              <p className="font-medium text-sm leading-snug">{paper.titleKo}</p>
              {paper.titleEn && paper.titleEn !== paper.titleKo && (
                <p className="text-xs text-muted-foreground italic leading-snug">
                  {paper.titleEn}
                </p>
              )}
              {paper.abstract && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  {paper.abstract}
                </p>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border/50 gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  {(paper.authors?.length ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground/80 truncate">
                      {paper.authors!.slice(0, 3).join(", ")}
                      {paper.authors!.length > 3 &&
                        ` 외 ${paper.authors!.length - 3}인`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60">
                    {paper.year ?? "연도 미상"}
                    {paper.journal ? ` · ${paper.journal}` : ""}
                  </p>
                </div>
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                    원문 보기
                  </a>
                )}
              </div>
            </div>
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
        </div>
      )}
    </div>
  );
}
