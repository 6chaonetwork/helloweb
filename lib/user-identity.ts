import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const DISPLAY_NAME_PREFIX = "HC-";
const DISPLAY_NAME_START = 100;

function generatePublicUserId() {
  return randomBytes(16).toString("hex");
}

function computePrimaryName(input: {
  remarkName?: string | null;
  displayName?: string | null;
  wechatNickname?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  return (
    input.remarkName?.trim()
    || input.displayName?.trim()
    || input.wechatNickname?.trim()
    || input.name?.trim()
    || input.email?.trim()
    || "HC-User"
  );
}

export async function ensureUserDisplayIdentity(userId: string) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let displayName = user.displayName ?? null;
    let displayNameSeq = user.displayNameSeq ?? null;

    if (!displayName || displayNameSeq == null) {
      const counter = await tx.appCounter.upsert({
        where: { key: "user_display_name_seq" },
        update: {
          value: { increment: 1 },
        },
        create: {
          key: "user_display_name_seq",
          value: DISPLAY_NAME_START,
        },
      });

      displayNameSeq = counter.value;
      displayName = `${DISPLAY_NAME_PREFIX}${displayNameSeq}`;
    }

    let publicUserId = user.publicUserId ?? null;
    if (!publicUserId) {
      let next = generatePublicUserId();
      while (await tx.user.findUnique({ where: { publicUserId: next } })) {
        next = generatePublicUserId();
      }
      publicUserId = next;
    }

    const updated = await tx.user.update({
      where: { id: user.id },
      data: {
        displayName,
        displayNameSeq,
        publicUserId,
        name: computePrimaryName({
          remarkName: user.remarkName,
          displayName,
          wechatNickname: user.wechatNickname,
          name: user.name,
          email: user.email,
        }),
      },
    });

    return updated;
  });
}

export function resolveUserVisibleName(user: {
  remarkName?: string | null;
  displayName?: string | null;
  wechatNickname?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  return computePrimaryName(user);
}
