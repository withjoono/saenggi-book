import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";

/** ===== 공통 promo 컴포넌트 (생기북 / Saenggi-Book) =====
 *  TeacherAdmin promo 패턴 복제 — olive(green) primary로 자동 적용.
 *  외부 절대 URL은 <a>, 내부 라우트는 TanStack Router <Link to=...> 사용.
 */

function isExternal(href: string) {
  return /^https?:\/\//.test(href) || href.startsWith("mailto:");
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export function PromoHero({
  badge,
  title,
  highlight,
  body,
  primaryHref = "/sb/dashboard",
  primaryLabel = "시작하기",
  secondaryHref,
  secondaryLabel,
  Icon,
}: {
  badge?: string;
  title: string;
  highlight?: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  Icon?: LucideIcon;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-olive-50 via-white to-amber-50">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-12 sm:py-24">
        {badge && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-olive-200 bg-white px-3 py-1 text-xs font-medium text-olive-700">
            {Icon && <Icon className="h-3.5 w-3.5 text-olive-600" />}
            {badge}
          </div>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {title}
          {highlight && <span className="text-olive-600"> {highlight}</span>}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">{body}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <SmartLink
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </SmartLink>
          {secondaryHref && (
            <SmartLink
              href={secondaryHref}
              className="inline-flex items-center rounded-xl border border-olive-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-olive-50"
            >
              {secondaryLabel || "더 알아보기"}
            </SmartLink>
          )}
        </div>
      </div>
    </section>
  );
}

export function PromoSection({
  title,
  subtitle,
  children,
  tone = "default",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <section
      className={
        tone === "muted"
          ? "bg-olive-50/60 px-6 py-16 sm:px-12 sm:py-20"
          : "px-6 py-16 sm:px-12 sm:py-20"
      }
    >
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-gray-600">{subtitle}</p>
            )}
          </div>
        )}
        <div className={title || subtitle ? "mt-12" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function FeatureGrid({
  items,
  columns = 3,
}: {
  items: { icon: LucideIcon; title: string; body: string }[];
  columns?: 2 | 3;
}) {
  const cols =
    columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-4 ${cols}`}>
      {items.map((f) => {
        const Icon = f.icon;
        return (
          <div
            key={f.title}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-olive-100 text-olive-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {f.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StepList({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-olive-600 text-sm font-bold text-white">
            {i + 1}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((r) => (
        <li
          key={r}
          className="flex items-start gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-olive-600" />
          <span>{r}</span>
        </li>
      ))}
    </ul>
  );
}

export function FinalCTA({
  title,
  body,
  Icon,
  primaryHref = "/sb/dashboard",
  primaryLabel = "시작하기",
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  Icon: LucideIcon;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-12 sm:py-20">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-gray-600">{body}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <SmartLink
          href={primaryHref}
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </SmartLink>
        {secondaryHref && (
          <SmartLink
            href={secondaryHref}
            className="inline-flex items-center rounded-xl border border-olive-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-olive-50"
          >
            {secondaryLabel || "더 알아보기"}
          </SmartLink>
        )}
      </div>
    </section>
  );
}
