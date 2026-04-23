"use client";

import React, { useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image"; // Added Image import
import {
    FaPlus,
    FaTrash,
    FaEdit,
    FaSpinner,
    FaImage,
    FaTimes,
    FaLightbulb,
    FaGraduationCap,
    FaHandsHelping,
    FaTree,
    FaChild,
    FaHeartbeat,
    FaGlobe,
    FaBook,
    FaLanguage,
    FaUserGraduate
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// --- Types ---
interface Lesson {
    _id: string; // Mongoose ID
    category: string;
    icon: string;
    color: string;
    title: { mn: string; en: string };
    description: { mn: string; en: string };
    focus: { mn: string[]; en: string[] };
    imageUrl?: string;
    status: string;
    attendees?: any[];
}

interface LessonsManagerProps {
    lessons: Lesson[];
    onRefresh: () => void;
}

// --- Constants ---
const ICON_OPTIONS = [
    { value: "FaBook", icon: FaBook },
    { value: "FaLanguage", icon: FaLanguage },
    { value: "FaLightbulb", icon: FaLightbulb },
    { value: "FaGraduationCap", icon: FaGraduationCap },
    { value: "FaHandsHelping", icon: FaHandsHelping },
    { value: "FaTree", icon: FaTree },
    { value: "FaChild", icon: FaChild },
    { value: "FaGlobe", icon: FaGlobe },
];

const COLOR_OPTIONS = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
];

// --- Main Component ---
export default function LessonsManager({ lessons, onRefresh }: LessonsManagerProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isCreating, setIsCreating] = useState(false);
    const [viewingAttendees, setViewingAttendees] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: "", // For edit mode
        titleMn: "", titleEn: "",
        descMn: "", descEn: "",
        focusMn: "", focusEn: "", // Comma separated strings
        category: "language",
        status: "active",
        icon: "FaBook",
        color: "blue",
        imageUrl: ""
    });

    // --- HANDLERS ---

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return alert("Image too large (Max 5MB)");

        setUploadingImage(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
            const json = await res.json();
            if (json.secure_url) setFormData(prev => ({ ...prev, imageUrl: json.secure_url }));
        } catch (err) { alert("Image upload failed"); }
        finally { setUploadingImage(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this lesson? This action cannot be undone.")) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/lessons?id=${id}`, {
                method: "DELETE"
            });
            onRefresh();
            router.refresh();
        } catch (e) { alert("Delete failed"); }
        finally { setLoading(false); }
    };

    const handleEdit = (lesson: Lesson) => {
        setFormData({
            id: lesson._id,
            titleMn: lesson.title.mn,
            titleEn: lesson.title.en,
            descMn: lesson.description.mn,
            descEn: lesson.description.en,
            focusMn: lesson.focus.mn ? lesson.focus.mn.join(", ") : "",
            focusEn: lesson.focus.en ? lesson.focus.en.join(", ") : "",
            category: lesson.category,
            status: lesson.status,
            icon: lesson.icon || "FaBook",
            color: lesson.color || "blue",
            imageUrl: lesson.imageUrl || ""
        });
        setIsCreating(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Determine Method: POST (Create) or PUT (Update)
        const method = formData.id ? "PUT" : "POST";

        const payload = {
            id: formData.id,
            title: { mn: formData.titleMn, en: formData.titleEn },
            description: { mn: formData.descMn, en: formData.descEn },
            focus: {
                mn: formData.focusMn.split(",").map(s => s.trim()).filter(Boolean),
                en: formData.focusEn.split(",").map(s => s.trim()).filter(Boolean)
            },
            category: formData.category,
            status: formData.status,
            icon: formData.icon,
            color: formData.color,
            imageUrl: formData.imageUrl
        };

        try {
            await fetch("/api/admin/lessons", {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setIsCreating(false);
            resetForm();
            onRefresh();
            router.refresh();
        } catch (e) { alert("Operation failed"); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData({
            id: "", titleMn: "", titleEn: "", descMn: "", descEn: "",
            focusMn: "", focusEn: "", category: "language", status: "active",
            icon: "FaBook", color: "blue", imageUrl: ""
        });
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Au Pair Lessons</h2>
                    <p className="text-sm text-slate-500">Manage curriculum and preparation materials</p>
                </div>
                <button
                    type="button"
                    onClick={() => { resetForm(); setIsCreating(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <FaPlus /> Add Lesson
                </button>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <m.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-800 capitalize">
                                    {formData.id ? "Edit Lesson" : "Create New Lesson"}
                                </h3>
                                <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <form id="lessonForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* --- Visuals --- */}
                                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Image Upload */}
                                        <div onClick={() => fileInputRef.current?.click()} className={`col-span-1 border-2 border-dashed rounded-xl h-40 flex items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden ${uploadingImage && 'opacity-50'}`}>
                                            {uploadingImage ? <FaSpinner className="animate-spin text-2xl text-blue-500" /> :
                                                formData.imageUrl ? (
                                                    <Image
                                                        src={formData.imageUrl}
                                                        alt="Lesson cover"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) :
                                                    <div className="text-center text-slate-400"><FaImage className="text-2xl mx-auto mb-1" /><span className="text-xs">Cover Image</span></div>}
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </div>

                                        {/* Icon Picker */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2">Icon</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {ICON_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, icon: opt.value })}
                                                        className={`p-3 rounded-lg flex items-center justify-center border transition-all ${formData.icon === opt.value ? "bg-blue-50 border-blue-500 text-blue-600" : "border-slate-200 hover:bg-slate-50 text-slate-400"}`}
                                                    >
                                                        <opt.icon />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Picker */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2">Theme Color</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {COLOR_OPTIONS.map((col) => (
                                                    <button
                                                        key={col.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, color: col.value })}
                                                        className={`h-8 rounded-full border-2 transition-all ${col.class} ${formData.color === col.value ? "ring-2 ring-offset-2 ring-slate-400 scale-110 border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                                                        title={col.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Basic Info --- */}
                                    <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                                        <Select label="Category" value={formData.category} onChange={v => setFormData({ ...formData, category: v })} options={["language", "culture", "childcare", "visa", "other"]} />
                                        <Select label="Status" value={formData.status} onChange={v => setFormData({ ...formData, status: v })} options={["active", "upcoming", "archived"]} />

                                        <Input label="Title (MN)" value={formData.titleMn} onChange={v => setFormData({ ...formData, titleMn: v })} />
                                        <Input label="Title (EN)" value={formData.titleEn} onChange={v => setFormData({ ...formData, titleEn: v })} />
                                    </div>

                                    {/* --- Descriptions --- */}
                                    <div className="col-span-2 space-y-4">
                                        <TextArea label="Short Description (MN)" value={formData.descMn} onChange={v => setFormData({ ...formData, descMn: v })} />
                                        <TextArea label="Short Description (EN)" value={formData.descEn} onChange={v => setFormData({ ...formData, descEn: v })} />
                                    </div>

                                    {/* --- Focus Areas --- */}
                                    <div className="col-span-2 space-y-4 border-t border-slate-100 pt-6">
                                        <h4 className="text-sm font-bold text-slate-800">Focus Areas <span className="text-slate-400 font-normal">(Comma separated)</span></h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Key Topics (MN)" placeholder="Vocab, Grammar..." value={formData.focusMn} onChange={v => setFormData({ ...formData, focusMn: v })} />
                                            <Input label="Key Topics (EN)" placeholder="Vocab, Grammar..." value={formData.focusEn} onChange={v => setFormData({ ...formData, focusEn: v })} />
                                        </div>
                                    </div>

                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button form="lessonForm" type="submit" disabled={loading || uploadingImage} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? "Saving..." : formData.id ? "Update Lesson" : "Create Lesson"}
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>



            {/* --- ATTENDEES MODAL --- */}
            <AnimatePresence>
                {viewingAttendees && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <m.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Class Roster</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase">{viewingAttendees.title.en}</p>
                                </div>
                                <button onClick={() => setViewingAttendees(null)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
                            </div>

                            <div className="overflow-y-auto p-0">
                                {(!viewingAttendees.attendees || viewingAttendees.attendees.length === 0) ? (
                                    <div className="p-10 text-center text-slate-400">
                                        <FaUserGraduate className="text-4xl mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No students registered yet.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-bold sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3">Student</th>
                                                <th className="px-6 py-3">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {viewingAttendees.attendees.map((student: any) => (
                                                <tr key={student._id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-800 text-sm">{student.fullName || "Unknown"}</p>
                                                        <p className="text-xs text-slate-400">{student.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">{student.role || 'Guest'}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                                <button onClick={() => setViewingAttendees(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Close</button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- Data List --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => {
                    // Find icon component dynamically for preview
                    const IconComp = ICON_OPTIONS.find(o => o.value === lesson.icon)?.icon || FaBook;
                    // Find color class
                    const colorClass = COLOR_OPTIONS.find(c => c.value === lesson.color)?.class || "bg-blue-500";

                    return (
                        <div key={lesson._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className={`h-2 ${colorClass}`} />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg bg-slate-50 text-slate-600`}>
                                        <IconComp className="text-xl" />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${lesson.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {lesson.status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-slate-800 mb-1">{lesson.title?.en || lesson.title?.mn}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{lesson.description?.en || lesson.description?.mn}</p>

                                <div className="flex flex-wrap gap-1 mb-6">
                                    {lesson.focus?.en?.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">{tag}</span>
                                    ))}
                                </div>

                                <div className="flex gap-2 border-t border-slate-100 pt-4 mt-auto">
                                    <button onClick={() => setViewingAttendees(lesson)} className="px-3 py-2 text-slate-500 hover:bg-slate-50 rounded border border-slate-200 hover:border-slate-300 transition-colors" title="View Students">
                                        <FaUserGraduate /> <span className="text-xs font-bold ml-1">{lesson.attendees?.length || 0}</span>
                                    </button>
                                    <button onClick={() => handleEdit(lesson)} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded flex items-center justify-center gap-2">
                                        <FaEdit /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(lesson._id)} className="flex-1 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded flex items-center justify-center gap-2">
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {lessons.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        <FaBook className="text-4xl mx-auto mb-4 opacity-20" />
                        <p>No lessons found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div >
    );
}

// --- Helpers ---
const Input = ({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            required
            placeholder={placeholder}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
    </div>
);

const TextArea = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            required
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
    </div>
);

const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white capitalize"
        >
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);
