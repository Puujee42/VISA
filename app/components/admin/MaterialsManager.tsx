"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Plus, Trash2, Globe, User, Clock, 
  ChevronDown, Search, Loader2, Sparkles, Folder, Check
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Material {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  category: string;
  isForAll: boolean;
  sentTo: string[];
  createdAt: string;
}

export default function MaterialsManager() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "guide",
    isForAll: true,
    sentTo: [] as string[],
    fileUrl: "",
    fileName: "",
    fileType: "other",
  });

  const categories = [
    { value: "guide", label: "Гарын авлага / Guide" },
    { value: "form", label: "Маягт / Form" },
    { value: "study", label: "Сургалт / Study" },
    { value: "document", label: "Баримт бичиг / Document" },
    { value: "announcement", label: "Мэдэгдэл / Announcement" },
    { value: "other", label: "Бусад / Other" },
  ];

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/admin/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(
          data.map((u: any) => ({
            id: u._id,
            name: u.fullName || u.firstName || "Unknown User",
            email: u.email || "No Email",
            role: u.role || "guest",
          }))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchMaterials(), fetchUsers()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "visa_preset"
    );

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      // Determine resource type: raw for pdf/docx, image for images, video for videos
      let resourceType = "auto";
      if (file.type.includes("pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        // Cloudinary raw uploads need specific endpoint or raw preset
        resourceType = "raw";
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        { method: "POST", body: data }
      );
      const uploadedFile = await res.json();
      
      if (uploadedFile.secure_url) {
        let type = "other";
        if (file.type.includes("pdf")) type = "pdf";
        else if (file.type.includes("image")) type = "image";
        else if (file.type.includes("video")) type = "video";
        else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) type = "docx";

        setFormData((prev) => ({
          ...prev,
          fileUrl: uploadedFile.secure_url,
          fileName: file.name,
          fileType: type,
        }));
      } else {
        alert("Upload failed. Verify Cloudinary config.");
      }
    } catch (err) {
      console.error(err);
      alert("File upload failed.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.fileUrl) {
      alert("Нэр болон файл оруулна уу.");
      return;
    }
    if (!formData.isForAll && formData.sentTo.length === 0) {
      alert("Илгээх хэрэглэгчийг сонгоно уу.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: "",
          description: "",
          category: "guide",
          isForAll: true,
          sentTo: [],
          fileUrl: "",
          fileName: "",
          fileType: "other",
        });
        await fetchMaterials();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Үйлдэл амжилтгүй боллоо.");
      }
    } catch (e) {
      console.error(e);
      alert("Холболтын алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
    try {
      const res = await fetch(`/api/admin/materials?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchMaterials();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleUserSelect = (userId: string) => {
    setFormData((prev) => {
      const selected = prev.sentTo.includes(userId)
        ? prev.sentTo.filter((id) => id !== userId)
        : [...prev.sentTo, userId];
      return { ...prev, sentTo: selected };
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Folder className="text-[#E31B23]" size={22} />
            Хэрэглэгчдийн материал / Materials Management
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Хэрэглэгчид рүү файл, гарын авлага, маягт илгээх
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#E31B23] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={16} /> Файл илгээх / Send File
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100">
          <Loader2 className="animate-spin text-[#E31B23] w-10 h-10 mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Уншиж байна...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4">Материал</th>
                  <th className="px-8 py-4">Ангилал</th>
                  <th className="px-8 py-4">Илгээсэн зорилтот хэсэг</th>
                  <th className="px-8 py-4">Огноо</th>
                  <th className="px-8 py-4 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-sm text-slate-400 italic font-bold">
                      Илгээсэн материал байхгүй байна.
                    </td>
                  </tr>
                ) : (
                  materials.map((m) => {
                    const matchedCategory = categories.find((c) => c.value === m.category);
                    return (
                      <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                              <FileText size={20} className={m.fileType === "pdf" ? "text-red-500" : "text-blue-500"} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900">{m.title}</p>
                              <a
                                href={m.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-500 font-bold hover:underline block mt-0.5"
                              >
                                {m.fileName} →
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                            {matchedCategory ? matchedCategory.label.split(" / ")[1] : "Other"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {m.isForAll ? (
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-50 text-blue-600 flex items-center gap-1.5 w-fit">
                              <Globe size={12} /> Бүх гишүүд (Broadcast)
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-50 text-amber-600 flex items-center gap-1.5 w-fit">
                              <User size={12} /> {m.sentTo?.length} гишүүн
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-400">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="p-2.5 text-slate-300 hover:text-[#E31B23] hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CREATE / SEND MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#E31B23]" />
                  Шинэ материал илгээх / Send Material
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="overflow-y-auto p-8 space-y-6 flex-1">
                {/* File Upload Box */}
                <div
                  onClick={() => !uploadingFile && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    formData.fileUrl
                      ? "border-emerald-200 bg-emerald-50/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {uploadingFile ? (
                    <div className="text-center py-4">
                      <Loader2 className="animate-spin text-[#E31B23] w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">Файлыг сервер рүү хуулж байна...</p>
                    </div>
                  ) : formData.fileUrl ? (
                    <div className="text-center py-2">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-emerald-600">
                        <Check size={24} />
                      </div>
                      <p className="text-sm font-black text-emerald-800">Файл амжилттай сонгогдлоо</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{formData.fileName}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="text-3xl text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-600">Энд дарж илгээх файлаа сонгоно уу</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">PDF, Image, DOCX, Word (Max 10MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                      Материалын гарчиг / Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Жишээ нь: Герман улсын визний мэдүүлэг"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 transition-all text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                      Ангилал / Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 transition-all appearance-none text-sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                    Нэмэлт тайлбар / Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Хэрэглэгчид өгөх заавар, зөвлөмж бичиж болно..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 transition-all resize-none text-sm"
                  />
                </div>

                {/* Target Audience selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                    Хэнд илгээх вэ? / Target Audience
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isForAll: true, sentTo: [] })}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                        formData.isForAll
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      Бүх хэрэглэгчид (Broadcast)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isForAll: false })}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                        !formData.isForAll
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      Сонгосон хэрэглэгчид (Targeted)
                    </button>
                  </div>
                </div>

                {/* Targeted User list */}
                {!formData.isForAll && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-4"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Хэрэглэгч хайх..."
                        value={searchUserQuery}
                        onChange={(e) => setSearchUserQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold w-full focus:outline-none focus:ring-2 focus:ring-[#E31B23]/10"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {filteredUsers.length === 0 ? (
                        <p className="text-xs italic text-slate-400 text-center py-4">Хэрэглэгч олдсонгүй.</p>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelected = formData.sentTo.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              onClick={() => toggleUserSelect(u.id)}
                              className="flex justify-between items-center py-2.5 px-2 hover:bg-white rounded-lg cursor-pointer transition-all"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-900">{u.name}</p>
                                <p className="text-[10px] text-slate-400">{u.email} · <span className="uppercase text-[9px] font-black">{u.role}</span></p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-[#E31B23] border-[#E31B23] text-white"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </m.div>
                )}

                <div className="pt-4 border-t flex justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Цуцлах / Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingFile}
                    className="px-8 py-3 bg-[#E31B23] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-100 disabled:opacity-50"
                  >
                    {submitting ? "Илгээж байна..." : "Илгээх / Send"}
                  </button>
                </div>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
