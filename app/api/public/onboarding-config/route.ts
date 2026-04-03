import { NextResponse } from "next/server";
import { buildCorsPreflightResponse, withCors } from "@/lib/cors";

const onboardingConfig = {
  wechatQrOnboarding: {
    badge: "Hello claw · 一键安装与快速接入",
    titleLine1: "扫微信扫一扫",
    titleLine2: "立刻使用 Hello claw",
    description:
      "Hello claw 面向真实业务落地打造，不只是兼容 OpenClaw 基础能力，更针对功能缺陷、使用体验与协作效率做了全面优化。支持一键安装、记忆能力优化、多场景一键接入、多款 Skill 能力接入，并对运营环境进行了深度优化。智能体支持灵活添加，可快速组成多智能体协作流程，帮助用户更高效地完成复杂任务。",
    featureTags: ["一键安装", "记忆能力优化", "多款 Skill 接入", "智能体自由协作"],
    qrTitle: "扫微信扫一扫，立刻完成接入",
    steps: [
      "扫微信二维码，快速进入 Hello claw 接入流程。",
      "完成授权后，即可开始使用记忆优化、多场景接入、Skill 扩展与多智能体协作等完整能力。",
      "从安装、接入到正式使用，整体流程更简单、更稳定，也更适合真实业务持续运行。",
    ],
    statusSectionTitle: "当前接入状态",
    statusTitle: "接入已完成，当前设备已成功连接 Hello claw",
    statusDescription:
      "扫码状态会自动刷新，用户确认后即可进入可用状态。接入完成后，可直接使用多智能体协作、记忆增强、Skill 接入与多场景任务能力。",
    statusCards: [
      { label: "STATUS", value: "已接入" },
      { label: "MEMORY", value: "已优化" },
      { label: "MODE", value: "多智能体协作中" },
    ],
    completionTip: "接入完成后，后续再次打开时无需重复扫码，可直接进入 helloclaw 使用环境。",
    primaryButton: "刷新二维码",
    secondaryButton: "稍后处理",
    contactText: "如需企业定制请致电：183-4009-7360",
  },
};

export function OPTIONS(request: Request) {
  return buildCorsPreflightResponse(request.headers.get("origin"));
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  return withCors(
    NextResponse.json(onboardingConfig, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    }),
    origin,
  );
}
