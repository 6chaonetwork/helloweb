"use client";

import { useEffect, useMemo, useState } from "react";

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
  environment: "DEV",
};

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

    load();
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
    return <div className="rounded-3xl border border-white/10 bg-white/4 p-6 text-white/72">正在加载配置...</div>;
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <p className="m-0 text-xs text-white/50">Channel Basics</p>
        <h2 className="mb-4 mt-3 text-2xl font-semibold">基础配置</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-white/72">Channel Type</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={channelType} disabled />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">环境</span>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white"
              value={form.environment}
              onChange={(event) => updateField("environment", event.target.value as "DEV" | "STAGING" | "PROD")}
            >
              <option value="DEV">DEV</option>
              <option value="STAGING">STAGING</option>
              <option value="PROD">PROD</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white md:col-span-2">
            <input type="checkbox" checked={form.enabled} onChange={(event) => updateField("enabled", event.target.checked)} />
            <span>启用公众号/官方通道</span>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <p className="m-0 text-xs text-white/50">Official Account</p>
        <h2 className="mb-4 mt-3 text-2xl font-semibold">公众号参数</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-white/72">原始 ID</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.originalId} onChange={(event) => updateField("originalId", event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">AppID</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.appId} onChange={(event) => updateField("appId", event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">AppSecret</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.appSecretEncrypted} onChange={(event) => updateField("appSecretEncrypted", event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">Token / Verify Token</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.verifyToken} onChange={(event) => updateField("verifyToken", event.target.value)} />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm text-white/72">EncodingAESKey</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.encodingAesKeyEncrypted} onChange={(event) => updateField("encodingAesKeyEncrypted", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <p className="m-0 text-xs text-white/50">Endpoints</p>
        <h2 className="mb-4 mt-3 text-2xl font-semibold">回调与登录地址</h2>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/72">回调地址 / Callback URL</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.callbackUrl} onChange={(event) => updateField("callbackUrl", event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">Webhook URL</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.webhookUrl} onChange={(event) => updateField("webhookUrl", event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">二维码登录基地址</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.qrLoginBaseUrl} onChange={(event) => updateField("qrLoginBaseUrl", event.target.value)} />
          </label>
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c1224] px-4 py-3 text-sm text-white/60">
            当前回调预览：{callbackPreview}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <p className="m-0 text-xs text-white/50">Runtime Policy</p>
        <h2 className="mb-4 mt-3 text-2xl font-semibold">扫码登录策略</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-white/72">允许平台（逗号分隔）</span>
            <input className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.allowedPlatforms} onChange={(event) => updateField("allowedPlatforms", event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">设备绑定模式</span>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white"
              value={form.deviceBindingMode}
              onChange={(event) => updateField("deviceBindingMode", event.target.value)}
            >
              <option value="OPTIONAL">OPTIONAL</option>
              <option value="REQUIRED">REQUIRED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">Challenge TTL（秒）</span>
            <input type="number" className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.challengeTtlSeconds} onChange={(event) => updateField("challengeTtlSeconds", Number(event.target.value))} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/72">轮询间隔（毫秒）</span>
            <input type="number" className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white" value={form.pollingIntervalMs} onChange={(event) => updateField("pollingIntervalMs", Number(event.target.value))} />
          </label>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 font-semibold text-[#08101f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "保存中..." : "保存配置"}
        </button>
      </div>
    </form>
  );
}
