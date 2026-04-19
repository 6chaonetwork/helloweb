import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SiteSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function SiteSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  bodyClassName,
}: SiteSectionProps) {
  return (
    <section id={id} className={cn("site-section py-16 md:py-20", className)}>
      <div className="site-container">
        <div className="max-w-4xl">
          {eyebrow ? (
            <Badge
              variant="outline"
              className="border-black/8 bg-white text-[#4b5563]"
            >
              {eyebrow}
            </Badge>
          ) : null}
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] text-[#111827] md:text-5xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4b5563] md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        <div className={cn("mt-10", bodyClassName)}>{children}</div>
      </div>
    </section>
  );
}
