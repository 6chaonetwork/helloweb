import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页", key: "home" },
  { href: "/product", label: "产品能力", key: "product" },
  { href: "/deployment", label: "部署路径", key: "deployment" },
  { href: "/contact", label: "合作与接入", key: "contact" },
] as const;

type SiteShellProps = {
  current?: (typeof links)[number]["key"];
  children: ReactNode;
};

export function SiteShell({ current, children }: SiteShellProps) {
  return (
    <div className="relative overflow-hidden bg-[#f7f5f1] text-[#111827]">
      <header className="site-section sticky top-0 z-40 border-b border-black/6 bg-[rgba(247,245,241,0.88)] backdrop-blur-xl">
        <div className="site-container flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_16px_36px_rgba(17,24,39,0.08)]">
              <Image
                src="/brand/helloclaw-logo.png"
                alt="HelloClaw"
                width={44}
                height={44}
                className="h-11 w-11 object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-[0.16em] text-[#111827] uppercase">
                HelloClaw
              </div>
              <div className="text-xs text-[#6b7280]">
                Desktop workspace and control center for AI teams
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-black/8 bg-white p-1 md:flex">
            {links.map((item) => {
              const active = item.key === current;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition",
                    active
                      ? "bg-[#111827] text-white"
                      : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/contact">申请演示</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                管理后台
                <ChevronRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {children}

      <footer className="site-section border-t border-black/6 bg-white py-10">
        <div className="site-container grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="border-black/8 bg-[#f3f4f6] text-[#374151]"
            >
              HelloClaw Official
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[#111827] md:text-4xl">
              先把官网、桌面端和控制台做成真正的产品，再去承接更复杂的系统对接。
            </h2>
            <p className="mt-4 text-base leading-8 text-[#4b5563]">
              官网负责讲清楚产品，控制台负责承接配置与运营。后续接入 HelloAPI
              时，这套站点和后台会直接成为统一入口，而不是临时拼接的说明页面。
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                Navigation
              </div>
              <div className="mt-4 grid gap-2">
                {links.map((item) => (
                  <Link
                    key={`footer-${item.href}`}
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm text-[#4b5563] transition hover:text-[#111827]"
                  >
                    {item.label}
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
                Next Step
              </div>
              <div className="mt-4 grid gap-2">
                <Link href="/login" className="text-sm text-[#4b5563] transition hover:text-[#111827]">
                  打开控制台
                </Link>
                <Link href="/deployment" className="text-sm text-[#4b5563] transition hover:text-[#111827]">
                  查看部署路径
                </Link>
                <Link
                  href="https://github.com/6chaonetwork/helloweb"
                  className="text-sm text-[#4b5563] transition hover:text-[#111827]"
                >
                  GitHub 仓库
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
