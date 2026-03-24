import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPATIBILITY_DATA } from "@/constants/compatibility-series";
import { Dispatch, SetStateAction } from "react";

interface SeriesSelectorProps {
  selectedSeries: {
    grandSeries: string;
    middleSeries: string;
    rowSeries: string;
  };
  setSelectedSeries: Dispatch<
    SetStateAction<{
      grandSeries: string;
      middleSeries: string;
      rowSeries: string;
    }>
  >;
}

export const SeriesSelector = ({
  selectedSeries,
  setSelectedSeries,
}: SeriesSelectorProps) => {
  const grandSeriesOptions = Array.from(
    new Set(COMPATIBILITY_DATA.map((item) => item.grandSeries)),
  );
  const middleSeriesOptions = Array.from(
    new Set(
      COMPATIBILITY_DATA.filter(
        (item) => item.grandSeries === selectedSeries.grandSeries,
      ).map((item) => item.middleSeries),
    ),
  );
  const rowSeriesOptions = COMPATIBILITY_DATA.filter(
    (item) => item.grandSeries === selectedSeries.grandSeries,
  )
    .filter((item) => item.middleSeries === selectedSeries.middleSeries)
    .map((item) => item.rowSeries);

  return (
    <div>
      <div className="mx-auto flex max-w-lg items-start gap-2">
        <div className="w-full min-w-[60px]">
          <Select
            value={selectedSeries.grandSeries}
            onValueChange={(value) => {
              setSelectedSeries((prev) => ({
                ...prev,
                grandSeries: value,
                middleSeries: "",
                rowSeries: "",
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="대분류 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {grandSeriesOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedSeries.grandSeries === "" && (
            <p className="animate-bounce pt-4 text-center text-sm text-primary">
              선택 👆
            </p>
          )}
        </div>
        <div className="w-full min-w-[60px]">
          <Select
            value={selectedSeries.middleSeries}
            onValueChange={(value) => {
              setSelectedSeries((prev) => ({
                ...prev,
                middleSeries: value,
                rowSeries: "",
              }));
            }}
            disabled={!selectedSeries.grandSeries}
          >
            <SelectTrigger>
              <SelectValue placeholder="중분류 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {middleSeriesOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedSeries.grandSeries && selectedSeries.middleSeries === "" && (
            <p className="animate-bounce pt-4 text-center text-sm text-primary">
              선택 👆
            </p>
          )}
        </div>
        <div className="w-full min-w-[60px]">
          <Select
            value={selectedSeries.rowSeries}
            onValueChange={(value) => {
              setSelectedSeries((prev) => ({
                ...prev,
                rowSeries: value,
              }));
            }}
            disabled={!selectedSeries.middleSeries}
          >
            <SelectTrigger>
              <SelectValue placeholder="소분류 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rowSeriesOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedSeries.middleSeries && selectedSeries.rowSeries === "" && (
            <p className="animate-bounce pt-4 text-center text-sm text-primary">
              선택 👆
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
