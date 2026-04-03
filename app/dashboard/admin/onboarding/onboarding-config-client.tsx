"use client";

import { useEffect, useState } from "react";

type StatusCard = {
  label: string;
  value: string;
};

type OnboardingConfigRecord = {
  key: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  featureTagsJson: string[];
  qrTitle: string;
  stepsJson: string[];
  statusSectionTitle: string;
  statusTitle: string;
  statusDescription: string;
  statusCardsJson: StatusCard[];
  completionTip: string;
  primaryButton: string;
  secondaryButton: string;
  contactText: string;
};

const defaultForm = {
  badge: "",
  titleLine1: "",
  titleLine2: "",
  description: "",
  featureTags: "一键安装\n记忆能力优化\n多款 Skill 接入\n账号概览",
  qrTitle: "",
  steps: "",
  statusSectionTitle: "",
  statusTitle: "",
  statusDescription: "",
  statusCards: '[{"label":"STATUS","value":"已登录"},{"label":"PROFILE","value":"平台身份已生成"},{"label":"MODE","value":"桌面端接入"}]',
  completionTip: "",
  primaryButton: "",
  secondaryButton: "",
  contactText: "",
};

export function OnboardingConfigClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/onboarding-config", { cache: "no-store" });
        const payload = (await response.json()) as { config?: OnboardingConfigRecord; error?: string };
        if (!response.ok || !payload.config) {
          throw new Error(payload.error || "加载公告窗配置失败");
        }
        setForm({
          badge: payload.config.badge,
          titleLine1: payload.config.titleLine1,
          titleLine2: payload.config.titleLine2,
          description: payload.config.description,
          featureTags: payload.config.featureTagsJson.join("\n"),
          qrTitle: payload.config.qrTitle,
          steps: payload.config.stepsJson.join("\n"),
          statusSectionTitle: payload.config.statusSectionTitle,
          statusTitle: payload.config.statusTitle,
          statusDescription: payload.config.statusDescription,
          statusCards: JSON.stringify(payload.config.statusCardsJson, null, 2),
          completionTip: payload.config.completionTip,
          primaryButton: payload.config.primaryButton,
          secondaryButton: payload.config.secondaryButton,
          contactText: payload.config.contactText,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "加载公告窗配置失败");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/onboarding-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          badge: form.badge,
          titleLine1: form.titleLine1,
          titleLine2: form.titleLine2,
          description: form.description,
          featureTags: form.featureTags.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          qrTitle: form.qrTitle,
          steps: form.steps.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          statusSectionTitle: form.statusSectionTitle,
          statusTitle: form.statusTitle,
          statusDescription: form.statusDescription,
          statusCards: JSON.parse(form.statusCards),
          completionTip: form.completionTip,
          primaryButton: form.primaryButton,
          secondaryButton: form.secondaryButton,
          contactText: form.contactText,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "保存公告窗配置失败");
      }
      setSuccess("公告窗配置已保存");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存公告窗配置失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-white/4 p-6 text-white/72">正在加载配置...</div>;
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <h2 className="mb-4 text-2xl font-semibold">顶部文案配置</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.badge} onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))} placeholder="Badge" />
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.qrTitle} onChange={(event) => setForm((prev) => ({ ...prev, qrTitle: event.target.value }))} placeholder="右侧登录标题" />
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.titleLine1} onChange={(event) => setForm((prev) => ({ ...prev, titleLine1: event.target.value }))} placeholder="主标题第一行" />
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.titleLine2} onChange={(event) => setForm((prev) => ({ ...prev, titleLine2: event.target.value }))} placeholder="主标题第二行" />
        </div>
        <textarea className="mt-4 min-h-[120px] rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="说明文案" />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <h2 className="mb-4 text-2xl font-semibold">标签与步骤</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <textarea className="min-h-[140px] rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white" value={form.featureTags} onChange={(event) => setForm((prev) => ({ ...prev, featureTags: event.target.value }))} placeholder="标签，每行一条" />
          <textarea className="min-h-[140px] rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white" value={form.steps} onChange={(event) => setForm((prev) => ({ ...prev, steps: event.target.value }))} placeholder="步骤，每行一条" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <h2 className="mb-4 text-2xl font-semibold">状态与底部文案</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.statusSectionTitle} onChange={(event) => setForm((prev) => ({ ...prev, statusSectionTitle: event.target.value }))} placeholder="状态标题" />
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.statusTitle} onChange={(event) => setForm((prev) => ({ ...prev, statusTitle: event.target.value }))} placeholder="状态主文案" />
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.primaryButton} onChange={(event) => setForm((prev) => ({ ...prev, primaryButton: event.target.value }))} placeholder="主按钮文案" />
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.secondaryButton} onChange={(event) => setForm((prev) => ({ ...prev, secondaryButton: event.target.value }))} placeholder="次按钮文案" />
          <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white md:col-span-2" value={form.contactText} onChange={(event) => setForm((prev) => ({ ...prev, contactText: event.target.value }))} placeholder="联系方式" />
        </div>
        <textarea className="mt-4 min-h-[120px] rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white" value={form.statusDescription} onChange={(event) => setForm((prev) => ({ ...prev, statusDescription: event.target.value }))} placeholder="状态说明" />
        <textarea className="mt-4 min-h-[120px] rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 font-mono text-white" value={form.statusCards} onChange={(event) => setForm((prev) => ({ ...prev, statusCards: event.target.value }))} placeholder='状态卡 JSON，例如 [{"label":"STATUS","value":"已登录"}]' />
        <textarea className="mt-4 min-h-[100px] rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white" value={form.completionTip} onChange={(event) => setForm((prev) => ({ ...prev, completionTip: event.target.value }))} placeholder="完成提示" />
      </section>

      {error ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 font-semibold text-[#08101f] disabled:opacity-60"
        >
          {saving ? "保存中..." : "保存公告窗配置"}
        </button>
      </div>
    </form>
  );
}
