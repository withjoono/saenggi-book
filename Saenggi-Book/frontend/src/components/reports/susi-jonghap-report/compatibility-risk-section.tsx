import React from "react";
import { RiskBadge } from "@/components/custom/risk-badge";
import { cn } from "@/lib/utils";
import {
  ICalculatedCompatibility,
  ICalculatedMainSubject,
  ICalculatedSubject,
} from "@/types/compatibility.type";
import { IExploreSusiJonghapDetailResponse } from "@/stores/server/features/explore/susi-jonghap/interfaces";

interface CompatibilityRiskSectionProps {
  susiJonghap: IExploreSusiJonghapDetailResponse;
  calculatedCompatibility?: ICalculatedCompatibility;
  userName: string;
}

export const CompatibilityRiskSection = ({
  susiJonghap,
  calculatedCompatibility,
  userName,
}: CompatibilityRiskSectionProps) => {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 items-center gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-4 border-l-4 border-primary pl-2 text-xl md:text-2xl">
            <span className="font-semibold">계열 적합성 위험도</span>
            <RiskBadge
              risk={Math.floor(calculatedCompatibility?.totalRisk || 10)}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-foreground/60 md:text-base">
              <b className="text-primary">{userName}</b>님의{" "}
              <b className="text-primary">
                {susiJonghap.university.name} -{" "}
              </b>{" "}
              <b className="text-primary">
                {susiJonghap.fields.minor?.name}
              </b>{" "}
              계열 적합성 위험도입니다.
            </p>
            <p className="text-sm text-foreground/60 md:text-base">
              대학 레벨과 계열에 맞춰 나의 계열 적합성 위험도를 예측합니다.
            </p>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
        <SubjectTable
          title="1. 필수과목"
          subjects={calculatedCompatibility?.requiredSubjects || []}
          showIssuanceStatus={true}
        />

        <SubjectTable
          title="2. 장려과목"
          subjects={calculatedCompatibility?.encouragedSubjects || []}
          showIssuanceStatus={true}
        />

        <SubjectTable
          title="3. 주요교과"
          subjects={calculatedCompatibility?.mainSubjects || []}
          showIssuanceStatus={false}
        />

        <SubjectTable
          title="4. 참조교과"
          subjects={calculatedCompatibility?.referenceSubjects || []}
          showIssuanceStatus={false}
        />
      </div>
    </div>
  );
};

interface SubjectTableProps {
  title: string;
  subjects: ICalculatedSubject[] | ICalculatedMainSubject[];
  showIssuanceStatus: boolean;
}

const SubjectTable: React.FC<SubjectTableProps> = ({
  title,
  subjects,
  showIssuanceStatus,
}) => (
  <section className="space-y-2">
    <p className="text-base font-semibold">{title}</p>
    <div className="overflow-x-auto pb-2">
      <div className="w-full">
        {subjects.length === 0 ? (
          <div>
            <div className="py-1 text-center">
              🙅‍♂️ {title.split(".")[1].trim()} 없음
            </div>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.code} className="flex items-center">
              {showIssuanceStatus && (
                <div
                  className={cn(
                    "p-1 font-semibold",
                    subject.myGradeAvg ? "text-green-500" : "text-red-500",
                  )}
                >
                  {subject.myGradeAvg
                    ? `이수(${subject.myGradeAvg ? subject.myGradeAvg.toFixed(2) : "-"})`
                    : "미이수"}
                </div>
              )}
              <div className="p-1">
                {!showIssuanceStatus && (
                  <span className="font-semibold text-green-500">
                    ({subject.myGradeAvg ? subject.myGradeAvg.toFixed(2) : "-"}){" "}
                  </span>
                )}
                {subject.name}
              </div>

              <div className="p-1 font-semibold">
                <RiskBadge risk={subject.risk} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
);
