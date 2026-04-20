"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActiveDesktopUpdate = {
  version: string;
  fileName: string;
  sha256: string;
  publishedAt?: string | null;
  notes?: string | null;
  downloadUrl: string;
};

type DesktopUpdateDistributionConfig = {
  deliveryMode: "local" | "oss";
  ossBaseUrl?: string;
};

type DesktopUpdateFileRecord = {
  fileName: string;
  size: number;
  updatedAt: string;
  active: boolean;
};

type DesktopUpdatesResponse = {
  config: DesktopUpdateDistributionConfig;
  active: ActiveDesktopUpdate | null;
  files: DesktopUpdateFileRecord[];
};

export function DesktopUpdatesClient() {
  const [active, setActive] = useState<ActiveDesktopUpdate | null>(null);
  const [files, setFiles] = useState<DesktopUpdateFileRecord[]>([]);
  const [config, setConfig] = useState<DesktopUpdateDistributionConfig>({
    deliveryMode: "local",
    ossBaseUrl: "",
  });
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [patchFile, setPatchFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishedSnapshot, setPublishedSnapshot] = useState<ActiveDesktopUpdate | null>(null);

  const selectedFileLabel = useMemo(() => patchFile?.name || "尚未选择补丁文件", [patchFile]);
  const ossSuggestedPath = useMemo(() => {
    if (!publishedSnapshot) return "";
    if (config.deliveryMode !== "oss" || !config.ossBaseUrl) return "";
    const normalizedBase = config.ossBaseUrl.endsWith("/") ? config.ossBaseUrl : `${config.ossBaseUrl}/`;
    return new URL(`./${publishedSnapshot.fileName}`, normalizedBase).toString();
  }, [config.deliveryMode, config.ossBaseUrl, publishedSnapshot]);

  useEffect(() => {
    void loadState();
  }, []);

  async function loadState() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/desktop-updates", {
        cache: "no-store",
      });
      const payload = (await response.json()) as DesktopUpdatesResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "加载桌面更新配置失败");
      }
      setConfig(payload.config ?? { deliveryMode: "local", ossBaseUrl: "" });
      setActive(payload.active ?? null);
      setFiles(payload.files ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载桌面更新配置失败");
      setActive(null);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDistributionConfig() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/desktop-updates", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "保存分发配置失败");
      }
      setConfig(payload.config ?? config);
      setSuccess("桌面更新分发配置已保存。");
      await loadState();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存分发配置失败");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!version.trim()) {
        throw new Error("请先填写补丁版本号");
      }
      if (!patchFile) {
        throw new Error("请先选择 .asar 补丁文件");
      }

      const formData = new FormData();
      formData.set("version", version.trim());
      formData.set("notes", notes.trim());
      formData.set("patch", patchFile);

      const response = await fetch("/api/admin/desktop-updates", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "发布桌面补丁失败");
      }

      setPublishedSnapshot(payload.active ?? null);
      setPatchFile(null);
      setVersion("");
      setNotes("");
      setSuccess("桌面补丁已发布，客户端下次检查更新即可获取。");
      await loadState();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "发布桌面补丁失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleClearActive() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/desktop-updates", {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "清除当前桌面补丁失败");
      }
      setSuccess("当前活动补丁已清除。");
      await loadState();
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "清除当前桌面补丁失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <div className="grid gap-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">分发方式</h2>
          <p className="mt-1 text-sm leading-7 text-zinc-500">
            选择客户端补丁下载地址是走本站静态目录，还是直接返回 OSS / CDN 地址。
          </p>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, deliveryMode: "local" }))}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  config.deliveryMode === "local"
                    ? "border-claw-red bg-red-50 ring-2 ring-red-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <div className="font-medium text-zinc-900">本地静态分发</div>
                <div className="mt-2 text-sm leading-6 text-zinc-500">
                  公共接口返回本站 `/updates/desktop/windows-x64/` 下的静态文件地址。
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, deliveryMode: "oss" }))}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  config.deliveryMode === "oss"
                    ? "border-claw-red bg-red-50 ring-2 ring-red-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <div className="font-medium text-zinc-900">OSS / CDN 分发</div>
                <div className="mt-2 text-sm leading-6 text-zinc-500">
                  公共接口直接返回你配置的 OSS 基础地址拼出来的下载链接。
                </div>
              </button>
            </div>

            <Input
              className="border-zinc-200 bg-white text-zinc-900"
              placeholder="OSS 基础地址，例如 https://oss.example.com/desktop/windows-x64/"
              value={config.ossBaseUrl || ""}
              onChange={(event) => setConfig((prev) => ({ ...prev, ossBaseUrl: event.target.value }))}
              disabled={config.deliveryMode !== "oss"}
            />

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveDistributionConfig()}
                className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                保存分发配置
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">发布桌面补丁</h2>
              <p className="mt-1 text-sm leading-7 text-zinc-500">
                上传 HelloClaw 桌面端的 .asar 补丁，系统会自动计算 SHA-256 并生成客户端所需的更新清单。
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadState()}
              disabled={loading}
              className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              刷新
            </Button>
          </div>

          <form onSubmit={handlePublish} className="mt-6 grid gap-4">
            <Input
              className="border-zinc-200 bg-white text-zinc-900"
              placeholder="补丁版本号，例如 2.2.15"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            />

            <textarea
              className="min-h-[110px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              placeholder="可选：填写这次补丁的更新说明"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />

            <label className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-500">
                  <UploadCloud size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-zinc-900">选择桌面补丁文件</div>
                  <div className="mt-1 truncate text-xs text-zinc-500">{selectedFileLabel}</div>
                </div>
              </div>
              <input
                type="file"
                accept=".asar"
                className="mt-4 block w-full text-sm text-zinc-500 file:mr-4 file:rounded-full file:border-0 file:bg-claw-red file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-claw-red/92"
                onChange={(event) => setPatchFile(event.target.files?.[0] ?? null)}
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-claw-red text-white shadow-[0_10px_24px_rgba(230,0,0,0.16)] hover:bg-claw-red/92"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                发布补丁
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={saving || !active}
                onClick={() => void handleClearActive()}
                className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                清除当前活动补丁
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid gap-6">
        {publishedSnapshot ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">本次发布结果</h2>
            <p className="mt-1 text-sm leading-7 text-zinc-600">
              下面是这次补丁发布后的关键字段。若你启用 OSS 分发，可直接把补丁文件上传到建议路径。
            </p>

            <div className="mt-6 grid gap-3">
              <InfoRow label="版本号" value={publishedSnapshot.version} />
              <InfoRow label="补丁文件名" value={publishedSnapshot.fileName} />
              <InfoRow label="SHA-256" value={publishedSnapshot.sha256} />
              <InfoRow label="当前下载地址" value={publishedSnapshot.downloadUrl} />
              <InfoRow label="建议 OSS 路径" value={ossSuggestedPath || "当前不是 OSS 分发模式"} />
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">当前活动补丁</h2>
          <p className="mt-1 text-sm leading-7 text-zinc-500">
            客户端调用 `/api/public/update/check` 时会读取这里的活动清单与分发配置。
          </p>

          <div className="mt-6 grid gap-3">
            <InfoRow label="状态" value={active ? "已发布" : "未发布"} dotClassName={active ? "bg-emerald-500" : "bg-zinc-300"} />
            <InfoRow label="版本号" value={active?.version || "—"} />
            <InfoRow label="补丁文件" value={active?.fileName || "—"} />
            <InfoRow label="SHA-256" value={active?.sha256 || "—"} />
            <InfoRow label="发布时间" value={active?.publishedAt || "—"} />
            <InfoRow label="下载地址" value={active?.downloadUrl || "—"} />
            <InfoRow label="当前分发方式" value={config.deliveryMode === "oss" ? "OSS / CDN" : "本地静态"} />
            <InfoRow label="OSS 基础地址" value={config.ossBaseUrl || "—"} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">补丁文件列表</h2>
          <p className="mt-1 text-sm leading-7 text-zinc-500">
            当前静态目录中已经存在的桌面补丁文件。活动补丁会在这里标记。
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                    文件名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                    文件大小
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                    更新时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-500">
                      正在读取补丁文件列表...
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-500">
                      当前还没有可用的桌面补丁文件
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr key={file.fileName} className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50">
                      <td className="px-4 py-4 align-top text-zinc-900">{file.fileName}</td>
                      <td className="px-4 py-4 align-top text-zinc-500">{formatBytes(file.size)}</td>
                      <td className="px-4 py-4 align-top text-zinc-500">{file.updatedAt}</td>
                      <td className="px-4 py-4 align-top">
                        <Badge className={file.active ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-zinc-200 bg-zinc-50 text-zinc-600"}>
                          {file.active ? "活动补丁" : "历史补丁"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function InfoRow({
  label,
  value,
  dotClassName,
}: {
  label: string;
  value: string;
  dotClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="max-w-[220px] text-sm text-zinc-500">{label}</div>
      <div className="inline-flex max-w-[60%] items-center justify-end gap-2 text-right">
        {dotClassName ? <span className={`h-2 w-2 rounded-full ${dotClassName}`} /> : null}
        <span className="text-sm font-medium text-zinc-900 break-all">{value}</span>
      </div>
    </div>
  );
}
