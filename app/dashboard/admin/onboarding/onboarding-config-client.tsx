"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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
  statusCards:
    '[{"label":"STATUS","value":"已登录"},{"label":"PROFILE","value":"平台身份已生成"},{"label":"MODE","value":"桌面端接入"}]',
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
    return (
      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardContent className="p-6 text-zinc-500">正在加载配置...</CardContent>
      </Card>
    );
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Onboarding Content</Badge>
          <CardTitle className="text-zinc-900">欢迎引导配置</CardTitle>
          <CardDescription className="text-zinc-500">将顶部文案、步骤说明和状态区块拆分成更清晰的编辑区域。</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hero">
            <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-zinc-200 bg-transparent p-0">
              <TabsTrigger value="hero" className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none">
                顶部文案
              </TabsTrigger>
              <TabsTrigger value="flow" className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none">
                标签与步骤
              </TabsTrigger>
              <TabsTrigger value="status" className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-claw-red data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none">
                状态与底部
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hero">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Badge">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.badge} onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))} />
                </Field>
                <Field label="右侧登录标题">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.qrTitle} onChange={(event) => setForm((prev) => ({ ...prev, qrTitle: event.target.value }))} />
                </Field>
                <Field label="主标题第一行">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.titleLine1} onChange={(event) => setForm((prev) => ({ ...prev, titleLine1: event.target.value }))} />
                </Field>
                <Field label="主标题第二行">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.titleLine2} onChange={(event) => setForm((prev) => ({ ...prev, titleLine2: event.target.value }))} />
                </Field>
                <Field label="说明文案" className="md:col-span-2">
                  <Textarea className="min-h-[140px] border-zinc-200 bg-white text-zinc-900" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="flow">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="标签，每行一条">
                  <Textarea className="min-h-[180px] border-zinc-200 bg-white text-zinc-900" value={form.featureTags} onChange={(event) => setForm((prev) => ({ ...prev, featureTags: event.target.value }))} />
                </Field>
                <Field label="步骤，每行一条">
                  <Textarea className="min-h-[180px] border-zinc-200 bg-white text-zinc-900" value={form.steps} onChange={(event) => setForm((prev) => ({ ...prev, steps: event.target.value }))} />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="状态区标题">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.statusSectionTitle} onChange={(event) => setForm((prev) => ({ ...prev, statusSectionTitle: event.target.value }))} />
                </Field>
                <Field label="状态主文案">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.statusTitle} onChange={(event) => setForm((prev) => ({ ...prev, statusTitle: event.target.value }))} />
                </Field>
                <Field label="主按钮文案">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.primaryButton} onChange={(event) => setForm((prev) => ({ ...prev, primaryButton: event.target.value }))} />
                </Field>
                <Field label="次按钮文案">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.secondaryButton} onChange={(event) => setForm((prev) => ({ ...prev, secondaryButton: event.target.value }))} />
                </Field>
                <Field label="联系方式" className="md:col-span-2">
                  <Input className="border-zinc-200 bg-white text-zinc-900" value={form.contactText} onChange={(event) => setForm((prev) => ({ ...prev, contactText: event.target.value }))} />
                </Field>
                <Field label="状态说明" className="md:col-span-2">
                  <Textarea className="min-h-[120px] border-zinc-200 bg-white text-zinc-900" value={form.statusDescription} onChange={(event) => setForm((prev) => ({ ...prev, statusDescription: event.target.value }))} />
                </Field>
                <Field label="状态卡 JSON" className="md:col-span-2">
                  <Textarea className="min-h-[180px] border-zinc-200 bg-white font-mono text-zinc-900" value={form.statusCards} onChange={(event) => setForm((prev) => ({ ...prev, statusCards: event.target.value }))} />
                </Field>
                <Field label="完成提示" className="md:col-span-2">
                  <Textarea className="min-h-[120px] border-zinc-200 bg-white text-zinc-900" value={form.completionTip} onChange={(event) => setForm((prev) => ({ ...prev, completionTip: event.target.value }))} />
                </Field>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</div> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="lg" className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92">
          {saving ? "保存中..." : "保存公告窗配置"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className ? `grid gap-2 ${className}` : "grid gap-2"}>
      <span className="text-sm text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
