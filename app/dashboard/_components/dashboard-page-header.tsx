import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type DashboardPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <Card className="rounded-[32px] border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <Badge className="border-claw-red/18 bg-red-50 text-claw-red tracking-[0.28em]">
              {eyebrow}
            </Badge>
            <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.04em] text-zinc-900 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-8 text-zinc-500 md:text-base">
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3 xl:justify-end">{actions}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
