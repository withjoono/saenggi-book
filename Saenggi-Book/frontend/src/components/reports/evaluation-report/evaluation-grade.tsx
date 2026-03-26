import { MyGradeUnivChart } from "@/components/score-visualizations/my-grade-univ-chart";
import {
  useGetCurrentUser,
  useGetMyGrade,
} from "@/stores/server/features/me/queries";
import { Link } from "@tanstack/react-router";

export const EvaluationGrade = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: myGrade, isError, isLoading } = useGetMyGrade();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold md:text-2xl">🔥 내신 점수</h2>
        <p className="text-foreground/60">
          내 생기부를 통해 계산한 내신 등급입니다. 환산컷은 대학별로 계산식이
          다르기 때문에{" "}
          <Link to="/sb/comprehensive" className="text-blue-500">
            학종 분석 및 대학 찾기 서비스
          </Link>
          에서 확인할 수 있습니다!
        </p>
      </div>
      <p className="text-xl font-semibold md:pb-4">
        내 등급({currentUser?.major === "LiberalArts" ? "문과" : "이과"}):{" "}
        {isError || isLoading ? (
          <b className="text-2xl text-primary">생기부 업로드가 필요합니다.</b>
        ) : (
          <b className="text-2xl text-primary">{myGrade?.toFixed(2) || 0}</b>
        )}
      </p>
      <div className="h-[400px]">
        <MyGradeUnivChart myGrade={myGrade || 0} />
      </div>
    </div>
  );
};
