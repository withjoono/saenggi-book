import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COMPATIBILITY_DATA,
  ICompatibilityData,
} from "@/constants/compatibility-series";

interface RowSeriesSearchProps {
  selectedSeries: ICompatibilityData | null;
  setSelectedSeries: (series: ICompatibilityData | null) => void;
  className?: string;
}

const sortedCompatibilityData = COMPATIBILITY_DATA.sort((a, b) =>
  a.rowSeries.localeCompare(b.rowSeries),
);

export function RowSeriesSearch({
  selectedSeries,
  setSelectedSeries,
  className,
}: RowSeriesSearchProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(
    selectedSeries ? selectedSeries.rowSeries : "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setLocalSearchTerm(term);
    setIsOpen(true);
    if (term === "") {
      setSelectedSeries(null);
    }
  };

  const filteredSeries = useMemo(() => {
    if (localSearchTerm === "") return sortedCompatibilityData;
    return sortedCompatibilityData.filter((item) =>
      item.rowSeries.toLowerCase().includes(localSearchTerm.toLowerCase()),
    );
  }, [localSearchTerm]);

  const handleClickItem = useCallback(
    (item: ICompatibilityData) => {
      setSelectedSeries(item);
      setLocalSearchTerm(item.rowSeries);
      setIsOpen(false);
    },
    [setSelectedSeries],
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Input
        placeholder="학과 검색"
        value={localSearchTerm}
        onChange={handleSearchInputChange}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filteredSeries.length > 0 && (
        <div
          className={cn(
            "absolute left-0 top-10 z-40 max-h-[400px] w-full overflow-y-auto rounded-b-md border bg-gray-100",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-track-slate-300 scrollbar-thumb-primary",
          )}
        >
          {filteredSeries.map((item) => (
            <div key={item.rowSeries} className="flex h-9 w-full">
              <p
                className="flex h-full w-full cursor-pointer items-center px-2 text-sm hover:bg-gray-200"
                onMouseDown={() => handleClickItem(item)}
              >
                {item.rowSeries}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
