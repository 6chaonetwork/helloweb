import { prisma } from "@/lib/db";

export const DEFAULT_ONBOARDING_CONFIG = {
  key: "wechat_qr_onboarding",
  badge: "HELLO CLAW · 一键安装与快速接入",
  titleLine1: "扫微信扫一扫",
  titleLine2: "立刻使用 Hello claw",
  description:
    "Hello claw 面向真实业务落地打造，不只是兼容 OpenClaw 基础能力，还对功能缺陷、使用体验与协作效率做了全面优化。支持一键安装、记忆能力优化、多场景一键接入、多款 Skill 能力接入。",
  featureTags: ["一键安装", "记忆能力优化", "多款 Skill 接入", "账号概览"],
  qrTitle: "扫码关注后即可登录",
  steps: [
    "如果你已经关注公众号，直接扫码即可完成登录。",
    "如果你还没有关注公众号，请先在微信里点一下关注，随后会自动完成登录。",
    "二维码失效后会停留在当前状态，只有手动刷新才会重新生成。",
  ],
  statusSectionTitle: "当前状态",
  statusTitle: "登录已完成，当前设备已成功接入 Hello claw",
  statusDescription:
    "系统会自动轮询扫码状态。已关注用户扫码后直接登录；未关注用户先关注公众号，再自动完成登录。",
  statusCards: [
    { label: "STATUS", value: "已登录" },
    { label: "PROFILE", value: "平台身份已生成" },
    { label: "MODE", value: "桌面端接入" },
  ],
  completionTip: "登录完成后，你可以直接进入 Hello claw 正常使用环境。",
  primaryButton: "刷新二维码",
  secondaryButton: "关闭窗口",
  contactText: "如需企业定制请联系：183-4009-7360",
};

export async function ensureDefaultOnboardingConfig() {
  const existing = await prisma.onboardingConfig.findUnique({
    where: { key: DEFAULT_ONBOARDING_CONFIG.key },
  });
  if (existing) return existing;

  return await prisma.onboardingConfig.create({
    data: {
      key: DEFAULT_ONBOARDING_CONFIG.key,
      badge: DEFAULT_ONBOARDING_CONFIG.badge,
      titleLine1: DEFAULT_ONBOARDING_CONFIG.titleLine1,
      titleLine2: DEFAULT_ONBOARDING_CONFIG.titleLine2,
      description: DEFAULT_ONBOARDING_CONFIG.description,
      featureTagsJson: DEFAULT_ONBOARDING_CONFIG.featureTags,
      qrTitle: DEFAULT_ONBOARDING_CONFIG.qrTitle,
      stepsJson: DEFAULT_ONBOARDING_CONFIG.steps,
      statusSectionTitle: DEFAULT_ONBOARDING_CONFIG.statusSectionTitle,
      statusTitle: DEFAULT_ONBOARDING_CONFIG.statusTitle,
      statusDescription: DEFAULT_ONBOARDING_CONFIG.statusDescription,
      statusCardsJson: DEFAULT_ONBOARDING_CONFIG.statusCards,
      completionTip: DEFAULT_ONBOARDING_CONFIG.completionTip,
      primaryButton: DEFAULT_ONBOARDING_CONFIG.primaryButton,
      secondaryButton: DEFAULT_ONBOARDING_CONFIG.secondaryButton,
      contactText: DEFAULT_ONBOARDING_CONFIG.contactText,
    },
  });
}

export async function getPublicOnboardingConfig() {
  const config = await ensureDefaultOnboardingConfig();
  return {
    wechatQrOnboarding: {
      badge: config.badge,
      titleLine1: config.titleLine1,
      titleLine2: config.titleLine2,
      description: config.description,
      featureTags: Array.isArray(config.featureTagsJson) ? config.featureTagsJson : DEFAULT_ONBOARDING_CONFIG.featureTags,
      qrTitle: config.qrTitle,
      steps: Array.isArray(config.stepsJson) ? config.stepsJson : DEFAULT_ONBOARDING_CONFIG.steps,
      statusSectionTitle: config.statusSectionTitle,
      statusTitle: config.statusTitle,
      statusDescription: config.statusDescription,
      statusCards: Array.isArray(config.statusCardsJson) ? config.statusCardsJson : DEFAULT_ONBOARDING_CONFIG.statusCards,
      completionTip: config.completionTip,
      primaryButton: config.primaryButton,
      secondaryButton: config.secondaryButton,
      contactText: config.contactText,
    },
  };
}
