import { RiskBadge } from "@/components/custom/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CalculateSeriesEvaluationResponse } from "@/types/series-evaluation.type";

interface SeriesEvaluationResultProps {
  result: CalculateSeriesEvaluationResponse;
}

export function SeriesEvaluationResult({
  result,
}: SeriesEvaluationResultProps) {
  const getOverallEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case "안전":
        return "text-green-600";
      case "주의":
        return "text-yellow-600";
      case "위험":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case "우수":
        return "text-blue-600";
      case "적합":
        return "text-green-600";
      case "주의":
        return "text-yellow-600";
      case "위험":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* 종합 평가 */}
      <Card>
        <CardHeader>
          <CardTitle>계열 적합성 종합 평가</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">대학</p>
              <p className="text-lg font-semibold">{result.universityName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">계열</p>
              <p className="text-lg font-semibold">
                {result.seriesType === "humanities" ? "문과" : "이과"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold">총 위험도</span>
              <RiskBadge risk={result.totalRiskScore} />
            </div>
            <p
              className={cn(
                "text-3xl font-bold",
                getOverallEvaluationColor(result.overallEvaluation)
              )}
            >
              {result.overallEvaluation}
            </p>
          </div>

          {result.improvementNeeded.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-800">개선 필요 과목</p>
              <p className="text-sm text-red-700">
                {result.improvementNeeded.join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이과: 필수 과목 */}
      {result.seriesType === "science" && result.requiredSubjects && result.requiredSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>필수 과목</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">과목명</th>
                    <th className="p-3 text-center">수강 여부</th>
                    <th className="p-3 text-center">내 등급</th>
                    <th className="p-3 text-center">평가</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.requiredSubjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{subject.subjectName}</td>
                      <td className="p-3 text-center">
                        {subject.taken ? (
                          <span className="inline-block rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-800">
                            수강함
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-800">
                            미수강
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold">
                        {subject.studentGrade ? subject.studentGrade.toFixed(1) : "-"}
                      </td>
                      <td
                        className={cn(
                          "p-3 text-center font-semibold",
                          subject.evaluation ? getEvaluationColor(subject.evaluation) : "text-gray-400"
                        )}
                      >
                        {subject.evaluation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이과: 필수 과목 없음 안내 */}
      {result.seriesType === "science" && (!result.requiredSubjects || result.requiredSubjects.length === 0) && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-slate-600">필수 과목 없음</p>
          </CardContent>
        </Card>
      )}

      {/* 이과: 권장 과목 */}
      {result.seriesType === "science" && result.recommendedSubjects && result.recommendedSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>권장 과목</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">과목명</th>
                    <th className="p-3 text-center">수강 여부</th>
                    <th className="p-3 text-center">내 등급</th>
                    <th className="p-3 text-center">평가</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.recommendedSubjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{subject.subjectName}</td>
                      <td className="p-3 text-center">
                        {subject.taken ? (
                          <span className="inline-block rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-800">
                            수강함
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-sm font-semibold text-yellow-800">
                            미수강
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold">
                        {subject.studentGrade ? subject.studentGrade.toFixed(1) : "-"}
                      </td>
                      <td
                        className={cn(
                          "p-3 text-center font-semibold",
                          subject.evaluation ? getEvaluationColor(subject.evaluation) : "text-gray-400"
                        )}
                      >
                        {subject.evaluation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이과: 권장 과목 없음 안내 */}
      {result.seriesType === "science" && (!result.recommendedSubjects || result.recommendedSubjects.length === 0) && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-slate-600">권장 과목 없음</p>
          </CardContent>
        </Card>
      )}

      {/* 문과: 주요교과 */}
      {result.seriesType === "humanities" && result.requiredSubjects && result.requiredSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>주요교과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">교과명</th>
                    <th className="p-3 text-center">내 등급평균</th>
                    <th className="p-3 text-center">평가</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.requiredSubjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{subject.subjectName}</td>
                      <td className="p-3 text-center font-semibold">
                        {subject.studentGrade ? subject.studentGrade.toFixed(1) : "-"}
                      </td>
                      <td
                        className={cn(
                          "p-3 text-center font-semibold",
                          subject.evaluation ? getEvaluationColor(subject.evaluation) : "text-gray-400"
                        )}
                      >
                        {subject.evaluation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 참조교과 (교과별 평균등급) */}
      <Card>
        <CardHeader>
          <CardTitle>참조교과 (교과별 평균등급)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-100">
                <tr>
                  <th className="p-3 text-left">교과</th>
                  <th className="p-3 text-center">내 등급평균</th>
                  <th className="p-3 text-center">평가</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.subjectEvaluations.map((subject, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-medium">{subject.subjectName}</td>
                    <td className="p-3 text-center font-semibold">
                      {subject.studentGrade.toFixed(1)}
                    </td>
                    <td
                      className={cn(
                        "p-3 text-center font-semibold",
                        getEvaluationColor(subject.evaluation)
                      )}
                    >
                      {subject.evaluation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">평가 기준</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 md:grid-cols-4">
              <div>
                <span className="font-semibold text-blue-600">우수:</span> 권장 등급 이상
              </div>
              <div>
                <span className="font-semibold text-green-600">적합:</span> 차이 0.5 이하
              </div>
              <div>
                <span className="font-semibold text-yellow-600">주의:</span> 차이 0.5~1.5
              </div>
              <div>
                <span className="font-semibold text-red-600">위험:</span> 차이 1.5 초과
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
