import { createLazyFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useGetSchoolRecords } from "@/stores/server/features/me/queries";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import type { ISchoolRecordAttendance } from "@/stores/server/features/me/interfaces";

export const Route = createLazyFileRoute("/ms/_layout/attendance")({
    component: AttendancePage,
});

// 학년 라벨
const GRADE_LABELS: Record<string, string> = {
    "1": "1학년",
    "2": "2학년",
    "3": "3학년",
};

// 출결 카테고리 정보
const ATTENDANCE_CATEGORIES = [
    {
        key: "absent",
        label: "결석",
        emoji: "🚫",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconBg: "bg-red-100",
        fields: {
            disease: "absent_disease" as const,
            unrecognized: "absent_unrecognized" as const,
            etc: "absent_etc" as const,
        },
    },
    {
        key: "late",
        label: "지각",
        emoji: "⏰",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        iconBg: "bg-orange-100",
        fields: {
            disease: "late_disease" as const,
            unrecognized: "late_unrecognized" as const,
            etc: "late_etc" as const,
        },
    },
    {
        key: "leave",
        label: "조퇴",
        emoji: "🚪",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconBg: "bg-amber-100",
        fields: {
            disease: "leave_early_disease" as const,
            unrecognized: "leave_early_unrecognized" as const,
            etc: "leave_early_etc" as const,
        },
    },
    {
        key: "result",
        label: "결과",
        emoji: "📝",
        color: "text-sky-600",
        bgColor: "bg-sky-50",
        borderColor: "border-sky-200",
        iconBg: "bg-sky-100",
        fields: {
            disease: "result_disease" as const,
            unrecognized: "result_unrecognized" as const,
            etc: "result_early_etc" as const,
        },
    },
];

// 카테고리별 합계 계산
function getCategoryTotal(
    attendance: ISchoolRecordAttendance,
    fields: { disease: keyof ISchoolRecordAttendance; unrecognized: keyof ISchoolRecordAttendance; etc: keyof ISchoolRecordAttendance }
): { total: number; disease: number; unrecognized: number; etc: number } {
    const disease = Number(attendance[fields.disease]) || 0;
    const unrecognized = Number(attendance[fields.unrecognized]) || 0;
    const etc = Number(attendance[fields.etc]) || 0;
    return { total: disease + unrecognized + etc, disease, unrecognized, etc };
}

// 전체 무단 합계
function getTotalUnexcused(attendance: ISchoolRecordAttendance): number {
    return (
        (Number(attendance.absent_unrecognized) || 0) +
        (Number(attendance.late_unrecognized) || 0) +
        (Number(attendance.leave_early_unrecognized) || 0) +
        (Number(attendance.result_unrecognized) || 0)
    );
}

// ── 학년별 출결 종합 카드 ──
function GradeOverviewCard({ attendance }: { attendance: ISchoolRecordAttendance }) {
    const totalUnexcused = getTotalUnexcused(attendance);
    const hasWarning = totalUnexcused > 0;

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md",
                hasWarning ? "border-red-200" : "border-gray-200"
            )}
        >
            {/* 헤더 */}
            <div
                className={cn(
                    "flex items-center justify-between px-5 py-3.5",
                    hasWarning ? "bg-red-50" : "bg-olive-50"
                )}
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-xl">📚</span>
                    <h3 className="text-base font-bold text-gray-900">
                        {GRADE_LABELS[String(attendance.grade)] || `${attendance.grade}학년`}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-600">
                        수업일수 {attendance.class_days || 0}일
                    </span>
                    {hasWarning && (
                        <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                            무단 {totalUnexcused}건
                        </span>
                    )}
                </div>
            </div>

            {/* 카테고리별 그리드 */}
            <div className="grid grid-cols-2 gap-0 sm:grid-cols-4">
                {ATTENDANCE_CATEGORIES.map((cat, idx) => {
                    const data = getCategoryTotal(attendance, cat.fields);
                    return (
                        <div
                            key={cat.key}
                            className={cn(
                                "flex flex-col items-center gap-2 border-gray-100 bg-white px-4 py-5",
                                idx < ATTENDANCE_CATEGORIES.length - 1 && "sm:border-r",
                                idx < 2 && "border-b sm:border-b-0",
                                idx === 0 && "border-r",
                                idx === 2 && "border-r sm:border-r"
                            )}
                        >
                            <div className={cn("rounded-lg p-2", cat.iconBg)}>
                                <span className="text-lg">{cat.emoji}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-500">{cat.label}</span>
                            <span
                                className={cn(
                                    "text-2xl font-extrabold",
                                    data.total > 0 ? cat.color : "text-green-600"
                                )}
                            >
                                {data.total}
                            </span>

                            {/* 세부 내역 */}
                            <div className="flex w-full justify-center gap-2 text-[11px]">
                                <span className="text-gray-400">
                                    질병 <span className="font-semibold text-gray-600">{data.disease}</span>
                                </span>
                                <span className={data.unrecognized > 0 ? "text-red-400" : "text-gray-400"}>
                                    무단{" "}
                                    <span
                                        className={cn(
                                            "font-semibold",
                                            data.unrecognized > 0 ? "text-red-600" : "text-gray-600"
                                        )}
                                    >
                                        {data.unrecognized}
                                    </span>
                                </span>
                                <span className="text-gray-400">
                                    기타 <span className="font-semibold text-gray-600">{data.etc}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── 전체 요약 통계 바 ──
function SummaryBar({ attendances }: { attendances: ISchoolRecordAttendance[] }) {
    const totals = useMemo(() => {
        return ATTENDANCE_CATEGORIES.map((cat) => {
            let sum = 0;
            let unexcusedSum = 0;
            attendances.forEach((att) => {
                const data = getCategoryTotal(att, cat.fields);
                sum += data.total;
                unexcusedSum += data.unrecognized;
            });
            return { ...cat, sum, unexcusedSum };
        });
    }, [attendances]);

    const totalDays = attendances.reduce((acc, att) => acc + (Number(att.class_days) || 0), 0);

    return (
        <div className="overflow-hidden rounded-xl border border-olive-200 bg-gradient-to-r from-olive-50 to-amber-50 shadow-sm">
            <div className="px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <h3 className="text-sm font-bold text-gray-800">전체 출결 현황</h3>
                    <span className="ml-auto rounded-full bg-olive-100 px-3 py-0.5 text-xs font-medium text-olive-700">
                        총 수업일수 {totalDays}일
                    </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {totals.map((item) => (
                        <div
                            key={item.key}
                            className={cn(
                                "flex flex-col items-center rounded-lg border bg-white/80 p-3 backdrop-blur-sm",
                                item.borderColor
                            )}
                        >
                            <span className="text-xs font-medium text-gray-500">{item.label}</span>
                            <span
                                className={cn(
                                    "mt-1 text-xl font-extrabold",
                                    item.sum > 0 ? item.color : "text-green-600"
                                )}
                            >
                                {item.sum}
                            </span>
                            {item.unexcusedSum > 0 && (
                                <span className="mt-0.5 text-[10px] font-semibold text-red-500">
                                    무단 {item.unexcusedSum}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── 메인 페이지 ──
function AttendancePage() {
    const { data: user } = useGetCurrentUser();
    const { data: schoolRecords, isLoading } = useGetSchoolRecords();
    const [selectedGrade, setSelectedGrade] = useState<string>("all");

    const attendances = useMemo(
        () => (schoolRecords?.attendance || []).sort((a, b) => Number(a.grade) - Number(b.grade)),
        [schoolRecords]
    );

    const filteredAttendances = useMemo(
        () =>
            selectedGrade === "all"
                ? attendances
                : attendances.filter((att) => String(att.grade) === selectedGrade),
        [attendances, selectedGrade]
    );

    const gradeOptions = [
        { value: "all", label: "전체" },
        { value: "1", label: "1학년" },
        { value: "2", label: "2학년" },
        { value: "3", label: "3학년" },
    ];

    if (!user) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <p className="text-gray-500">로그인이 필요합니다.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-olive-500 border-t-transparent" />
                    <p className="text-gray-500">출결 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">📋 출결 현황</h2>
                <p className="mt-1 text-sm text-gray-500">
                    학년별 출결(결석·지각·조퇴·결과) 현황을 한눈에 확인하세요.
                </p>
            </div>

            {/* 전체 요약 */}
            {attendances.length > 0 && <SummaryBar attendances={attendances} />}

            {/* 학년 필터 */}
            <div className="flex flex-wrap gap-2">
                {gradeOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setSelectedGrade(opt.value)}
                        className={cn(
                            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                            selectedGrade === opt.value
                                ? "bg-olive-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* 학년별 카드 */}
            {filteredAttendances.length > 0 ? (
                <div className="space-y-4">
                    {filteredAttendances.map((att) => (
                        <GradeOverviewCard key={att.id} attendance={att} />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
                    <div className="text-5xl">📋</div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700">
                            출결 데이터가 없습니다
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            생기부 입력 메뉴에서 출결 정보를 입력해주세요.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
