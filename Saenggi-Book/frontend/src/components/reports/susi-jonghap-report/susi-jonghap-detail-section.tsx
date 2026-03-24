import { DataGrid } from "@/components/custom/data-grid";
import { IExploreSusiJonghapDetailResponse } from "@/stores/server/features/explore/susi-jonghap/interfaces";

interface SusiJonghapDetailSectionProps {
  susiJonghap: IExploreSusiJonghapDetailResponse;
}

export const SusiJonghapDetailSection = ({
  susiJonghap,
}: SusiJonghapDetailSectionProps) => {
  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">1.지원자격</h3>
        <p className="font-semibold">
          {susiJonghap.admission_method.eligibility ||
            "데이터가 존재하지 않아요ㅜㅜ"}
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">2. 선발방식</h3>
        <DataGrid
          data={[
            {
              label: "모집인원",
              value: susiJonghap.recruitment_number || "-",
            },
            {
              label: "전형방법",
              value:
                susiJonghap.admission_method.method_description || "-",
            },
          ]}
        />
      </div>

      <div>
        <h3 className="pb-4 text-xl font-medium text-primary">3. 수능 최저</h3>
        <div className="flex flex-wrap items-start justify-start gap-4 text-sm sm:text-base">
          <div className="flex w-full flex-col justify-center gap-2">
            <p className="text-sm">수능 최저학력기준</p>
            <p className="font-semibold">
              {susiJonghap.minimum_grade?.is_applied
                ? susiJonghap.minimum_grade?.description
                : "미반영"}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">4. 면접</h3>
        <DataGrid
          data={[
            {
              label: "면접 점수 반영여부",
              value:
                susiJonghap.interview?.is_reflected === 1
                  ? "반영"
                  : "미반영",
            },
            {
              label: "면접 유형",
              value:
                susiJonghap.interview?.interview_type &&
                susiJonghap.interview.interview_type !== "0"
                  ? susiJonghap.interview.interview_type
                  : "-",
            },
            {
              label: "면접시 활용자료",
              value:
                susiJonghap.interview?.materials_used &&
                susiJonghap.interview.materials_used !== "0"
                  ? susiJonghap.interview.materials_used
                  : "-",
            },
            {
              label: "면접 진행방식",
              value:
                susiJonghap.interview?.interview_process &&
                susiJonghap.interview.interview_process !== "0"
                  ? susiJonghap.interview.interview_process
                  : "-",
            },
          ]}
        />
        <DataGrid
          data={[
            {
              label: "면접 평가내용",
              value:
                susiJonghap.interview?.evaluation_content &&
                susiJonghap.interview.evaluation_content !== "0"
                  ? susiJonghap.interview.evaluation_content
                  : "-",
            },
            {
              label: "날짜",
              value:
                susiJonghap.interview?.interview_date &&
                susiJonghap.interview.interview_date !== "0"
                  ? susiJonghap.interview.interview_date
                  : "-",
            },
            {
              label: "시간",
              value:
                susiJonghap.interview?.interview_time &&
                susiJonghap.interview.interview_time !== "0"
                  ? susiJonghap.interview.interview_time
                  : "-",
            },
          ]}
        />
      </div>
    </section>
  );
};
