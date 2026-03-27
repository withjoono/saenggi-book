import { cn } from "@/lib/utils";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { getCompatibilityWithSubject2022 } from "@/lib/utils/services/compatibility";
import { Badge } from "@/components/ui/badge";

interface SubjectRoadmapProps {
  selectedSeries: {
    grandSeries: string;
    middleSeries: string;
    rowSeries: string;
  };
  selectedUniv: {
    level: number;
    text: string;
    gradeCut: number;
  };
}

const COURSE_TYPE_MAP: Record<number, string> = {
  1: "공통과목",
  2: "일반선택",
  3: "진로선택",
  4: "융합선택",
};

export const SubjectRoadmap = ({
  selectedSeries,
  selectedUniv,
}: SubjectRoadmapProps) => {
  const { data: staticData } = useGetStaticData();

  if (!staticData) return null;

  const compatibility = getCompatibilityWithSubject2022(
    selectedSeries,
    staticData.subjects,
  );

  return (
    <div className="space-y-6">
      {/* Title & Goal */}
      <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-50 p-6 text-center border">
        <div className="text-xl font-bold">
          <span className="text-primary">{selectedSeries.rowSeries}</span> 분야 과목 로드맵
        </div>
        <p className="text-muted-foreground text-sm">
          <b className="text-primary">{selectedUniv.text}</b> 목표 등급 컷: <span className="font-semibold text-foreground text-lg">{selectedUniv.gradeCut}등급</span>
        </p>
        <p className="text-xs text-muted-foreground">
          아래 과목들을 이수하고 목표 등급을 달성하면 진학에 유리합니다.
        </p>
      </div>

      {/* 필수 이수 과목 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold flex items-center gap-2">
          <span>🎯</span> 필수 이수 과목 ({compatibility.requiredSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2 border rounded-lg">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-100/50">
              <tr className="divide-x">
                <th className="min-w-[120px] p-3 text-left font-medium text-muted-foreground">과목분류</th>
                <th className="min-w-[160px] p-3 text-left font-medium text-muted-foreground">과목명</th>
                <th className="min-w-[100px] p-3 text-center font-medium text-muted-foreground">중요도</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compatibility.requiredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">
                    지정된 필수과목이 없습니다.
                  </td>
                </tr>
              ) : (
                compatibility.requiredSubjects.map((subject) => (
                  <tr key={subject.code} className="divide-x bg-white hover:bg-slate-50">
                    <td className="p-3 text-muted-foreground">
                      {COURSE_TYPE_MAP[subject.courseType] || "기타"}
                    </td>
                    <td className="p-3 font-semibold">{subject.name}</td>
                    <td className="p-3 text-center">
                      <Badge variant="default" className="bg-red-500 hover:bg-red-600">핵심 필수</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 추천 이수 과목 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold flex items-center gap-2">
          <span>⭐</span> 추천 이수 과목 ({compatibility.encouragedSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2 border rounded-lg">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-100/50">
              <tr className="divide-x">
                <th className="min-w-[120px] p-3 text-left font-medium text-muted-foreground">과목분류</th>
                <th className="min-w-[160px] p-3 text-left font-medium text-muted-foreground">과목명</th>
                <th className="min-w-[100px] p-3 text-center font-medium text-muted-foreground">중요도</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compatibility.encouragedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">
                    지정된 추천과목이 없습니다.
                  </td>
                </tr>
              ) : (
                compatibility.encouragedSubjects.map((subject) => (
                  <tr key={subject.code} className="divide-x bg-white hover:bg-slate-50">
                    <td className="p-3 text-muted-foreground">
                      {COURSE_TYPE_MAP[subject.courseType] || "기타"}
                    </td>
                    <td className="p-3 font-semibold">{subject.name}</td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">권장 이수</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 주요 교과 가이드 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold flex items-center gap-2">
          <span>📚</span> 전공 관련 주요 교과 ({compatibility.mainSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2 border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-100/50">
              <tr className="divide-x border-b">
                <th className="min-w-[160px] p-3 text-left font-medium text-muted-foreground">교과군</th>
                <th className="min-w-[160px] p-3 text-center font-medium text-muted-foreground">목표 내신 편차</th>
                <th className="min-w-[100px] p-3 text-center font-medium text-muted-foreground">권장 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compatibility.mainSubjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">
                    지정된 주요교과가 없습니다.
                  </td>
                </tr>
              ) : (
                compatibility.mainSubjects.map((subject) => (
                  <tr key={subject.code} className="divide-x bg-white hover:bg-slate-50">
                    <td className="p-3 font-semibold">{subject.name}</td>
                    <td className="p-3 text-center font-medium text-primary">
                      {selectedUniv.gradeCut} 이내
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">핵심 관리</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 참조 교과 가이드 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold flex items-center gap-2">
          <span>📖</span> 전공 관련 참조 교과 ({compatibility.referenceSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2 border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-100/50">
              <tr className="divide-x border-b">
                <th className="min-w-[160px] p-3 text-left font-medium text-muted-foreground">교과군</th>
                <th className="min-w-[160px] p-3 text-center font-medium text-muted-foreground">목표 내신 편차</th>
                <th className="min-w-[100px] p-3 text-center font-medium text-muted-foreground">권장 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compatibility.referenceSubjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">
                    지정된 참조교과가 없습니다.
                  </td>
                </tr>
              ) : (
                compatibility.referenceSubjects.map((subject) => (
                  <tr key={subject.code} className="divide-x bg-white hover:bg-slate-50">
                    <td className="p-3 font-semibold">{subject.name}</td>
                    <td className="p-3 text-center font-medium text-primary">
                      {(selectedUniv.gradeCut + 0.5).toFixed(1)} 이내
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-slate-600 bg-slate-50">일반 관리</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
