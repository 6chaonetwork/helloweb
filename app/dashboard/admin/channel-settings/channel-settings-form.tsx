"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ChannelConfig = {
  id: string;
  channelType: string;
  originalId?: string | null;
  appId?: string | null;
  appSecretEncrypted?: string | null;
  callbackUrl?: string | null;
  qrLoginBaseUrl?: string | null;
  signingSecretEncrypted?: string | null;
  encodingAesKeyEncrypted?: string | null;
  webhookUrl?: string | null;
  verifyToken?: string | null;
  allowedPlatforms?: string[] | null;
  deviceBindingMode?: string | null;
  challengeTtlSeconds?: number | null;
  pollingIntervalMs?: number | null;
  enabled: boolean;
  environment: "DEV" | "STAGING" | "PROD";
};

const defaultForm = {
  originalId: "",
  appId: "",
  appSecretEncrypted: "",
  callbackUrl: "",
  qrLoginBaseUrl: "",
  signingSecretEncrypted: "",
  encodingAesKeyEncrypted: "",
  webhookUrl: "",
  verifyToken: "",
  allowedPlatforms: "windows,mac,linux",
  deviceBindingMode: "OPTIONAL",
  challengeTtlSeconds: 300,
  pollingIntervalMs: 2000,
  enabled: false,
  environment: "DEV" as "DEV" | "STAGING" | "PROD",
};

const environmentOptions = ["DEV", "STAGING", "PROD"] as const;
const bindingModeOptions = ["OPTIONAL", "REQUIRED", "DISABLED"] as const;

export function ChannelSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [channelType, setChannelType] = useState("WECHAT_OFFICIAL_ACCOUNT");
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/channel-settings", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "加载配置失败");
          return;
        }

        const config = data.config as ChannelConfig;
        setChannelType(config.channelType);
        setForm({
          originalId: config.originalId || "",
          appId: config.appId || "",
          appSecretEncrypted: config.appSecretEncrypted || "",
          callbackUrl: config.callbackUrl || "",
          qrLoginBaseUrl: config.qrLoginBaseUrl || "",
          signingSecretEncrypted: config.signingSecretEncrypted || "",
          encodingAesKeyEncrypted: config.encodingAesKeyEncrypted || "",
          webhookUrl: config.webhookUrl || "",
          verifyToken: config.verifyToken || "",
          allowedPlatforms: Array.isArray(config.allowedPlatforms)
            ? config.allowedPlatforms.join(",")
            : "windows,mac,linux",
          deviceBindingMode: config.deviceBindingMode || "OPTIONAL",
          challengeTtlSeconds: config.challengeTtlSeconds || 300,
          pollingIntervalMs: config.pollingIntervalMs || 2000,
          enabled: config.enabled,
          environment: config.environment || "DEV",
        });
      } catch {
        setError("加载配置失败，请稍后再试");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const callbackPreview = useMemo(() => {
    return form.callbackUrl || "https://your-domain.com/api/wechat/callback";
  }, [form.callbackUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/channel-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalId: form.originalId,
          appId: form.appId,
          appSecretEncrypted: form.appSecretEncrypted,
          callbackUrl: form.callbackUrl,
          qrLoginBaseUrl: form.qrLoginBaseUrl,
          signingSecretEncrypted: form.signingSecretEncrypted,
          encodingAesKeyEncrypted: form.encodingAesKeyEncrypted,
          webhookUrl: form.webhookUrl,
          verifyToken: form.verifyToken,
          allowedPlatforms: form.allowedPlatforms
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          deviceBindingMode: form.deviceBindingMode,
          challengeTtlSeconds: Number(form.challengeTtlSeconds),
          pollingIntervalMs: Number(form.pollingIntervalMs),
          enabled: form.enabled,
          environment: form.environment,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "保存失败");
        return;
      }

      setSuccess("配置已保存");
    } catch {
      setError("保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  }

  function updateField<Key extends keyof typeof defaultForm>(key: Key, value: (typeof defaultForm)[Key]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Channel Basics</Badge>
          <CardTitle className="text-zinc-900">基础配置</CardTitle>
          <CardDescription className="text-zinc-500">先确定当前通道类型、运行环境和是否启用官方通道。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Channel Type">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={channelType} disabled />
          </Field>

          <Field label="环境">
            <Select value={form.environment} onValueChange={(value) => updateField("environment", value as typeof defaultForm.environment)}>
              <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                <SelectValue placeholder="选择环境" />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                {environmentOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 md:col-span-2">
            <input type="checkbox" checked={form.enabled} onChange={(event) => updateField("enabled", event.target.checked)} />
            <span>启用公众号 / 官方通道</span>
          </label>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Official Account</Badge>
          <CardTitle className="text-zinc-900">公众号参数</CardTitle>
          <CardDescription className="text-zinc-500">这里维护微信官方账号对接所需的核心凭据。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="原始 ID">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.originalId} onChange={(event) => updateField("originalId", event.target.value)} />
          </Field>
          <Field label="AppID">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.appId} onChange={(event) => updateField("appId", event.target.value)} />
          </Field>
          <Field label="AppSecret">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.appSecretEncrypted} onChange={(event) => updateField("appSecretEncrypted", event.target.value)} />
          </Field>
          <Field label="Token / Verify Token">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.verifyToken} onChange={(event) => updateField("verifyToken", event.target.value)} />
          </Field>
          <Field label="EncodingAESKey" className="md:col-span-2">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.encodingAesKeyEncrypted} onChange={(event) => updateField("encodingAesKeyEncrypted", event.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Endpoints</Badge>
          <CardTitle className="text-zinc-900">回调与登录地址</CardTitle>
          <CardDescription className="text-zinc-500">确定微信回调、Webhook 和二维码登录入口的实际地址。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="回调地址 / Callback URL">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.callbackUrl} onChange={(event) => updateField("callbackUrl", event.target.value)} />
          </Field>
          <Field label="Webhook URL">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.webhookUrl} onChange={(event) => updateField("webhookUrl", event.target.value)} />
          </Field>
          <Field label="二维码登录基地址">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.qrLoginBaseUrl} onChange={(event) => updateField("qrLoginBaseUrl", event.target.value)} />
          </Field>
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
            当前回调预览：{callbackPreview}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">Runtime Policy</Badge>
          <CardTitle className="text-zinc-900">扫码登录策略</CardTitle>
          <CardDescription className="text-zinc-500">控制平台白名单、设备绑定策略和挑战轮询参数。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="允许平台（逗号分隔）">
            <Input className="border-zinc-200 bg-white text-zinc-900" value={form.allowedPlatforms} onChange={(event) => updateField("allowedPlatforms", event.target.value)} />
          </Field>
          <Field label="设备绑定模式">
            <Select value={form.deviceBindingMode} onValueChange={(value) => updateField("deviceBindingMode", value)}>
              <SelectTrigger className="border-zinc-200 bg-white text-zinc-900">
                <SelectValue placeholder="选择模式" />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
                {bindingModeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Challenge TTL（秒）">
            <Input className="border-zinc-200 bg-white text-zinc-900" type="number" value={form.challengeTtlSeconds} onChange={(event) => updateField("challengeTtlSeconds", Number(event.target.value))} />
          </Field>
          <Field label="轮询间隔（毫秒）">
            <Input className="border-zinc-200 bg-white text-zinc-900" type="number" value={form.pollingIntervalMs} onChange={(event) => updateField("pollingIntervalMs", Number(event.target.value))} />
          </Field>
        </CardContent>
      </Card>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</div> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="lg" className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92">
          {saving ? "保存中..." : "保存配置"}
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
