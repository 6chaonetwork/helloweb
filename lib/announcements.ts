import { prisma } from "@/lib/db";

const DEFAULT_ANNOUNCEMENTS = [
  {
    category: "产品公告",
    title: "公众号扫码登录已接入桌面端",
    summary: "已关注用户扫码可直接登录，未关注用户先关注后自动完成登录。",
    content: "已关注用户扫码可直接登录，未关注用户先关注后自动完成登录。后续会继续补齐正式用户展示体系与公告中心能力。",
    pinned: true,
    sortOrder: 100,
  },
  {
    category: "维护通知",
    title: "二维码过期后改为手动刷新",
    summary: "二维码到时后不再自动刷新，需用户手动点击刷新。",
    content: "为避免扫码过程被打断，二维码过期后会停留在当前状态，并显示刷新覆盖层，只有用户手动点击才会重新生成二维码。",
    pinned: false,
    sortOrder: 90,
  },
  {
    category: "官方动态",
    title: "公告窗支持账号概览",
    summary: "登录后可展示账号编号、陪伴天数与本机使用统计。",
    content: "登录后公告窗会展示平台账号编号、陪伴天数、总 token 消耗、模型数、agent 数以及更多公告信息，后续可继续扩展。",
    pinned: false,
    sortOrder: 80,
  },
];

export async function ensureDefaultAnnouncements() {
  const count = await prisma.announcement.count();
  if (count > 0) return;

  await prisma.announcement.createMany({
    data: DEFAULT_ANNOUNCEMENTS.map((item) => ({
      ...item,
      status: "ACTIVE",
    })),
  });
}

export async function listActiveAnnouncements() {
  await ensureDefaultAnnouncements();
  const now = new Date();
  return await prisma.announcement.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { startsAt: null, endsAt: null },
        { startsAt: null, endsAt: { gte: now } },
        { startsAt: { lte: now }, endsAt: null },
        { startsAt: { lte: now }, endsAt: { gte: now } },
      ],
    },
    orderBy: [
      { pinned: "desc" },
      { sortOrder: "desc" },
      { createdAt: "desc" },
    ],
  });
}
