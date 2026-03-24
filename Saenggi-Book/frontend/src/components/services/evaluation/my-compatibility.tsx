import { RiskBadge } from "@/components/custom/risk-badge";
import { calculateCompatibility } from "@/lib/calculations/compatibility/score";
import { cn } from "@/lib/utils";
import { useGetSchoolRecords } from "@/stores/server/features/me/queries";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";

interface MyCompatibilityProps {
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

export const MyCompatibility = ({
  selectedSeries,
  selectedUniv,
}: MyCompatibilityProps) => {
  const { data: schoolRecord } = useGetSchoolRecords();
  const { data: staticData } = useGetStaticData();

  const calculatedCompatibility = calculateCompatibility({
    schoolRecord,
    series: selectedSeries,
    univLevel: selectedUniv.level,
    staticData,
  });

  return (
    <div className="space-y-4">
      {/* 총 위험도 */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4 text-3xl">
          <span className="font-semibold">해당 계열의 내 위험도는?</span>
          <RiskBadge risk={Math.floor(calculatedCompatibility.totalRisk)} />
        </div>
        <p className="text-foreground/60">
          <b className="text-primary">{selectedUniv.text}</b> 의{" "}
          <b className="text-primary">{selectedSeries.rowSeries}</b> 계열 종합
          위험도 점수입니다.
        </p>
      </div>

      {/* 필수 과목 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold">
          1. 필수과목({calculatedCompatibility.requiredSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2">
          <table className="w-full">
            <thead className="border-b bg-slate-200">
              <tr className="divide-x-2">
                <th className="min-w-[120px] p-2">과목</th>
                <th className="min-w-[80px] p-2">이수현황</th>
                <th className="min-w-[80px] p-2">내등급</th>
                <th className="min-w-[80px] p-2">위험도</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {calculatedCompatibility.requiredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-2 text-center">
                    🙅‍♂️ 필수과목이 없습니다.
                  </td>
                </tr>
              ) : (
                calculatedCompatibility.requiredSubjects.map((subject) => {
                  return (
                    <tr key={subject.code} className="divide-x">
                      <td className="p-2">{subject.name}</td>
                      <td
                        className={cn(
                          "p-2 font-semibold",
                          subject.myGradeAvg
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {subject.myGradeAvg ? "이수" : "미이수"}
                      </td>
                      <td className="p-2 font-semibold">
                        {subject.myGradeAvg
                          ? subject.myGradeAvg.toFixed(2)
                          : "-"}
                      </td>
                      <td className={cn("p-2 font-semibold")}>
                        <RiskBadge risk={subject.risk} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* 장려 과목 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold">
          2. 장려과목({calculatedCompatibility.encouragedSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2">
          <table className="w-full">
            <thead className="border-b bg-slate-200">
              <tr className="divide-x-2">
                <th className="min-w-[120px] p-2">과목</th>
                <th className="min-w-[80px] p-2">이수현황</th>
                <th className="min-w-[80px] p-2">내등급</th>
                <th className="min-w-[80px] p-2">위험도</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {calculatedCompatibility.encouragedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-2 text-center">
                    🙅‍♂️ 장려과목이 없습니다.
                  </td>
                </tr>
              ) : (
                calculatedCompatibility.encouragedSubjects.map((subject) => {
                  return (
                    <tr key={subject.code} className="divide-x">
                      <td className="p-2">{subject.name}</td>
                      <td
                        className={cn(
                          "p-2 font-semibold",
                          subject.myGradeAvg
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {subject.myGradeAvg ? "이수" : "미이수"}
                      </td>
                      <td className="p-2 font-semibold">
                        {subject.myGradeAvg
                          ? subject.myGradeAvg.toFixed(2)
                          : "-"}
                      </td>
                      <td className={cn("p-2 font-semibold")}>
                        <RiskBadge risk={subject.risk} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* 주요 과목 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold">
          3. 주요교과({calculatedCompatibility.mainSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr className="divide-x">
                <th className="min-w-[120px] p-2">교과</th>
                <th className="min-w-[120px] p-2">내평균등급</th>
                <th className="min-w-[120px] p-2">위험도</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {calculatedCompatibility.mainSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-2 text-center">
                    🙅‍♂️ 주요교과가 없습니다.
                  </td>
                </tr>
              ) : (
                calculatedCompatibility.mainSubjects.map((subject) => {
                  return (
                    <tr key={subject.code} className="divide-x">
                      <td className="p-2">{subject.name}</td>
                      <td className="p-2 font-semibold">
                        {subject.myGradeAvg
                          ? subject.myGradeAvg.toFixed(2)
                          : "-"}
                      </td>
                      <td className={cn("p-2 font-semibold")}>
                        <RiskBadge risk={subject.risk} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* 참조 과목 */}
      <section className="space-y-2">
        <p className="text-lg font-semibold">
          4. 참조교과({calculatedCompatibility.referenceSubjects.length})
        </p>
        <div className="overflow-x-auto pb-2">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr className="divide-x">
                <th className="min-w-[120px] p-2">교과</th>
                <th className="min-w-[120px] p-2">내평균등급</th>
                <th className="min-w-[120px] p-2">위험도</th>
              </tr>
            </thead>
            <tbody>
              {calculatedCompatibility.referenceSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-2 text-center">
                    🙅‍♂️ 참조교과가 없습니다.
                  </td>
                </tr>
              ) : (
                calculatedCompatibility.referenceSubjects.map((subject) => {
                  return (
                    <tr key={subject.code} className="divide-x">
                      <td className="p-2">{subject.name}</td>
                      <td className="p-2 font-semibold">
                        {subject.myGradeAvg
                          ? subject.myGradeAvg.toFixed(2)
                          : "-"}
                      </td>
                      <td className={cn("p-2 font-semibold")}>
                        <RiskBadge risk={subject.risk} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
