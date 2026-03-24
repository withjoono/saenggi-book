import { cn } from "@/lib/utils";
import { Button } from "@/components/custom/button";
import { useExploreSusiKyokwaStepper } from "../../context/explore-susi-kyokwa-provider";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AdmissionSubtypeSelectorProps {
  className?: string;
}

export const AdmissionSubtypeSelector = ({
  className,
}: AdmissionSubtypeSelectorProps) => {
  const { formData, updateFormData } = useExploreSusiKyokwaStepper();
  const { data: staticData } = useGetStaticData();
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  // 카테고리별로 서브타입을 그룹화
  const categorizedSubtypes = useMemo(() => {
    if (!staticData) return [];

    const categories = Object.values(
      staticData.fields.ADMISSION_SUBTYPE_CATEGORIES || {},
    ).sort((a, b) => a.displayOrder - b.displayOrder);

    const subtypes = Object.values(staticData.fields.ADMISSION_SUBTYPES || {});

    return categories.map((category) => ({
      ...category,
      subtypes: subtypes.filter((s) => s.categoryId === category.id),
    }));
  }, [staticData]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const toggleSubtype = (subtypeId: number) => {
    const isSelected = formData.selectedSubtypeIds.includes(subtypeId);
    updateFormData(
      "selectedSubtypeIds",
      isSelected
        ? formData.selectedSubtypeIds.filter((n) => n !== subtypeId)
        : [...formData.selectedSubtypeIds, subtypeId],
    );
  };

  // 카테고리 내 모든 서브타입 선택/해제
  const toggleAllInCategory = (
    categoryId: number,
    subtypeIds: number[],
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const allSelected = subtypeIds.every((id) =>
      formData.selectedSubtypeIds.includes(id),
    );

    if (allSelected) {
      // 모두 해제
      updateFormData(
        "selectedSubtypeIds",
        formData.selectedSubtypeIds.filter((id) => !subtypeIds.includes(id)),
      );
    } else {
      // 모두 선택
      updateFormData("selectedSubtypeIds", [
        ...new Set([...formData.selectedSubtypeIds, ...subtypeIds]),
      ]);
    }
  };

  // 선택된 서브타입 수 계산
  const getSelectedCount = (subtypeIds: number[]) => {
    return subtypeIds.filter((id) =>
      formData.selectedSubtypeIds.includes(id),
    ).length;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-lg font-semibold md:text-xl">🔥 특별전형 종류 선택</p>
      <p className="text-sm text-foreground/60">
        카테고리를 클릭하여 상세 전형을 선택해주세요
      </p>

      <div className="space-y-2 pt-2">
        {categorizedSubtypes.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const subtypeIds = category.subtypes.map((s) => s.id);
          const selectedCount = getSelectedCount(subtypeIds);
          const allSelected =
            subtypeIds.length > 0 && selectedCount === subtypeIds.length;

          return (
            <div
              key={category.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              {/* 카테고리 헤더 */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                  selectedCount > 0
                    ? "bg-primary/10 hover:bg-primary/20"
                    : "bg-muted/50 hover:bg-muted",
                )}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{category.name}</span>
                  {selectedCount > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {selectedCount}개 선택
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={allSelected ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={(e) =>
                      toggleAllInCategory(category.id, subtypeIds, e)
                    }
                  >
                    {allSelected ? "전체 해제" : "전체 선택"}
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* 서브타입 목록 */}
              {isExpanded && (
                <div className="px-4 py-3 bg-background border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {category.subtypes.map((subtype) => {
                      const isSelected = formData.selectedSubtypeIds.includes(
                        subtype.id,
                      );
                      return (
                        <Button
                          key={subtype.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => toggleSubtype(subtype.id)}
                        >
                          {subtype.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 선택된 항목 요약 */}
      {formData.selectedSubtypeIds.length > 0 && (
        <div className="pt-4 text-sm text-foreground/70">
          <span className="font-semibold text-primary">
            {formData.selectedSubtypeIds.length}개
          </span>{" "}
          전형 선택됨
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs h-6"
            onClick={() => updateFormData("selectedSubtypeIds", [])}
          >
            전체 초기화
          </Button>
        </div>
      )}
    </div>
  );
};
