import { createLazyFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useGetSchoolRecords } from "@/stores/server/features/me/queries";
import type {
  ISchoolRecordCreativeActivity,
  ISchoolRecordBehaviorOpinion,
} from "@/stores/server/features/me/interfaces";

export const Route = createLazyFileRoute("/ms/_layout/creative-activity")({
  component: CreativeActivityPage,
});

// 활동 유형
type ActivityType = "autonomous" | "club" | "career";

// 학년
type Grade = "1" | "2" | "3";

// 활동 유형 매핑 (DB activityType → 탭 key)
const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
  "자치활동": "autonomous",
  "자율활동": "autonomous",
  "동아리활동": "club",
  "봉사활동": "career", // 봉사활동은 진로와 함께 표시
  "진로활동": "career",
};

const ACTIVITY_LABELS: Record<
  ActivityType,
  { label: string; emoji: string; description: string }
> = {
  autonomous: {
    label: "자율활동",
    emoji: "🏫",
    description: "학교 자치활동, 적응활동, 행사활동 등",
  },
  club: {
    label: "동아리활동",
    emoji: "🎭",
    description: "정규 동아리, 자율 동아리, 학교스포츠클럽 등",
  },
  career: {
    label: "진로활동",
    emoji: "🧭",
    description: "진로체험, 진로상담, 진로적성검사 등",
  },
};

const GRADE_LABELS: Record<Grade, string> = {
  "1": "1학년",
  "2": "2학년",
  "3": "3학년",
};

// 활동 카드 컴포넌트
function ActivityCard({
  activity,
}: {
  activity: ISchoolRecordCreativeActivity;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900">
            {activity.activityType || "창의적 체험활동"}
          </h4>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {activity.content || "내용이 없습니다."}
          </p>
        </div>
      </div>
    </div>
  );
}

// 학년별 섹션 컴포넌트
function GradeSection({
  grade,
  activities,
  activityType,
}: {
  grade: Grade;
  activities: ISchoolRecordCreativeActivity[];
  activityType: ActivityType;
}) {
  const info = ACTIVITY_LABELS[activityType];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold text-gray-900">
          {GRADE_LABELS[grade]}
        </h3>
        <span className="rounded-full bg-olive-100 px-2.5 py-0.5 text-xs font-medium text-olive-700">
          {activities.length}건
        </span>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6">
          <span className="text-2xl">{info.emoji}</span>
          <p className="text-center text-sm text-gray-400">
            {GRADE_LABELS[grade]} {info.label} 데이터가 아직 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

// 행동특성 및 종합의견 섹션 컴포넌트
function BehaviorSection({
  behaviorOpinions,
}: {
  behaviorOpinions: ISchoolRecordBehaviorOpinion[];
}) {
  const [selectedGrade, setSelectedGrade] = useState<Grade>("1");

  // 학년별로 데이터 그룹핑
  const behaviorByGrade = useMemo(() => {
    const grouped: Record<Grade, ISchoolRecordBehaviorOpinion[]> = {
      "1": [],
      "2": [],
      "3": [],
    };
    behaviorOpinions.forEach((bo) => {
      const grade = bo.grade as Grade;
      if (grade && grouped[grade]) {
        grouped[grade].push(bo);
      }
    });
    return grouped;
  }, [behaviorOpinions]);

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedGrade}
        onValueChange={(v) => setSelectedGrade(v as Grade)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {(["1", "2", "3"] as Grade[]).map((grade) => (
            <TabsTrigger key={grade} value={grade} className="gap-1.5 text-sm">
              <span>{GRADE_LABELS[grade]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(["1", "2", "3"] as Grade[]).map((grade) => (
          <TabsContent key={grade} value={grade}>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              {behaviorByGrade[grade].length > 0 ? (
                <div className="space-y-4">
                  {behaviorByGrade[grade].map((bo) => (
                    <p
                      key={bo.id}
                      className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700"
                    >
                      {bo.content}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6">
                  <span className="text-3xl">📝</span>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">
                      {GRADE_LABELS[grade]} 행동특성 및 종합의견
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      아직 등록된 내용이 없습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function CreativeActivityPage() {
  const [selectedTab, setSelectedTab] = useState<ActivityType>("autonomous");
  const { data: schoolRecords } = useGetSchoolRecords();

  const creativeActivities = schoolRecords?.creativeActivities || [];
  const behaviorOpinions = schoolRecords?.behaviorOpinions || [];

  // 활동 유형 + 학년별로 데이터 그룹핑
  const groupedData = useMemo(() => {
    const grouped: Record<ActivityType, Record<Grade, ISchoolRecordCreativeActivity[]>> = {
      autonomous: { "1": [], "2": [], "3": [] },
      club: { "1": [], "2": [], "3": [] },
      career: { "1": [], "2": [], "3": [] },
    };

    creativeActivities.forEach((activity) => {
      const activityType = activity.activityType
        ? ACTIVITY_TYPE_MAP[activity.activityType] || "autonomous"
        : "autonomous";
      const grade = activity.grade as Grade;
      if (grade && grouped[activityType]?.[grade]) {
        grouped[activityType][grade].push(activity);
      }
    });

    return grouped;
  }, [creativeActivities]);

  const grades: Grade[] = ["1", "2", "3"];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          창의적 체험활동
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          자율활동, 동아리활동, 진로활동의 학년별 기록을 확인하세요.
        </p>
      </div>

      <Separator />

      {/* 창체 탭 */}
      <Tabs
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v as ActivityType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((type) => (
            <TabsTrigger key={type} value={type} className="gap-1.5 text-sm">
              <span>{ACTIVITY_LABELS[type].emoji}</span>
              <span>{ACTIVITY_LABELS[type].label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((type) => (
          <TabsContent key={type} value={type}>
            {/* 활동 설명 */}
            <div className="mb-6 rounded-lg border border-olive-200 bg-olive-50 px-4 py-3">
              <p className="text-sm text-olive-700">
                <span className="mr-1 font-semibold">
                  {ACTIVITY_LABELS[type].emoji} {ACTIVITY_LABELS[type].label}
                </span>
                — {ACTIVITY_LABELS[type].description}
              </p>
            </div>

            {/* 학년별 섹션 */}
            <div className="space-y-8">
              {grades.map((grade) => (
                <GradeSection
                  key={grade}
                  grade={grade}
                  activities={groupedData[type][grade]}
                  activityType={type}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Separator />

      {/* 행동특성 및 종합의견 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          📋 행동특성 및 종합의견
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          학년별 행동특성 및 종합의견을 확인하세요.
        </p>
      </div>

      <BehaviorSection behaviorOpinions={behaviorOpinions} />
    </div>
  );
}
