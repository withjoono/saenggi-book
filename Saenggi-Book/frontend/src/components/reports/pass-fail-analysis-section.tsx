import { PassRecordChart } from "@/components/score-visualizations/pass-record-chart";
import { IRecruitmentUnitPassFailRecord } from "@/stores/server/features/susi/pass-record/interfaces";

interface PassFailAnalysisSectionProps {
  passRecords: IRecruitmentUnitPassFailRecord[];
}

export const PassFailAnalysisSection = ({
  passRecords,
}: PassFailAnalysisSectionProps) => {
  return (
    <section className="space-y-2">
      <h3 className="text-xl">합불 사례 분석 {passRecords.length}</h3>
      <div className="">
        <p className="text-primary">합불 사례가 만약 나오지 않는다면?</p>

        <p className="text-foreground/60">
          현재도 작년 사용자들을 대상으로 합/불 증명을 받고 있습니다. 다만, 양이
          너무 많아 순차적으로 처리하고 있는 상황입니다. 인원이 많은 전형을
          우선적으로 처리 중이니, 추후 다시 한번 확인해 주시기 바랍니다.
          업데이트 상황은 네이버{" "}
          <a
            href="https://cafe.naver.com/turtlecorp"
            target="_blank"
            className="text-blue-500"
          >
            T Skool 카페
          </a>
          에서 매일 공지하도록 하겠습니다.
        </p>
      </div>
      <PassRecordChart data={passRecords} className="h-[300px] w-full" />
    </section>
  );
};
