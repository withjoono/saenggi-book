import { RequireLoginMessage } from "@/components/require-login-message";
import { RequireSchoolRecordMessage } from "@/components/require-schoolrecord-message";
import { RowSeriesSearch } from "@/components/row-series-search";
import { OfficerList } from "@/components/services/evaluation/officer-list";
import { SeriesSelector } from "@/components/services/evaluation/series-selector";
import { Separator } from "@/components/ui/separator";
import { ICompatibilityData } from "@/constants/compatibility-series";
import {
  useGetCurrentUser,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/evaluation/_layout/request")({
  component: EvaluationRequest,
});

function EvaluationRequest() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords } = useGetSchoolRecords();

  const [selectedSeries, setSelectedSeries] = useState({
    grandSeries: "",
    middleSeries: "",
    rowSeries: "",
  });
  const [searchSeries, setSearchSeries] = useState<ICompatibilityData | null>(
    null,
  );
  const resetSeries = () => {
    setSelectedSeries({
      grandSeries: "",
      middleSeries: "",
      rowSeries: "",
    });
    setSearchSeries(null);
  };

  useEffect(() => {
    if (searchSeries) {
      setSelectedSeries({
        grandSeries: searchSeries.grandSeries,
        middleSeries: searchSeries.middleSeries,
        rowSeries: searchSeries.rowSeries,
      });
    }
  }, [searchSeries]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">사정관 평가 신청</h3>
        <p className="text-sm text-muted-foreground">
          전공별 전문 선생님이 직접 학생 개개인의 생기부, 자소서를 보고
          평가합니다.
        </p>
        <p className="text-sm text-muted-foreground">
          평가는 평가 항목별로 A+, A, B+, B, C+, C, D, F 8단계로 평가되며,
          결과에 대한 꼼꼼한 주석까지 함께 제공됩니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : !schoolRecords || schoolRecords.isEmpty ? (
        <RequireSchoolRecordMessage />
      ) : (
        <div className="">
          {selectedSeries.rowSeries === "" ? (
            <>
              <div className="space-y-2 py-4 pt-12">
                <p className="text-center text-lg font-semibold">
                  목표 계열을 선택해주세요!
                </p>
                <p className="text-center text-sm">
                  선택한 계열에 따라 전공별 전문 선생님이 생기부 평가를
                  진행해요.
                </p>
              </div>
              <div className="space-y-4 py-12">
                <RowSeriesSearch
                  selectedSeries={searchSeries}
                  setSelectedSeries={setSearchSeries}
                  className="mx-auto max-w-sm"
                />
                <SeriesSelector
                  selectedSeries={selectedSeries}
                  setSelectedSeries={setSelectedSeries}
                />
              </div>
            </>
          ) : (
            <OfficerList
              selectedSeries={selectedSeries}
              resetSeries={resetSeries}
            />
          )}
        </div>
      )}
    </div>
  );
}
