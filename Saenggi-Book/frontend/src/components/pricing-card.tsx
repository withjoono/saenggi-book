import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { buttonVariants } from "./custom/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { IconCircleCheck } from "@tabler/icons-react";
import { formatPrice } from "@/lib/utils/common/format";

type PricingCardProps = {
  id: number;
  title: string;
  price?: number;
  description: string;
  features: string[];
  actionLabel: string;
  popular?: boolean;
  exclusive?: boolean;
  footerLabel?: string;
  isActive?: boolean;

  className?: string;
};

export const PricingCard = ({
  id,
  title,
  price,
  description,
  features,
  actionLabel,
  popular,
  exclusive,
  footerLabel,
  isActive,
  className,
}: PricingCardProps) => (
  <Card
    className={cn(
      `relative flex w-72 flex-col justify-between py-1 ${popular ? "border-rose-400" : "border-zinc-700"} mx-auto sm:mx-0`,
      {
        "animate-background-shine bg-white bg-[length:200%_100%] transition-colors dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)]":
          exclusive,
      },
      className,
    )}
  >
    <div>
      <div className="absolute right-2 top-0 animate-bounce">
        {popular ? "🔥인기 " : ""}
      </div>
      <CardHeader className="pb-8 pt-4">
        <CardTitle className="text-lg text-zinc-700 dark:text-zinc-300">
          {title}
        </CardTitle>
        <div className="flex gap-0.5">
          <h3 className="text-3xl font-bold">{formatPrice(price || 0)}</h3>
        </div>
        <CardDescription className="h-12 pt-1.5">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {features.map((feature: string) => (
          <CheckItem key={feature} text={feature} />
        ))}
      </CardContent>
    </div>
    <CardFooter className="mt-2 flex-col space-y-2 pb-2">
      <span className="h-4 text-sm text-primary">
        {isActive ? "이미 활성화된 서비스입니다." : ""}
      </span>
      <Link
        to={`/order/${id}`}
        className={cn(buttonVariants({}), "w-full bg-black text-white")}
      >
        {actionLabel}
      </Link>
      <span className="text-sm text-foreground/60">{footerLabel}</span>
    </CardFooter>
  </Card>
);

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex gap-2">
    <IconCircleCheck size={18} className="my-auto text-green-400" />
    <p className="pt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{text}</p>
  </div>
);
