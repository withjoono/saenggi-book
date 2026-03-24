import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { buttonVariants } from "./custom/button";
import { IconChevronDown } from "@tabler/icons-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
  showArrows?: boolean;
}

export function SubSidebarNav({ className, items, showArrows = false, ...props }: SidebarNavProps) {
  const nav = useLocation();
  return (
    <nav
      className={cn(
        "flex gap-y-2 space-x-2 overflow-x-scroll scrollbar-hide lg:sticky lg:top-20 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div key={item.href} className="flex flex-col">
          <Link
            to={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              nav.pathname.startsWith(item.href)
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {index + 1}
            </span>
            {item.title}
          </Link>
          {showArrows && index < items.length - 1 && (
            <div className="hidden py-1 pl-4 lg:flex">
              <IconChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
