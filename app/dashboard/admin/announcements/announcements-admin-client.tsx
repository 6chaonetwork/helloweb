"use client";

import { useEffect, useState } from "react";

type AnnouncementItem = {
  id: string;
  category: string;
  title: string;
  content: string;
  summary: string | null;
  status: string;
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementResponse = {
  items: AnnouncementItem[];
};

const defaultForm = {
  category: "官方公告",
  title: "",
  summary: "",
  content: "",
  status: "ACTIVE",
  pinned: false,
  sortOrder: 0,
};

export function AnnouncementsAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/announcements", { cache: "no-store" });
      const payload = (await response.json()) as AnnouncementResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "加载公告失败");
      }
      setItems(payload.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载公告失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(defaultForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "保存公告失败");
      }
      resetForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存公告失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "删除公告失败");
      }
      if (editingId === id) {
        resetForm();
      }
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除公告失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-3xl border border-white/10 bg-white/4 p-4">
        <h2 className="mb-4 text-xl font-semibold text-white">{editingId ? "编辑公告" : "新增公告"}</h2>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <input
            className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white"
            placeholder="分类"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <input
            className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white"
            placeholder="标题"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <input
            className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white"
            placeholder="摘要"
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          />
          <textarea
            className="min-h-[150px] rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white"
            placeholder="正文"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white"
              placeholder="排序"
              value={form.sortOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
            />
            <select
              className="h-12 rounded-2xl border border-white/10 bg-[#0c1224] px-4 text-white"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1224] px-4 py-3 text-white">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(event) => setForm((prev) => ({ ...prev, pinned: event.target.checked }))}
            />
            <span>置顶公告</span>
          </label>

          {error ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 font-semibold text-[#08101f] disabled:opacity-60"
            >
              {saving ? "保存中..." : editingId ? "保存修改" : "新增公告"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 font-semibold text-white"
            >
              重置
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/4 p-4">
        <h2 className="mb-4 text-xl font-semibold text-white">公告列表</h2>
        {loading ? (
          <div className="text-white/60">加载中...</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-[#0c1224] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 text-[11px] text-white/44">
                      <span className="rounded-full border border-white/10 px-2 py-1">{item.category}</span>
                      <span className="rounded-full border border-white/10 px-2 py-1">{item.status}</span>
                      {item.pinned ? <span className="rounded-full border border-fuchsia-400/35 px-2 py-1 text-fuchsia-200">PINNED</span> : null}
                    </div>
                    <div className="mt-3 text-lg font-semibold text-white">{item.title}</div>
                    {item.summary ? <div className="mt-2 text-sm text-white/60">{item.summary}</div> : null}
                    <div className="mt-2 text-[12px] leading-5 text-white/48">{item.content}</div>
                  </div>
                  <div className="text-right text-[11px] text-white/36">
                    <div>{item.updatedAt.slice(0, 10)}</div>
                    <div className="mt-2">sort {item.sortOrder}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({
                        category: item.category,
                        title: item.title,
                        summary: item.summary || "",
                        content: item.content,
                        status: item.status,
                        pinned: item.pinned,
                        sortOrder: item.sortOrder,
                      });
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 px-4 text-sm font-semibold text-red-200"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
