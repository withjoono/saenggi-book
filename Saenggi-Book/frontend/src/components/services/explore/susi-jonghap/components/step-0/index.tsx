import { useExploreSusiJonghapStepper } from "../../context/explore-susi-jonghap-provider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetOfficerEvaluationList } from "@/stores/server/features/susi/evaluation/queries";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { EarlyEvaluationReport } from "@/components/reports/early-evaluation-report";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";

export const SusiJonghapStep0 = () => {
  // Queries
  const { data: currentUser } = useGetCurrentUser();

  const { formData, nextStep, updateFormData } =
    useExploreSusiJonghapStepper();
  const { data: officerEvaluationList } = useGetOfficerEvaluationList();
  const { data: staticData } = useGetStaticData();

  const handleNextClick = () => {
    if (!currentUser?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    nextStep();
  };

  return (
    <div className="space-y-6 px-2 pt-4">
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm text-foreground/60">
          평가 목록이 없다면{" "}
          <Link to="/users/school-record" className="text-blue-500">
            마이페이지
          </Link>
          에서 생기부 등록 후 사정관 평가를 진행해주세요.
        </p>
        <p className="pb-4 text-sm text-foreground/60">
          실제 입시 컨설턴트 선생님이 학생부를 참고하여 꼼꼼하게 평가를
          진행할거에요!
        </p>
        <Select
          onValueChange={(value) => {
            const [id, series] = value.split("@");
            updateFormData("evaluation_id", Number(id));
            const [major, mid, minor] = series.split(">");
            updateFormData(
              "majorField",
              Object.values(staticData?.fields.MAJOR_FIELDS || {}).find(
                (v) => v.name === major,
              ) || null,
            );
            updateFormData(
              "midField",
              Object.values(staticData?.fields.MID_FIELDS || {}).find(
                (v) => v.name === mid,
              ) || null,
            );
            updateFormData(
              "minorField",
              Object.values(staticData?.fields.MINOR_FIELDS || {}).find(
                (v) => v.name === minor,
              ) || null,
            );
          }}
          defaultValue={
            formData.evaluation_id ? formData.evaluation_id.toString() : ""
          }
        >
          <SelectTrigger className="w-full max-w-[400px]">
            <SelectValue placeholder="평가 선택하기" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>평가 완료</SelectLabel>
              {officerEvaluationList
                ?.filter((n) => n.status === "COMPLETE")
                .map((d) => {
                  return (
                    <SelectItem
                      value={`${d.id.toString()}@${d.series}`}
                      key={d.id}
                    >
                      ({d.officerName ? d.officerName : "자가평가"}){" "}
                      {formatDateYYYYMMDD(d.updateDt?.toString() || "")}{" "}
                      {d.series}
                    </SelectItem>
                  );
                })}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>사정관 평가중</SelectLabel>
              {officerEvaluationList
                ?.filter((n) => n.status === "READY")
                .map((d) => {
                  return (
                    <SelectItem value={d.id.toString()} disabled key={d.id}>
                      {formatDateYYYYMMDD(d.updateDt?.toString() || "")}{" "}
                      {d.series}
                    </SelectItem>
                  );
                })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {!currentUser?.id ? (
        <div className="mx-auto flex w-full flex-col items-center justify-center">
          <NoLoginMessage />
        </div>
      ) : formData.evaluation_id !== null ? (
        <div className="py-8">
          <EarlyEvaluationReport
            evaluationId={formData.evaluation_id}
            majorField={formData.majorField}
            midField={formData.midField}
            minorField={formData.minorField}
          />
        </div>
      ) : (
        <NoSelectionMessage />
      )}

      <div className="flex items-center justify-center py-12">
        {currentUser?.id ? (
          <Button
            disabled={formData.evaluation_id === null}
            onClick={handleNextClick}
          >
            다음 단계
          </Button>
        ) : (
          <Link to="/auth/login" className={cn(buttonVariants())}>
            로그인
          </Link>
        )}
      </div>
    </div>
  );
};

const NoLoginMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    🚨 로그인을 해야 서비스를 이용할 수 있습니다.
  </div>
);

const NoSelectionMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    위 선택박스를 클릭하여 평가 선택해주세요!
  </div>
);
