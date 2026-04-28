"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cable,
  LayoutDashboard,
  Logs,
  Megaphone,
  Shield,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItem = {
  href?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  exact?: boolean;
  matchers?: string[];
  disabled?: boolean;
};

const navGroups: Array<{
  label: string;
  items: NavItem[];
}> = [
  {
    label: "OVERVIEW",
    items: [
      {
        href: "/dashboard",
        label: "总览",
        description: "查看控制台总览、关键运营状态和下一步入口。",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        href: "/dashboard/admin/channel-settings",
        label: "渠道与接入",
        description: "公众号配置、二维码策略与联调工具。",
        icon: Cable,
        matchers: ["/dashboard/admin/channel-settings"],
      },
      {
        href: "/dashboard/admin/users",
        label: "用户与身份",
        description: "用户、设备、会话与扫码身份链路。",
        icon: Users,
        matchers: ["/dashboard/admin/users"],
      },
      {
        href: "/dashboard/admin/content",
        label: "内容运营",
        description: "公告管理、Onboarding 配置与站点文案。",
        icon: Megaphone,
        matchers: ["/dashboard/admin/content", "/dashboard/admin/announcements", "/dashboard/admin/onboarding"],
      },
      {
        href: "/dashboard/admin/usb-licenses",
        label: "U 盘授权",
        description: "U 盘申请、审批签发与远程停用控制。",
        icon: ShieldCheck,
        matchers: ["/dashboard/admin/usb-licenses"],
      },
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      {
        href: "/dashboard/admin/audit",
        label: "审计与日志",
        description: "配置变更、关键动作与系统留痕。",
        icon: Logs,
        matchers: ["/dashboard/admin/audit"],
      },
      {
        href: "/dashboard/admin/system",
        label: "系统与权限",
        description: "管理员、环境状态与系统策略。",
        icon: Shield,
        matchers: ["/dashboard/admin/system"],
      },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (!item.href) return false;

  const normalizedHref = item.href.split("#")[0];
  if (item.matchers?.some((matcher) => pathname.startsWith(matcher))) return true;
  if (item.exact) return pathname === normalizedHref;
  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}

function DashboardNavItem({
  item,
  active,
  mobile,
}: {
  item: NavItem;
  active: boolean;
  mobile?: boolean;
}) {
  const Icon = item.icon;
  const classes = cn(
    "group flex items-start gap-3 rounded-r-2xl border-l-2 px-4 py-3 transition",
    mobile ? "rounded-2xl border border-zinc-200" : "border-y border-r border-transparent",
    active
      ? "border-l-claw-red bg-red-50 text-zinc-900"
      : "border-l-transparent bg-transparent text-zinc-400 hover:bg-white hover:text-zinc-900",
    item.disabled && "cursor-default opacity-72",
  );

  const content = (
    <>
      <div
        className={cn(
          "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition",
          active
            ? "border-claw-red/20 bg-red-50 text-claw-red"
            : "border-zinc-200 bg-zinc-50 text-zinc-500 group-hover:border-zinc-300 group-hover:text-zinc-900",
        )}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "font-medium transition",
              active ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-900",
            )}
          >
            {item.label}
          </div>
          {item.disabled ? (
            <Badge
              variant="outline"
              className="border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500"
            >
              Soon
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-500 group-hover:text-zinc-600">
          {item.description}
        </p>
      </div>
    </>
  );

  if (!item.href || item.disabled) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href={item.href} className={classes}>
      {content}
    </Link>
  );
}

export function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-6", mobile && "space-y-5")}>
      {navGroups.map((group) => (
        <div key={group.label}>
          <div className="mb-3 px-1 text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
            {group.label}
          </div>
          <div className="space-y-1.5">
            {group.items.map((item) => (
              <DashboardNavItem
                key={item.href ?? item.label}
                item={item}
                active={isActive(pathname, item)}
                mobile={mobile}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
