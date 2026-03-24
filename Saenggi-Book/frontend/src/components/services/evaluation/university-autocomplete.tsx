import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGetAllUniversities } from "@/stores/server/features/series-evaluation/queries";
import { useState, useRef, useEffect, useMemo } from "react";

interface UniversityAutocompleteProps {
  selectedUniversity: string;
  onSelectUniversity: (university: string) => void;
  className?: string;
}

export function UniversityAutocomplete({
  selectedUniversity,
  onSelectUniversity,
  className,
}: UniversityAutocompleteProps) {
  const { data: universities, isLoading } = useGetAllUniversities();
  const [inputValue, setInputValue] = useState(selectedUniversity);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 대학명 목록 추출
  const universityNames = useMemo(() => {
    return universities?.map((u) => u.universityName) || [];
  }, [universities]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // selectedUniversity가 변경되면 inputValue 업데이트
  useEffect(() => {
    setInputValue(selectedUniversity);
  }, [selectedUniversity]);

  // 입력값에 따라 대학 목록 필터링
  const filteredUniversities = useMemo(() => {
    if (!inputValue.trim() || universityNames.length === 0) return [];

    const filtered = universityNames.filter((univ) =>
      univ.toLowerCase().includes(inputValue.toLowerCase())
    );
    return filtered.slice(0, 10); // 최대 10개만 표시
  }, [inputValue, universityNames]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpen(value.trim().length > 0);
  };

  // 대학 선택
  const handleSelectUniversity = (university: string) => {
    setInputValue(university);
    onSelectUniversity(university);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        type="text"
        placeholder="대학명을 입력하세요 (예: 서울대)"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (inputValue.trim().length > 0 && filteredUniversities.length > 0) {
            setIsOpen(true);
          }
        }}
        className="w-full"
        disabled={isLoading}
      />

      {isOpen && filteredUniversities.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-md">
          <ul className="py-1">
            {filteredUniversities.map((university, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectUniversity(university)}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {university}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && inputValue.trim().length > 0 && filteredUniversities.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover p-3 shadow-md">
          <p className="text-sm text-muted-foreground">
            검색 결과가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
