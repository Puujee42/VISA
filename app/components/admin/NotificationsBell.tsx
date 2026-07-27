"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "@/navigation";

type Notif = {
  id?: string;
  _id?: string;
  title: string;
  body?: string;
  link?: string;
  isRead?: boolean;
  createdAt?: string;
  type?: string;
};

export default function NotificationsBell({
  onOpenApplications,
}: {
  onOpenApplications?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const markAll = async () => {
    await fetch("/api/admin/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    await load();
  };

  const openItem = async (n: Notif) => {
    const id = n.id || n._id;
    if (id) {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    setOpen(false);
    if (n.type === "application" && onOpenApplications) {
      onOpenApplications();
    } else if (n.link?.includes("applications") && onOpenApplications) {
      onOpenApplications();
    } else if (n.link) {
      router.push(n.link.replace(/^\/[a-z]{2}(?=\/)/, "") || "/admin");
    }
    await load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#E31B23] hover:shadow-md transition-all relative"
        aria-label="Мэдэгдэл"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#E31B23] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(92vw,360px)] bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-black text-slate-900">Мэдэгдэл</p>
            <button
              type="button"
              onClick={markAll}
              className="text-[11px] font-bold text-[#00C896] inline-flex items-center gap-1"
            >
              <CheckCheck size={14} /> Бүгдийг уншсан
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="animate-spin text-slate-300" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400 font-medium">
                Мэдэгдэл байхгүй
              </p>
            ) : (
              items.map((n) => {
                const id = String(n.id || n._id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openItem(n)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${
                      n.isRead ? "opacity-70" : "bg-red-50/40"
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
