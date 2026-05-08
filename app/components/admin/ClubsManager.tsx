"use client";
import React, { useState } from "react";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import Image from "next/image";

export default function ClubsManager({ clubs, onRefresh }: { clubs: any[]; onRefresh: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "", clubId: "", nameEn: "", nameMn: "",
    descEn: "", descMn: "", website: "", email: "", imageUrl: "",
  });

  const openCreate = () => {
    setForm({ id: "", clubId: "", nameEn: "", nameMn: "", descEn: "", descMn: "", website: "", email: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const openEdit = (club: any) => {
    setForm({
      id: club._id,
      clubId: club.clubId || "",
      nameEn: club.name?.en || "",
      nameMn: club.name?.mn || "",
      descEn: club.description?.en || "",
      descMn: club.description?.mn || "",
      website: club.website || "",
      email: club.email || "",
      imageUrl: club.image || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this club?")) return;
    setLoading(true);
    await fetch(`/api/admin/clubs?id=${id}`, { method: "DELETE" });
    onRefresh();
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.nameEn || !form.nameMn) {
      alert("Please fill in club names in both languages.");
      return;
    }
    setLoading(true);
    const body = new FormData();
    if (form.id) body.append("id", form.id);
    body.append("clubId", form.clubId);
    body.append("nameEn", form.nameEn);
    body.append("nameMn", form.nameMn);
    body.append("descEn", form.descEn);
    body.append("descMn", form.descMn);
    body.append("website", form.website);
    body.append("email", form.email);

    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/clubs", { method, body });
    if (res.ok) { setIsModalOpen(false); onRefresh(); }
    else alert("Save failed.");
    setLoading(false);
  };

  const Field = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Clubs</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#E31B23] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg"
        >
          <Plus size={16} /> Add Club
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold">{form.id ? "Edit Club" : "Create Club"}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Club ID (slug)" value={form.clubId} onChange={(v: string) => setForm({ ...form, clubId: v })} />
                <Field label="Email" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} type="email" />
                <Field label="Name (Mongolian)" value={form.nameMn} onChange={(v: string) => setForm({ ...form, nameMn: v })} />
                <Field label="Name (English)" value={form.nameEn} onChange={(v: string) => setForm({ ...form, nameEn: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description (MN)</label>
                  <textarea value={form.descMn} onChange={(e) => setForm({ ...form, descMn: e.target.value })} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description (EN)</label>
                  <textarea value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] resize-none" />
                </div>
              </div>
              <Field label="Website URL" value={form.website} onChange={(v: string) => setForm({ ...form, website: v })} />
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-500 font-bold">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[#E31B23] text-white rounded-lg font-bold flex items-center gap-2"
              >
                {loading && <FaSpinner className="animate-spin" />}
                {form.id ? "Save Changes" : "Create Club"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-4">Club</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Website</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clubs.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-sm text-slate-400 italic">No clubs yet.</td></tr>
            ) : clubs.map((club: any) => (
              <tr key={club._id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {club.image && (
                      <Image src={club.image} alt="" width={40} height={40} className="w-10 h-10 object-cover rounded-lg" />
                    )}
                    <div>
                      <p className="font-bold text-sm">{club.name?.en}</p>
                      <p className="text-xs text-slate-400">{club.name?.mn}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">{club.email}</td>
                <td className="p-4 text-sm">
                  {club.website ? <a href={club.website} target="_blank" className="text-[#E31B23] hover:underline">{club.website}</a> : "—"}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(club)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(club._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
