import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSusiDetailedTypeName } from "@/constants/susi-filters";
import { RiskBadge } from "../custom/risk-badge";

interface SusiReportHeaderProps {
  title: string;
  subtitle: string;
  recruitmentUnitName?: string;
  badges?: string;
  risk?: number | null;
}

export const SusiReportHeader = ({
  title,
  subtitle,
  recruitmentUnitName,
  badges,
  risk,
}: SusiReportHeaderProps) => (
  <div className="space-y-2">
    {risk ? (
      <div className="flex items-center gap-2 text-lg">
        <span>종합 위험도:</span>
        <RiskBadge risk={risk} />
      </div>
    ) : null}
    <h3 className="text-xl font-semibold">
      <b className="text-2xl font-semibold">{title}</b> {subtitle}
    </h3>
    {recruitmentUnitName && (
      <h3 className="text-xl font-medium text-green-600">
        {recruitmentUnitName}
      </h3>
    )}
    {badges ? (
      <div className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
        {badges
          .split(",")
          .map(Number)
          .filter(Boolean)
          .map(getSusiDetailedTypeName)
          .filter((name): name is string => name !== null)
          .map((name) => (
            <Badge key={name}>{name}</Badge>
          ))}
      </div>
    ) : null}
    <Separator />
  </div>
);
