"use client";

import {
  Heart,
  Settings,
  User,
  X,
  MapPin,
  GraduationCap,
  Baby,
  Bell,
  Users,
  UserCheck,
  FileText,
  Clock,
  Check,
  Plus,
  Eye,
  Search,
  Globe,
  Edit3,
  Trash2,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Building,
} from "lucide-react";
import {
  FaBook,
  FaCalendarAlt,
  FaHandsHelping,
  FaPlus,
  FaTimes,
  FaSpinner,
  FaCloudUploadAlt,
  FaEdit,
  FaTrash,
  FaImage,
} from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LessonsManager from "@/app/components/admin/LessonsManager";
import ShoppingManager from "@/app/components/admin/ShoppingManager";
import ClubsManager from "@/app/components/admin/ClubsManager";
import { Link } from "@/navigation";

// --- CONSTANTS ---
const ROLES = ["Admin", "Student", "Guest"];
const STATUSES = ["Active", "Pending", "Suspended"];
const COUNTRIES = ["Germany", "Belgium", "Austria", "Switzerland", "France"];
const STEPS = [
  "Registration",
  "Documents",
  "Interview",
  "Matching",
  "Visa Process",
  "Departure",
];
const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
  DARK: "#0F172A",
};

// --- HELPER COMPONENTS ---
const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] transition-all"
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] transition-all resize-none"
    />
  </div>
);

const StatCard = ({ label, val, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex items-center gap-5">
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${colorClass}`}
    >
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900">{val}</p>
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
      }`}
  >
    <Icon size={18} className={active ? "text-[#E31B23]" : "text-slate-400"} />
    {label}
  </button>
);

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-400 hover:text-slate-600"
      }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

const UserMasterManagementModal = ({
  user,
  onClose,
  onSave,
}: {
  user: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) => {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({ ...user });

  const handleNestedChange = (path: string, value: any) => {
    const keys = path.split(".");
    const newData = { ...formData };
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setFormData(newData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 bg-[#FDFBF7] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black">
                {t("modals.master.title")}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                {t("modals.master.control")}: {user._id}
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["basic", "profile", "documents"].map((tab: any) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {activeTab === "basic" && (
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase text-[#E31B23] tracking-widest">
                  {t("modals.master.core")}
                </h4>
                <Input
                  label={t("modals.master.fullName")}
                  value={formData.fullName}
                  onChange={(v: string) =>
                    setFormData({ ...formData, fullName: v })
                  }
                />
                <Input
                  label={t("modals.master.email")}
                  value={formData.email}
                  onChange={(v: string) =>
                    setFormData({ ...formData, email: v })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    >
                      {ROLES.map((r: any) => (
                        <option key={r} value={r.toLowerCase()}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    >
                      {STATUSES.map((s: any) => (
                        <option key={s} value={s.toLowerCase()}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase text-[#E31B23] tracking-widest">
                  {t("modals.master.journey")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    >
                      {COUNTRIES.map((c: any) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Step
                    </label>
                    <select
                      value={formData.step}
                      onChange={(e) =>
                        setFormData({ ...formData, step: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    >
                      {STEPS.map((s: any) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Input
                  label="Student ID (Display)"
                  value={formData.studentId || ""}
                  onChange={(v: string) =>
                    setFormData({ ...formData, studentId: v })
                  }
                />
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                <section className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-[#E31B23] tracking-widest flex items-center gap-2">
                    <User size={14} /> Personal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Sex"
                      value={formData.profile?.sex || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.sex", v)
                      }
                    />
                    <Input
                      label="Nationality"
                      value={formData.profile?.nationality || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.nationality", v)
                      }
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={
                        formData.profile?.dob
                          ? new Date(formData.profile.dob)
                            .toISOString()
                            .split("T")[0]
                          : ""
                      }
                      onChange={(v: string) =>
                        handleNestedChange("profile.dob", v)
                      }
                    />
                    <Input
                      label="Religion"
                      value={formData.profile?.religion || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.religion", v)
                      }
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-[#E31B23] tracking-widest flex items-center gap-2">
                    <MapPin size={14} /> Contact & Location
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Phone"
                      value={formData.profile?.phone || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.phone", v)
                      }
                    />
                    <Input
                      label="Mobile"
                      value={formData.profile?.mobile || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.mobile", v)
                      }
                    />
                    <Input
                      label="Skype ID"
                      value={formData.profile?.skype || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.skype", v)
                      }
                    />
                    <Input
                      label="Best Time to Reach"
                      value={formData.profile?.bestTime || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.bestTime", v)
                      }
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Address Info
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Street"
                        value={formData.profile?.address?.street || ""}
                        onChange={(v: string) =>
                          handleNestedChange("profile.address.street", v)
                        }
                      />
                      <Input
                        label="Number"
                        value={formData.profile?.address?.number || ""}
                        onChange={(v: string) =>
                          handleNestedChange("profile.address.number", v)
                        }
                      />
                      <Input
                        label="City"
                        value={formData.profile?.address?.city || ""}
                        onChange={(v: string) =>
                          handleNestedChange("profile.address.city", v)
                        }
                      />
                      <Input
                        label="Postal Code"
                        value={formData.profile?.address?.postalCode || ""}
                        onChange={(v: string) =>
                          handleNestedChange("profile.address.postalCode", v)
                        }
                      />
                    </div>
                  </div>
                </section>
              </div>
              <div className="space-y-8">
                <section className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-[#E31B23] tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} /> Background
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Education Level"
                      value={formData.profile?.educationLevel || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.educationLevel", v)
                      }
                    />
                    <Input
                      label="Languages"
                      value={formData.profile?.languages || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.languages", v)
                      }
                    />
                    <Input
                      label="Father's Job"
                      value={formData.profile?.fatherProfession || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.fatherProfession", v)
                      }
                    />
                    <Input
                      label="Mother's Job"
                      value={formData.profile?.motherProfession || ""}
                      onChange={(v: string) =>
                        handleNestedChange("profile.motherProfession", v)
                      }
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-[#E31B23] tracking-widest flex items-center gap-2">
                    <Baby size={14} /> Experience
                  </h4>
                  <TextArea
                    label="Motivation Letter"
                    value={formData.profile?.motivation || ""}
                    onChange={(v: string) =>
                      handleNestedChange("profile.motivation", v)
                    }
                  />
                  <Input
                    label="Hobbies"
                    value={formData.profile?.hobbies || ""}
                    onChange={(v: string) =>
                      handleNestedChange("profile.hobbies", v)
                    }
                  />
                </section>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(formData.documents || {}).map(
                  ([key, url]: [string, any]) => (
                    <div
                      key={key}
                      className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                          {key}
                        </p>
                        {url ? (
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded inline-block w-fit font-bold">
                              Uploaded
                            </span>
                            <a
                              href={url}
                              target="_blank"
                              className="text-xs font-bold text-[#E31B23] hover:underline truncate"
                            >
                              {url}
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded font-bold">
                            Not Provided
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <Input
                          label="Direct URL Link"
                          placeholder="Paste URL to change..."
                          value={url || ""}
                          onChange={(v: string) =>
                            handleNestedChange(`documents.${key}`, v)
                          }
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-black uppercase text-[#E31B23] tracking-widest mb-4">
                  Internal Review
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Reviewed By
                    </p>
                    <p className="font-bold">
                      {formData.documentsReviewedBy || "Not reviewed yet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Approval Date
                    </p>
                    <p className="font-bold">
                      {formData.documentsApprovedAt
                        ? new Date(
                          formData.documentsApprovedAt,
                        ).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-[#FAFAFA] flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-4 font-black uppercase text-xs tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
          >
            Discard Changes
          </button>
          <button
            onClick={() => onSave(formData)}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#E31B23] transition-all hover:-translate-y-1 active:scale-95"
          >
            Save Master Record
          </button>
        </div>
      </m.div>
    </div>
  );
};

const ApplicationDetailsModal = ({
  app,
  onClose,
  onMasterEdit,
}: {
  app: any;
  onClose: () => void;
  onMasterEdit: (user: any) => void;
}) => {
  const t = useTranslations("admin");
  const profile = app.userProfile;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
      <m.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-[#FAFAFA]">
          <div>
            <h3 className="text-2xl font-black">Application Details</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {app.firstName} {app.lastName} • {app.programId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMasterEdit(app)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E31B23] transition-all shadow-md"
            >
              <Settings size={14} /> Full Control
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Email
              </p>
              <p className="font-bold text-sm">{app.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Phone
              </p>
              <p className="font-bold text-sm">{app.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Age
              </p>
              <p className="font-bold text-sm">{app.age}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Level
              </p>
              <p className="font-bold text-sm">{app.level}</p>
            </div>
          </section>

          {!profile ? (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl text-center">
              <p className="text-amber-700 text-sm font-bold">
                Detailed student profile not yet completed.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <section>
                  <h4 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-4">
                    <User size={14} /> Personal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {t("users.expanded.sex")}
                      </p>
                      <p className="font-bold text-sm capitalize">
                        {profile.sex || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {t("users.expanded.nationality")}
                      </p>
                      <p className="font-bold text-sm">
                        {profile.nationality || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {t("users.expanded.birth")}
                      </p>
                      <p className="font-bold text-sm">
                        {profile.dob
                          ? new Date(profile.dob).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {t("users.expanded.religion")}
                      </p>
                      <p className="font-bold text-sm">
                        {profile.religion || "-"}
                      </p>
                    </div>
                  </div>
                </section>
                <section>
                  <h4 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-4">
                    <MapPin size={14} /> Address & Contact
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">
                      {profile.address?.street} {profile.address?.number}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {profile.address?.city}, {profile.address?.country}{" "}
                      {profile.address?.postalCode}
                    </p>
                  </div>
                </section>
              </div>
              <div className="space-y-8">
                <section>
                  <h4 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-4">
                    <Baby size={14} /> Experience
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Ages
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.childcareExperience?.map((age: string) => (
                          <span
                            key={age}
                            className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold"
                          >
                            {age}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h4 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-4">
                    <Heart size={14} /> Motivation Letter
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                    "{profile.motivation || "No motivation provided."}"
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </m.div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApps: 0,
    articles: 0,
    studentsCount: 0,
    adminsCount: 0,
    guestsCount: 0,
    todaysBookings: 0,
  });

  const [isEditingUser, setIsEditingUser] = useState<string | null>(null);
  const [isMasterEditingUser, setIsMasterEditingUser] = useState<any | null>(
    null,
  );
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [userForm, setUserForm] = useState<any>({});

  // 1. FETCH ALL DATA
  const refreshData = async () => {
    try {
      const [
        usersRes,
        newsRes,
        bookingsRes,
        appsRes,
        statsRes,
        eventsRes,
        oppsRes,
        lessonsRes,
        ordersRes,
        clubsRes,
      ] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/news"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/applications"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/events"),
        fetch("/api/admin/opportunities"),
        fetch("/api/admin/lessons"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/clubs"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        // FIX: Add fallback for name
        setUsers(
          data.map((u: any) => ({
            ...u, // Keep original for master edit
            id: u._id,
            name: u.fullName || u.firstName || "Unknown User",
            role: u.role
              ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
              : "Guest",
            email: u.email || "No Email",
            status: u.status
              ? u.status.charAt(0).toUpperCase() + u.status.slice(1)
              : "Active",
            country: u.country || "-",
            step: u.step || "-",
          })),
        );
      }

      if (newsRes.ok) setBlogs(await newsRes.json());

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const processedBookings = bookingsData.map((b: any) => ({
          id: b._id,
          user: b.name || "Unknown",
          type: b.serviceTitle,
          time: b.time,
          date: b.date,
          status: b.status,
          email: b.email,
          phone: b.phone,
          livekitRoom: b.livekitRoom,
        }));

        setBookings(processedBookings);

        // Filter Upcoming vs Past
        const now = new Date();
        const upcoming = processedBookings
          .filter((b: any) => {
            const bookingDate = new Date(`${b.date}T${b.time}`);
            return (
              bookingDate >= now &&
              b.status !== "cancelled" &&
              b.status !== "rejected"
            );
          })
          .sort(
            (a: any, b: any) =>
              new Date(`${a.date}T${a.time}`).getTime() -
              new Date(`${b.date}T${b.time}`).getTime(),
          );

        const past = processedBookings
          .filter((b: any) => {
            const bookingDate = new Date(`${b.date}T${b.time}`);
            return (
              bookingDate < now ||
              b.status === "cancelled" ||
              b.status === "rejected" ||
              b.status === "completed"
            );
          })
          .sort(
            (a: any, b: any) =>
              new Date(`${b.date}T${b.time}`).getTime() -
              new Date(`${a.date}T${a.time}`).getTime(),
          );

        setUpcomingBookings(upcoming);
        setPastBookings(past);
      }
      if (appsRes.ok) setApplications(await appsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (oppsRes.ok) setOpportunities(await oppsRes.json());
      if (lessonsRes.ok) setLessons(await lessonsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (clubsRes.ok) setClubs(await clubsRes.json());

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats({
          totalUsers: s.totalUsers || 0,
          pendingApps: s.pendingApplications || 0,
          articles: s.blogsPublished || 0,
          studentsCount: s.studentsCount || 0,
          adminsCount: s.adminsCount || 0,
          guestsCount: s.guestsCount || 0,
          todaysBookings: s.todaysBookings || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- HANDLERS ---
  const handleEditUser = (user: any) => {
    setIsEditingUser(user.id);
    setUserForm({
      ...user,
      role: user.role,
      country: user.country === "-" ? COUNTRIES[0] : user.country,
      step: user.step === "-" ? STEPS[0] : user.step,
      status: user.status || "Active",
    });
  };

  const handleSaveUser = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: isEditingUser,
          action: "update_user",
          data: {
            fullName: userForm.name,
            role: userForm.role.toLowerCase(),
            country: userForm.role === "Student" ? userForm.country : null,
            step: userForm.role === "Student" ? userForm.step : "Registration",
            status: userForm.status.toLowerCase(),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save to DB");
      setIsEditingUser(null);
      refreshData();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save changes.");
    }
  };

  const handleSaveMaster = async (data: any) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data._id,
          action: "master_update",
          data: data,
        }),
      });

      if (!res.ok) throw new Error("Failed to master save");
      setIsMasterEditingUser(null);
      refreshData();
      alert("Master record updated successfully.");
    } catch (error) {
      console.error("Master save failed:", error);
      alert("Master update failed.");
    }
  };

  const handleDeleteUser = async (id: any) => {
    if (confirm("Delete this user?")) {
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      refreshData();
    }
  };

  const handleUpdateBooking = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, status }),
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error("Failed to update booking", e);
    }
  };

  const handleUpdateApplication = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, status }),
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error("Failed to update app", e);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex font-sans text-slate-900 selection:bg-[#E31B23] selection:text-white overflow-hidden">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-72 bg-[#F5F5F5] h-[100dvh] sticky top-0 p-6 flex flex-col justify-between hidden lg:flex border-r border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-[#E31B23] rounded-lg shadow-sm" />
            <span className="font-black text-xl tracking-tight">
              AuPair<span className="text-[#E31B23]">Admin</span>
            </span>
          </div>
          <nav className="space-y-1">
            <SidebarItem
              icon={LayoutDashboard}
              label={t("sidebar.dashboard")}
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            />
            <SidebarItem
              icon={Users}
              label={t("sidebar.users")}
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            />
            <SidebarItem
              icon={ClipboardList}
              label={t("sidebar.applications")}
              active={activeTab === "applications"}
              onClick={() => setActiveTab("applications")}
            />
            <SidebarItem
              icon={Calendar}
              label={t("sidebar.events")}
              active={activeTab === "events"}
              onClick={() => setActiveTab("events")}
            />
            <SidebarItem
              icon={FaBook}
              label={t("sidebar.lessons")}
              active={activeTab === "lessons"}
              onClick={() => setActiveTab("lessons")}
            />
            <SidebarItem
              icon={FileText}
              label={t("sidebar.blog")}
              active={activeTab === "blog"}
              onClick={() => setActiveTab("blog")}
            />
            <SidebarItem
              icon={ShoppingBag}
              label={t("sidebar.shopping") || "Shopping"}
              active={activeTab === "shopping"}
              onClick={() => setActiveTab("shopping")}
            />
            <SidebarItem
              icon={Calendar}
              label={t("sidebar.bookings")}
              active={activeTab === "bookings"}
              onClick={() => setActiveTab("bookings")}
            />
            <SidebarItem
              icon={ShoppingCart}
              label="Orders"
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
            />
            <SidebarItem
              icon={Building}
              label="Clubs"
              active={activeTab === "clubs"}
              onClick={() => setActiveTab("clubs")}
            />
          </nav>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-bold">{t("sidebar.role")}</p>
            <p className="text-[10px] text-[#00C896] font-bold uppercase">
              {t("sidebar.online")}
            </p>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1 capitalize tracking-tight">
              {activeTab === "blog"
                ? t("header.blog")
                : t(`sidebar.${activeTab}`)}
            </h1>
            <p className="text-slate-400 text-sm font-bold">
              {t("header.overview")}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#E31B23] hover:shadow-md transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#E31B23] rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* ─── DASHBOARD VIEW ─── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <StatCard
                label={t("dashboard.stats.totalUsers")}
                val={stats.totalUsers}
                icon={Users}
                colorClass="bg-slate-900"
              />
              <StatCard
                label={t("dashboard.stats.students")}
                val={stats.studentsCount}
                icon={GraduationCap}
                colorClass="bg-[#E31B23]"
              />
              <StatCard
                label={t("dashboard.stats.admins")}
                val={stats.adminsCount}
                icon={UserCheck}
                colorClass="bg-[#00C896]"
              />
              <StatCard
                label={t("dashboard.stats.guests")}
                val={stats.guestsCount}
                icon={User}
                colorClass="bg-slate-500"
              />
              <StatCard
                label={t("dashboard.stats.pendingApps")}
                val={stats.pendingApps}
                icon={ClipboardList}
                colorClass="bg-amber-500"
              />
              <StatCard
                label={t("dashboard.stats.articles")}
                val={stats.articles}
                icon={FileText}
                colorClass="bg-blue-500"
              />
              <StatCard
                label={t("dashboard.stats.todaysBookings")}
                val={stats.todaysBookings}
                icon={Calendar}
                colorClass="bg-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-lg text-slate-800">
                    {t("dashboard.bookings.queue")}
                  </h3>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="text-[10px] font-black bg-slate-50 px-3 py-1 rounded-lg uppercase text-slate-400"
                  >
                    {t("dashboard.bookings.viewAll")}
                  </button>
                </div>

                {/* --- UPCOMING BOOKINGS --- */}
                <div className="mb-8">
                  <h4 className="text-xs font-black text-[#E31B23] uppercase tracking-widest mb-4">
                    {t("dashboard.bookings.upcoming")}
                  </h4>
                  <div className="space-y-3">
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.slice(0, 3).map((b: any) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex flex-col items-center justify-center text-[#E31B23] border border-red-100">
                              <span className="text-[10px] font-bold uppercase">
                                {new Date(b.date).toLocaleString("default", {
                                  month: "short",
                                })}
                              </span>
                              <span className="text-lg font-black leading-none">
                                {new Date(b.date).getDate()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">
                                {b.user}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                {b.type} • {b.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {b.status === "pending" ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateBooking(b.id, "confirmed")
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-green-50 text-[#00C896] text-[10px] font-black uppercase hover:bg-[#00C896] hover:text-white transition-colors"
                                >
                                  {t("dashboard.bookings.confirm")}
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateBooking(b.id, "rejected")
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-red-50 text-[#E31B23] text-[10px] font-black uppercase hover:bg-[#E31B23] hover:text-white transition-colors"
                                >
                                  {t("dashboard.bookings.reject")}
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                                >
                                  {b.status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 font-medium italic">
                        {t("dashboard.bookings.noUpcoming")}
                      </p>
                    )}
                  </div>
                </div>

                {/* --- PAST / HISTORY --- */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    {t("dashboard.bookings.history")}
                  </h4>
                  <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    {pastBookings.length > 0 ? (
                      pastBookings.slice(0, 3).map((b: any) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[10px] font-bold">
                              {new Date(b.date).getDate()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-700 text-xs">
                                {b.user}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {b.type}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase ${b.status === "completed" ? "text-green-600" : "text-slate-400"}`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 font-medium italic">
                        {t("dashboard.bookings.noHistory")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#E31B23] rounded-full blur-[90px] opacity-20" />
                <h3 className="font-black text-lg mb-6 relative z-10">
                  {t("dashboard.quickActions.title")}
                </h3>
                <div className="space-y-3 relative z-10">
                  <button
                    onClick={() => setActiveTab("blog")}
                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-[#E31B23] text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/10"
                  >
                    <Plus size={16} /> {t("dashboard.quickActions.writeBlog")}
                  </button>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-[#00C896] text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/10"
                  >
                    <Users size={16} />{" "}
                    {t("dashboard.quickActions.verifyUsers")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SHOPPING MANAGEMENT ─── */}
        {activeTab === "shopping" && <ShoppingManager />}

        {activeTab === "bookings" && (
          <BookingsManager
            upcomingBookings={upcomingBookings}
            pastBookings={pastBookings}
            onUpdate={handleUpdateBooking}
          />
        )}

        {activeTab === "orders" && (
          <OrdersManager orders={orders} onRefresh={refreshData} />
        )}

        {activeTab === "clubs" && (
          <ClubsManager clubs={clubs} onRefresh={refreshData} />
        )}

        {/* ─── APPLICATIONS MANAGEMENT ─── */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-900">
                {t("applications.title")}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-4">
                      {t("applications.table.applicant")}
                    </th>
                    <th className="px-8 py-4">
                      {t("applications.table.program")}
                    </th>
                    <th className="px-8 py-4">
                      {t("applications.table.status")}
                    </th>
                    <th className="px-8 py-4 text-right">
                      {t("applications.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applications.map((app: any) => (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900">
                            {app.firstName} {app.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {app.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm">{app.programId}</td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${app.status === "approved" ? "bg-green-50 text-[#00C896]" : app.status === "rejected" ? "bg-red-50 text-[#E31B23]" : "bg-amber-50 text-amber-500"}`}
                        >
                          {t("status." + app.status.toLowerCase())}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateApplication(app._id, "approved")
                                }
                                className="p-2 bg-green-50 text-[#00C896] hover:bg-[#00C896] hover:text-white rounded-xl transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateApplication(app._id, "rejected")
                                }
                                className="p-2 bg-red-50 text-[#E31B23] hover:bg-[#E31B23] hover:text-white rounded-xl transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── USERS MANAGEMENT ─── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder={t("users.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-[#FAFAFA] rounded-xl text-sm font-bold w-64 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-4">{t("users.table.user")}</th>
                    <th className="px-8 py-4">{t("users.table.role")}</th>
                    <th className="px-8 py-4">
                      {t("applications.table.status")}
                    </th>
                    <th className="px-8 py-4">{t("users.table.journey")}</th>
                    <th className="px-8 py-4 text-right">
                      {t("applications.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((u: any) => (
                    <React.Fragment key={u.id}>
                      <tr
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedUser === u.id ? "bg-slate-50" : ""}`}
                        onClick={() =>
                          setExpandedUser(expandedUser === u.id ? null : u.id)
                        }
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shadow-sm overflow-hidden">
                              {u.photo ? (
                                <Image
                                  src={u.photo}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : u.name && u.name.length > 0 ? (
                                u.name.charAt(0)
                              ) : (
                                "U"
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-slate-900">
                                  {u.name}
                                </p>
                                {u.role === "Student" && (
                                  <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md font-black uppercase">
                                    {t("users.activeStudent")}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-medium">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === "Admin" ? "bg-slate-800 text-white" : u.role === "Student" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${u.status === "Active" ? "text-[#00C896]" : u.status === "Suspended" ? "text-red-500" : "text-amber-500"}`}
                          >
                            {t("status." + u.status.toLowerCase())}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {u.role === "Student" ? (
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-1.5 font-bold">
                                <Globe size={14} className="text-[#00C896]" />{" "}
                                {u.country}
                              </div>
                              <div className="w-px h-3 bg-slate-200" />
                              <div className="flex items-center gap-1.5 font-bold">
                                <Clock size={14} className="text-[#E31B23]" />{" "}
                                {u.step}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs italic">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div
                            className="flex justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setIsMasterEditingUser(u)}
                              className="p-2 bg-slate-900 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                              <Settings size={16} />
                            </button>
                            <button
                              onClick={() => handleEditUser(u)}
                              className="p-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-slate-300 hover:text-[#E31B23] transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* --- EXPANDED STUDENT INFO --- */}
                      {expandedUser === u.id && u.role === "Student" && (
                        <tr>
                          <td colSpan={5} className="px-8 py-0">
                            <m.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-10 pt-4 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-50">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase text-[#E31B23] tracking-widest flex items-center gap-2">
                                    <User size={12} />{" "}
                                    {t("users.expanded.personal")}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 bg-[#FAFAFA] p-4 rounded-2xl border border-slate-100">
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.sex")}
                                      </p>
                                      <p className="text-xs font-bold text-slate-900">
                                        {u.profile?.sex ||
                                          u.phone ||
                                          t("users.missing")}{" "}
                                        /{" "}
                                        {u.profile?.mobile ||
                                          t("users.missing")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.nationality")}
                                      </p>
                                      <p className="text-xs font-bold text-slate-900">
                                        {u.profile?.nationality ||
                                          t("users.missing")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.birth")}
                                      </p>
                                      <p className="text-xs font-bold text-slate-900">
                                        {u.profile?.dob
                                          ? new Date(
                                            u.profile.dob,
                                          ).toLocaleDateString()
                                          : t("users.missing")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.religion")}
                                      </p>
                                      <p className="text-xs font-bold text-slate-900">
                                        {u.profile?.religion ||
                                          t("users.missing")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase text-[#E31B23] tracking-widest flex items-center gap-2">
                                    <MapPin size={14} />{" "}
                                    {t("users.expanded.contact")}
                                  </h4>
                                  <div className="grid grid-cols-1 gap-3 bg-[#FAFAFA] p-4 rounded-2xl border border-slate-100">
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.phone")}
                                      </p>
                                      <p className="text-xs font-bold text-slate-900">
                                        {u.profile?.phone ||
                                          u.phone ||
                                          t("users.missing")}{" "}
                                        /{" "}
                                        {u.profile?.mobile ||
                                          t("users.missing")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.address")}
                                      </p>
                                      <p
                                        className={`text-xs font-bold ${u.profile?.address?.city ? "text-slate-900" : "text-slate-300 italic"}`}
                                      >
                                        {u.profile?.address?.city
                                          ? `${u.profile.address.street || ""}, ${u.profile.address.city}, ${u.profile.address.country}`
                                          : t("users.incomplete")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase text-[#E31B23] tracking-widest flex items-center gap-2">
                                    <GraduationCap size={12} />{" "}
                                    {t("users.expanded.education")}
                                  </h4>
                                  <div className="grid grid-cols-1 gap-3 bg-[#FAFAFA] p-4 rounded-2xl border border-slate-100">
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.level")}
                                      </p>
                                      <p
                                        className={`text-xs font-bold ${u.profile?.educationLevel ? "text-slate-900" : "text-slate-300 italic"}`}
                                      >
                                        {u.profile?.educationLevel ||
                                          t("users.missing")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">
                                        {t("users.expanded.languages")}
                                      </p>
                                      <p
                                        className={`text-xs font-bold ${u.profile?.languages ? "text-slate-900" : "text-slate-300 italic"}`}
                                      >
                                        {u.profile?.languages ||
                                          t("users.missing")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-3 bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E31B23] rounded-full blur-[60px] opacity-20" />
                                  <h4 className="text-[10px] font-black uppercase text-[#E31B23] tracking-widest mb-3">
                                    {t("users.expanded.motivation")}
                                  </h4>
                                  <p
                                    className={`text-xs font-medium leading-relaxed ${u.profile?.motivation ? "text-slate-200" : "text-slate-500 italic"}`}
                                  >
                                    {u.profile?.motivation
                                      ? `"${u.profile.motivation}"`
                                      : t("users.expanded.noMotivation")}
                                  </p>
                                </div>
                              </div>
                            </m.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── EVENTS & JOBS MANAGEMENT ─── */}
        {activeTab === "events" && (
          <EventsManager
            events={events}
            opportunities={opportunities}
            onRefresh={refreshData}
          />
        )}

        {/* ─── LESSONS MANAGEMENT ─── */}
        {activeTab === "lessons" && (
          <LessonsManager lessons={lessons} onRefresh={refreshData} />
        )}

        {/* ─── CONTENT LIBRARY MANAGEMENT ─── */}
        {activeTab === "blog" && (
          <ContentManager blogs={blogs} onRefresh={refreshData} />
        )}

        {/* --- USER EDIT MODAL --- */}
        <AnimatePresence>
          {isEditingUser !== null && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl border border-slate-100"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black">
                    {t("modals.editMember")}
                  </h3>
                  <button
                    onClick={() => setIsEditingUser(null)}
                    className="p-2 hover:bg-slate-50 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                      {t("modals.userRole")}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {ROLES.map((role: any) => (
                        <button
                          key={role}
                          onClick={() => setUserForm({ ...userForm, role })}
                          className={`py-3 rounded-xl text-xs font-bold border-2 transition-all
                                ${userForm.role === role
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                              : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                            }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                      {t("modals.accountStatus")}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {STATUSES.map((status: any) => (
                        <button
                          key={status}
                          onClick={() => setUserForm({ ...userForm, status })}
                          className={`py-3 rounded-xl text-xs font-bold border-2 transition-all
                                ${userForm.status === status
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                              : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {userForm.role === "Student" && (
                    <div className="space-y-4 bg-[#FAFAFA] p-5 rounded-2xl border border-slate-100">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                          {t("modals.targetCountry")}
                        </label>
                        <div className="relative">
                          <select
                            value={userForm.country}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                country: e.target.value,
                              })
                            }
                            className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00C896] appearance-none"
                          >
                            {COUNTRIES.map((c: any) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={16}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                          {t("modals.progressStep")}
                        </label>
                        <div className="relative">
                          <select
                            value={userForm.step}
                            onChange={(e) =>
                              setUserForm({ ...userForm, step: e.target.value })
                            }
                            className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#E31B23] appearance-none"
                          >
                            {STEPS.map((s: any) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={16}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveUser}
                  className="w-full bg-[#E31B23] text-white font-black py-4 rounded-xl mt-8 shadow-xl shadow-red-100 hover:bg-red-700 transition-all uppercase text-xs tracking-[0.2em] hover:-translate-y-1"
                >
                  {t("modals.saveUpdate")}
                </button>
              </m.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- USER MASTER EDIT MODAL --- */}
        <AnimatePresence>
          {isMasterEditingUser !== null && (
            <UserMasterManagementModal
              user={isMasterEditingUser}
              onClose={() => setIsMasterEditingUser(null)}
              onSave={handleSaveMaster}
            />
          )}
        </AnimatePresence>

        {/* --- APPLICATION DETAIL MODAL --- */}
        <AnimatePresence>
          {selectedApp !== null && (
            <ApplicationDetailsModal
              app={selectedApp}
              onClose={() => setSelectedApp(null)}
              onMasterEdit={async (app) => {
                setSelectedApp(null);
                setLoading(true);
                try {
                  // We need to find the user in our local users list or fetch specifically
                  const userObj = users.find((u) => u.clerkId === app.userId);
                  if (userObj) {
                    setIsMasterEditingUser(userObj);
                  } else {
                    // Fetch full user if not in list
                    const res = await fetch(
                      `/api/admin/users?id=${app.userId}&includeDocuments=true`,
                    );
                    if (res.ok) setIsMasterEditingUser(await res.json());
                  }
                } catch (e) {
                  console.error(e);
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- NEW COMPONENT: EVENTS & JOBS MANAGER ---
function EventsManager({ events, opportunities, onRefresh }: any) {
  const t = useTranslations("admin");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"event" | "opportunity">("event");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    titleMn: "",
    titleEn: "",
    descMn: "",
    descEn: "",
    locationMn: "",
    locationEn: "",
    providerMn: "",
    providerEn: "",
    date: "",
    category: "workshop",
    type: "volunteer",
    link: "#",
    imageUrl: "",
  });

  const activeList = activeTab === "event" ? events : opportunities;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data },
      );
      const uploadedImage = await res.json();
      if (uploadedImage.secure_url)
        setFormData((prev) => ({
          ...prev,
          imageUrl: uploadedImage.secure_url,
        }));
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (item: any) => {
    if (activeTab === "event") {
      setFormData({
        id: item._id,
        titleMn: item.title?.mn || "",
        titleEn: item.title?.en || "",
        descMn: item.description?.mn || "",
        descEn: item.description?.en || "",
        locationMn: item.location?.mn || "",
        locationEn: item.location?.en || "",
        providerMn: "",
        providerEn: "",
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
        category: item.category || "workshop",
        type: "volunteer",
        link: "#",
        imageUrl: item.image || "",
      });
    } else {
      setFormData({
        id: item._id,
        titleMn: item.title?.mn || "",
        titleEn: item.title?.en || "",
        descMn: item.description?.mn || "",
        descEn: item.description?.en || "",
        locationMn: item.location?.mn || "",
        locationEn: item.location?.en || "",
        providerMn: item.provider?.mn || "",
        providerEn: item.provider?.en || "",
        date: item.deadline || "",
        category: "workshop",
        type: item.type || "volunteer",
        link: item.link || "#",
        imageUrl: item.image || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setLoading(true);
    try {
      const url =
        activeTab === "event"
          ? `/api/admin/events?id=${id}`
          : `/api/admin/opportunities?id=${id}`;
      await fetch(url, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id && !formData.imageUrl) {
      alert("Please upload a cover image first.");
      return;
    }
    if (
      !formData.titleEn ||
      !formData.titleMn ||
      !formData.descEn ||
      !formData.descMn
    ) {
      alert("Please fill in all titles and descriptions in both languages.");
      return;
    }
    setLoading(true);
    try {
      const url =
        activeTab === "event"
          ? "/api/admin/events"
          : "/api/admin/opportunities";
      const method = formData.id ? "PUT" : "POST";

      let body: any;
      if (activeTab === "event") {
        body = {
          id: formData.id,
          title: { en: formData.titleEn, mn: formData.titleMn },
          description: { en: formData.descEn, mn: formData.descMn },
          date: formData.date,
          location: { en: formData.locationEn, mn: formData.locationMn },
          image: formData.imageUrl,
          category: formData.category,
          timeString: "All Day",
          link: formData.link,
        };
      } else {
        body = {
          id: formData.id,
          type: formData.type,
          title: { en: formData.titleEn, mn: formData.titleMn },
          provider: { en: formData.providerEn, mn: formData.providerMn },
          location: { en: formData.locationEn, mn: formData.locationMn },
          description: { en: formData.descEn, mn: formData.descMn },
          deadline: formData.date,
          link: formData.link,
          image: formData.imageUrl,
        };
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (e) {
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <TabButton
            active={activeTab === "event"}
            onClick={() => setActiveTab("event")}
            icon={FaCalendarAlt}
            label={t("events.tabs.event")}
          />
          <TabButton
            active={activeTab === "opportunity"}
            onClick={() => setActiveTab("opportunity")}
            icon={FaHandsHelping}
            label={t("events.tabs.opportunity")}
          />
        </div>
        <button
          onClick={() => {
            setFormData({
              id: "",
              titleMn: "",
              titleEn: "",
              descMn: "",
              descEn: "",
              locationMn: "",
              locationEn: "",
              providerMn: "",
              providerEn: "",
              date: "",
              category: "workshop",
              type: "volunteer",
              link: "#",
              imageUrl: "",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#E31B23] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg"
        >
          <FaPlus />{" "}
          {t("events.postNew", {
            type:
              activeTab === "event"
                ? t("events.tabs.event")
                : t("events.tabs.opportunity"),
          })}
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold">
                  {formData.id
                    ? t("events.manage.edit")
                    : t("events.manage.create")}
                </h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="overflow-y-auto p-6 space-y-6">
                <div className="col-span-2">
                  <h4 className="text-sm font-bold text-red-600 uppercase mb-2">
                    {t("events.manage.cover")}
                  </h4>
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingImage ? (
                      <FaSpinner className="animate-spin text-3xl text-red-500" />
                    ) : formData.imageUrl ? (
                      <div className="relative h-48 w-full">
                        <Image
                          src={formData.imageUrl}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="py-4">
                        <FaCloudUploadAlt className="text-4xl text-slate-400 mx-auto" />
                        <p>{t("events.manage.upload")}</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t("events.manage.titleMn")}
                    value={formData.titleMn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, titleMn: v })
                    }
                  />
                  <Input
                    label={t("events.manage.titleEn")}
                    value={formData.titleEn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, titleEn: v })
                    }
                  />
                  {activeTab === "opportunity" && (
                    <>
                      <Input
                        label={t("events.manage.providerMn")}
                        value={formData.providerMn}
                        onChange={(v: any) =>
                          setFormData({ ...formData, providerMn: v })
                        }
                      />
                      <Input
                        label={t("events.manage.providerEn")}
                        value={formData.providerEn}
                        onChange={(v: any) =>
                          setFormData({ ...formData, providerEn: v })
                        }
                      />
                      <Input
                        label={t("events.manage.type")}
                        value={formData.type}
                        onChange={(v: any) =>
                          setFormData({ ...formData, type: v })
                        }
                      />
                      <Input
                        label={t("events.manage.externalLink")}
                        value={formData.link}
                        onChange={(v: any) =>
                          setFormData({ ...formData, link: v })
                        }
                      />
                    </>
                  )}
                  <Input
                    label={t("events.manage.locationMn")}
                    value={formData.locationMn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, locationMn: v })
                    }
                  />
                  <Input
                    label={t("events.manage.locationEn")}
                    value={formData.locationEn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, locationEn: v })
                    }
                  />
                  <Input
                    type="date"
                    label={
                      activeTab === "event"
                        ? t("events.manage.eventDate")
                        : t("events.manage.deadline")
                    }
                    value={formData.date}
                    onChange={(v: any) => setFormData({ ...formData, date: v })}
                  />
                  {activeTab === "event" && (
                    <>
                      <Input
                        label={t("events.manage.category")}
                        value={formData.category}
                        onChange={(v: any) =>
                          setFormData({ ...formData, category: v })
                        }
                      />
                      <Input
                        label={t("events.manage.regLink")}
                        value={formData.link}
                        onChange={(v: any) =>
                          setFormData({ ...formData, link: v })
                        }
                      />
                    </>
                  )}
                </div>
                <TextArea
                  label={t("events.manage.descMn")}
                  value={formData.descMn}
                  onChange={(v: any) => setFormData({ ...formData, descMn: v })}
                />
                <TextArea
                  label={t("events.manage.descEn")}
                  value={formData.descEn}
                  onChange={(v: any) => setFormData({ ...formData, descEn: v })}
                />
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || uploadingImage}
                  className="px-6 py-2 bg-[#E31B23] text-white rounded-lg"
                >
                  {loading
                    ? t("events.manage.saving")
                    : t("events.manage.save")}
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase">
            <tr>
              <th className="p-4">{t("events.table.image")}</th>
              <th className="p-4">{t("events.table.title")}</th>
              <th className="p-4">{t("events.table.date")}</th>
              <th className="p-4 text-right">{t("events.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activeList.map((item: any) => (
              <tr key={item._id} className="hover:bg-slate-50">
                <td className="p-4">
                  <Image
                    src={item.image}
                    alt={item.title?.en || "Event"}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="p-4 font-bold">{item.title?.en}</td>
                <td className="p-4">
                  {activeTab === "event"
                    ? item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "-"
                    : item.deadline}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-500"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- NEW COMPONENT: CONTENT MANAGER ---
function ContentManager({ blogs, onRefresh }: any) {
  const t = useTranslations("admin");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    titleMn: "",
    titleEn: "",
    descMn: "",
    descEn: "",
    summaryMn: "",
    summaryEn: "",
    author: "Admin",
    status: "published",
    imageUrl: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data },
      );
      const json = await res.json();
      if (json.secure_url)
        setFormData((prev) => ({ ...prev, imageUrl: json.secure_url }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      id: item._id,
      titleMn: item.title?.mn || "",
      titleEn: item.title?.en || "",
      descMn: item.content?.mn || "",
      descEn: item.content?.en || "",
      summaryMn: item.summary?.mn || "",
      summaryEn: item.summary?.en || "",
      author: item.author || "Admin",
      status: item.status || "published",
      imageUrl: item.image || "",
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.titleEn ||
      !formData.titleMn ||
      !formData.descEn ||
      !formData.descMn ||
      !formData.summaryEn ||
      !formData.summaryMn
    ) {
      alert(
        "Please fill in all titles, summaries, and content in both languages.",
      );
      return;
    }
    setLoading(true);
    try {
      const method = formData.id ? "PUT" : "POST";
      const body = {
        id: formData.id,
        title: { en: formData.titleEn, mn: formData.titleMn },
        content: { en: formData.descEn, mn: formData.descMn },
        summary: { en: formData.summaryEn, mn: formData.summaryMn },
        author: formData.author,
        status: formData.status,
        image: formData.imageUrl,
      };

      const res = await fetch("/api/admin/news", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setIsCreating(false);
        onRefresh();
      }
    } catch (e) {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">{t("blog.title")}</h2>
        <button
          onClick={() => {
            setFormData({
              id: "",
              titleMn: "",
              titleEn: "",
              descMn: "",
              descEn: "",
              summaryMn: "",
              summaryEn: "",
              author: "Admin",
              status: "published",
              imageUrl: "",
            });
            setIsCreating(true);
          }}
          className="flex items-center gap-2 bg-[#E31B23] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg"
        >
          <FaPlus /> {t("blog.add")}
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold">{t("blog.manage")}</h3>
                <button onClick={() => setIsCreating(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="overflow-y-auto p-6 space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-slate-50"
                >
                  {uploadingImage ? (
                    <FaSpinner className="animate-spin" />
                  ) : formData.imageUrl ? (
                    <div className="relative h-32 w-full">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <FaImage className="text-2xl mx-auto" />
                      <p>{t("blog.upload")}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t("events.manage.titleMn")}
                    value={formData.titleMn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, titleMn: v })
                    }
                  />
                  <Input
                    label={t("events.manage.titleEn")}
                    value={formData.titleEn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, titleEn: v })
                    }
                  />
                  <Input
                    label={t("blog.summaryMn")}
                    value={formData.summaryMn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, summaryMn: v })
                    }
                  />
                  <Input
                    label={t("blog.summaryEn")}
                    value={formData.summaryEn}
                    onChange={(v: any) =>
                      setFormData({ ...formData, summaryEn: v })
                    }
                  />
                </div>
                <TextArea
                  label={t("blog.contentMn")}
                  value={formData.descMn}
                  onChange={(v: any) => setFormData({ ...formData, descMn: v })}
                />
                <TextArea
                  label={t("blog.contentEn")}
                  value={formData.descEn}
                  onChange={(v: any) => setFormData({ ...formData, descEn: v })}
                />
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || uploadingImage}
                  className="px-6 py-2 bg-[#E31B23] text-white rounded-lg"
                >
                  {t("blog.save")}
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="p-4">{t("events.table.image")}</th>
              <th className="p-4">{t("events.table.title")}</th>
              <th className="p-4 text-right">{t("events.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {blogs.map((item: any) => (
              <tr key={item._id} className="hover:bg-slate-50">
                <td className="p-4">
                  <Image
                    src={item.image}
                    alt={item.title?.en || "Content"}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="p-4 font-bold">{item.title?.en}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-500"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingsManager({ upcomingBookings, pastBookings, onUpdate }: any) {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const list = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab === "upcoming" ? t("dashboard.bookings.upcoming") : t("dashboard.bookings.history")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">User</th>
              <th className="px-8 py-4">Service</th>
              <th className="px-8 py-4">Date & Time</th>
              <th className="px-8 py-4">Contact</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-400 italic">
                  No bookings found.
                </td>
              </tr>
            ) : (
              list.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-sm text-slate-900">{b.user}</p>
                    <p className="text-xs text-slate-400">{b.email}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-700">{b.type}</td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-sm">{new Date(b.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400">{b.time}</p>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-500">{b.phone}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      b.status === "confirmed" ? "bg-green-50 text-[#00C896]"
                      : b.status === "rejected" || b.status === "cancelled" ? "bg-red-50 text-[#E31B23]"
                      : b.status === "completed" ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-500"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={() => onUpdate(b.id, "confirmed")}
                            className="p-2 bg-green-50 text-[#00C896] hover:bg-[#00C896] hover:text-white rounded-xl transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => onUpdate(b.id, "rejected")}
                            className="p-2 bg-red-50 text-[#E31B23] hover:bg-[#E31B23] hover:text-white rounded-xl transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => onUpdate(b.id, "completed")}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersManager({ orders, onRefresh }: any) {
  const handleUpdateOrder = async (id: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status }),
    });
    onRefresh();
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    await fetch(`/api/admin/orders?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const statusColors: Record<string, string> = {
    paid: "bg-green-50 text-[#00C896]",
    pending: "bg-amber-50 text-amber-500",
    cancelled: "bg-red-50 text-[#E31B23]",
    failed: "bg-red-50 text-[#E31B23]",
    expired: "bg-slate-100 text-slate-400",
    processing: "bg-blue-50 text-blue-500",
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h2 className="text-xl font-black text-slate-900">Orders & Payments</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Item</th>
              <th className="px-8 py-4">Qty</th>
              <th className="px-8 py-4">Amount</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-400 italic">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o: any) => (
                <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-sm">{o.itemName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{o.qpayInvoiceId?.slice(0, 16)}…</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium">{o.quantity}</td>
                  <td className="px-8 py-5 font-bold text-sm">
                    {o.amount?.toLocaleString()} {o.currency}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${statusColors[o.status] || "bg-slate-100 text-slate-400"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {o.status === "pending" && (
                        <button
                          onClick={() => handleUpdateOrder(o._id, "paid")}
                          className="px-3 py-1.5 rounded-lg bg-green-50 text-[#00C896] text-[10px] font-black uppercase hover:bg-[#00C896] hover:text-white transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      {o.status !== "cancelled" && o.status !== "paid" && (
                        <button
                          onClick={() => handleUpdateOrder(o._id, "cancelled")}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-[#E31B23] text-[10px] font-black uppercase hover:bg-[#E31B23] hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(o._id)}
                        className="p-2 text-slate-300 hover:text-[#E31B23] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
