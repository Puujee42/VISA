"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";

type LangMap = { en?: string; mn?: string; de?: string };

type Question = {
  id?: string;
  _id?: string;
  fieldKey: string;
  label: LangMap;
  type: string;
  options: string[];
  required: boolean;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  placeholder?: LangMap;
};

const TYPES = [
  { value: "text", label: "Текст" },
  { value: "textarea", label: "Урт текст" },
  { value: "number", label: "Тоо" },
  { value: "email", label: "И-мэйл" },
  { value: "phone", label: "Утас" },
  { value: "select", label: "Сонголт" },
];

export default function QuestionsManager() {
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    fieldKey: "",
    labelMn: "",
    labelEn: "",
    type: "text",
    options: "",
    required: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/apply-questions");
      if (!res.ok) throw new Error("Асуулт ачаалж чадсангүй");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!draft.fieldKey.trim() || !draft.labelMn.trim()) {
      setError("Түлхүүр болон монгол нэр шаардлагатай");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/apply-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldKey: draft.fieldKey,
          label: {
            mn: draft.labelMn,
            en: draft.labelEn || draft.labelMn,
            de: draft.labelEn || draft.labelMn,
          },
          type: draft.type,
          options:
            draft.type === "select"
              ? draft.options
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
          required: draft.required,
          sortOrder: (items[items.length - 1]?.sortOrder || 100) + 10,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Үүсгэж чадсангүй");
      }
      setDraft({
        fieldKey: "",
        labelMn: "",
        labelEn: "",
        type: "text",
        options: "",
        required: true,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа");
    } finally {
      setSaving(false);
    }
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/apply-questions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) throw new Error("Хадгалж чадсангүй");
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Энэ асуултыг устгах уу?")) return;
    const res = await fetch(`/api/admin/apply-questions?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Устгаж чадсангүй");
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#E31B23]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center shrink-0">
            <HelpCircle size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Apply асуултууд</h2>
            <p className="text-sm text-slate-500 font-medium">
              Хэрэглэгчийн өргөдлийн маягтын талбаруудыг эндээс бэлдэнэ.
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm font-semibold text-[#E31B23] bg-red-50 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={draft.fieldKey}
            onChange={(e) =>
              setDraft((d) => ({ ...d, fieldKey: e.target.value }))
            }
            placeholder="Түлхүүр (жишээ: experience)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold"
          />
          <input
            value={draft.labelMn}
            onChange={(e) =>
              setDraft((d) => ({ ...d, labelMn: e.target.value }))
            }
            placeholder="Асуулт (MN)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold"
          />
          <input
            value={draft.labelEn}
            onChange={(e) =>
              setDraft((d) => ({ ...d, labelEn: e.target.value }))
            }
            placeholder="Асуулт (EN, заавал биш)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold"
          />
          <select
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {draft.type === "select" && (
            <input
              value={draft.options}
              onChange={(e) =>
                setDraft((d) => ({ ...d, options: e.target.value }))
              }
              placeholder="Сонголтууд (таслалаар: Тийм, Үгүй)"
              className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold"
            />
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) =>
                setDraft((d) => ({ ...d, required: e.target.checked }))
              }
            />
            Заавал
          </label>
          <button
            type="button"
            onClick={create}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#E31B23] text-white px-5 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Асуулт нэмэх
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((q) => {
          const id = String(q.id || q._id);
          return (
            <div
              key={id}
              className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="hidden md:flex text-slate-300">
                <GripVertical size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-black text-slate-900 truncate">
                    {q.label?.mn || q.label?.en || q.fieldKey}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {q.type}
                  </span>
                  {q.isSystem && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                      систем
                    </span>
                  )}
                  {!q.isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                      нуугдсан
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">{q.fieldKey}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title={q.isActive ? "Нуух" : "Харуулах"}
                  onClick={() => patch(id, { isActive: !q.isActive })}
                  className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#00C896]"
                >
                  {q.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    patch(id, {
                      label: {
                        ...q.label,
                        mn: prompt("Монгол нэр", q.label?.mn || "") || q.label?.mn,
                      },
                    })
                  }
                  className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
                >
                  <Save size={16} />
                </button>
                {!q.isSystem && (
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#E31B23]"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
