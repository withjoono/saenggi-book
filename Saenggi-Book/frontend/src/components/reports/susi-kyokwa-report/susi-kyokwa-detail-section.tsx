import { DataGrid } from "@/components/custom/data-grid";
import { IExploreSusiKyokwaDetailResponse } from "@/stores/server/features/explore/susi-kyokwa/interfaces";

interface SusiKyokwaDetailSectionProps {
  susiKyokwa: IExploreSusiKyokwaDetailResponse;
}

export const SusiKyokwaDetailSection = ({
  susiKyokwa,
}: SusiKyokwaDetailSectionProps) => {
  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">1.지원자격</h3>
        <p className="font-semibold">
          {susiKyokwa.admissionMethod.eligibility ||
            "데이터가 존재하지 않아요ㅜㅜ"}
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">2. 선발방식</h3>
        <DataGrid
          data={[
            {
              label: "모집인원",
              value: susiKyokwa.recruitmentNumber || "-",
            },
            {
              label: "전형방법",
              value: susiKyokwa.admissionMethod.methodDescription || "-",
            },
          ]}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">3. 학생부 비율</h3>
        <p className="text-base font-medium text-blue-500">
          일괄선발/1단계 비율
        </p>
        <DataGrid
          data={[
            {
              label: "교과",
              value: `${susiKyokwa.admissionMethod.subjectRatio || 0}%`,
            },
            {
              label: "비교과 (정성평가)",
              value: `${susiKyokwa.admissionMethod.documentRatio || 0}%`,
            },
            {
              label: "면접",
              value: `${susiKyokwa.admissionMethod.interviewRatio || 0}%`,
            },
            {
              label: "실기",
              value: `${susiKyokwa.admissionMethod.practicalRatio || 0}%`,
            },
          ]}
        />

        {susiKyokwa.admissionMethod.secondStageFirstRatio ||
          susiKyokwa.admissionMethod.secondStageInterviewRatio ||
          (susiKyokwa.admissionMethod.secondStageOtherRatio &&
            susiKyokwa.admissionMethod.secondStageOtherDetails !== "0") ? (
          <>
            <p className="text-base font-medium text-blue-500">2단계 비율</p>
            <DataGrid
              data={[
                {
                  label: "1단계 성적",
                  value: `${susiKyokwa.admissionMethod.secondStageFirstRatio || 0}%`,
                },
                {
                  label: "2단계 면접",
                  value: `${susiKyokwa.admissionMethod.secondStageInterviewRatio || 0}%`,
                },
                {
                  label: "그외",
                  value: `${susiKyokwa.admissionMethod.secondStageOtherRatio || 0}%`,
                },
                {
                  label: "그외 내역",
                  value:
                    susiKyokwa.admissionMethod.secondStageOtherDetails ||
                    "-",
                },
              ]}
            />
          </>
        ) : null}
      </div>
      <div>
        <h3 className="pb-4 text-xl font-medium text-primary">4. 수능 최저</h3>
        <div className="flex flex-wrap items-start justify-start gap-4 text-sm sm:text-base">
          <div className="flex w-full flex-col justify-center gap-2">
            <p className="text-sm">수능 최저학력기준</p>
            <p className="font-semibold">
              {susiKyokwa.minimumGrade?.isApplied
                ? susiKyokwa.minimumGrade?.description
                : "미반영"}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">5. 면접</h3>
        <DataGrid
          data={[
            {
              label: "면접 점수 반영여부",
              value:
                susiKyokwa.interview?.isReflected === 1 ? "반영" : "미반영",
            },
            {
              label: "면접 유형",
              value:
                susiKyokwa.interview?.interviewType &&
                  susiKyokwa.interview.interviewType !== "0"
                  ? susiKyokwa.interview.interviewType
                  : "-",
            },
            {
              label: "면접시 활용자료",
              value:
                susiKyokwa.interview?.materialsUsed &&
                  susiKyokwa.interview.materialsUsed !== "0"
                  ? susiKyokwa.interview.materialsUsed
                  : "-",
            },
            {
              label: "면접 진행방식",
              value:
                susiKyokwa.interview?.interviewProcess &&
                  susiKyokwa.interview.interviewProcess !== "0"
                  ? susiKyokwa.interview.interviewProcess
                  : "-",
            },
          ]}
        />
        <DataGrid
          data={[
            {
              label: "면접 평가내용",
              value:
                susiKyokwa.interview?.evaluationContent &&
                  susiKyokwa.interview.evaluationContent !== "0"
                  ? susiKyokwa.interview.evaluationContent
                  : "-",
            },
            {
              label: "날짜",
              value:
                susiKyokwa.interview?.interviewDate &&
                  susiKyokwa.interview.interviewDate !== "0"
                  ? susiKyokwa.interview.interviewDate
                  : "-",
            },
            {
              label: "시간",
              value:
                susiKyokwa.interview?.interviewTime &&
                  susiKyokwa.interview.interviewTime !== "0"
                  ? susiKyokwa.interview.interviewTime
                  : "-",
            },
          ]}
        />
      </div>
    </section>
  );
};
