"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Save,
  Search,
  Sparkles,
  Check,
  Loader,
  Home,
  Info,
  Calendar,
  Phone,
  HelpCircle,
  HelpCircle as QuestionIcon,
  ChevronRight,
  ListOrdered
} from "lucide-react";

// --- HELPERS FOR NESTED OBJECT ACCESS ---
const getNestedValue = (obj: any, path: string): string => {
  if (!obj) return "";
  return path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";
};

const setNestedValue = (obj: any, path: string, value: any): any => {
  const parts = path.split(".");
  const newObj = { ...obj };
  let current = newObj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    } else {
      current[parts[i]] = { ...current[parts[i]] };
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return newObj;
};

// Traverse object and return all leaves as path-value pairs
const getAllPaths = (obj: any, currentPath = ""): { path: string; val: string }[] => {
  let paths: { path: string; val: string }[] = [];
  if (typeof obj !== "object" || obj === null) {
    return [{ path: currentPath, val: String(obj) }];
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        paths = paths.concat(getAllPaths(obj[key], newPath));
      } else {
        paths.push({ path: newPath, val: String(obj[key]) });
      }
    }
  }
  return paths;
};

export default function WebsiteInfoManager() {
  const [translations, setTranslations] = useState<{ mn: any; en: any; de: any }>({
    mn: {},
    en: {},
    de: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [activeCountry, setActiveCountry] = useState("germany");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ path: string; mn: string; en: string; de: string }[]>([]);

  // Fetch translations on mount
  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/translations");
      if (res.ok) {
        const data = await res.json();
        setTranslations({
          mn: data.mn || {},
          en: data.en || {},
          de: data.de || {},
        });
      }
    } catch (error) {
      console.error("Failed to load translations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleFieldChange = (path: string, lang: "mn" | "en" | "de", value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: setNestedValue(prev[lang], path, value),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translations),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save website information.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const term = searchQuery.toLowerCase();
    const mnPaths = getAllPaths(translations.mn);
    const results: { path: string; mn: string; en: string; de: string }[] = [];

    // Search keys and values across translation leaves
    mnPaths.forEach(({ path }) => {
      const mnVal = getNestedValue(translations.mn, path);
      const enVal = getNestedValue(translations.en, path);
      const deVal = getNestedValue(translations.de, path);

      if (
        path.toLowerCase().includes(term) ||
        mnVal.toLowerCase().includes(term) ||
        enVal.toLowerCase().includes(term) ||
        deVal.toLowerCase().includes(term)
      ) {
        results.push({ path, mn: mnVal, en: enVal, de: deVal });
      }
    });

    setSearchResults(results.slice(0, 30)); // limit results to 30 for performance
  }, [searchQuery, translations]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-[#E31B23] mb-4" size={40} />
        <p className="text-slate-500 font-bold text-sm">Ачаалж байна...</p>
      </div>
    );
  }

  // Section config structure
  const formSections: Record<string, { label: string; fields: { path: string; label: string; type?: "textarea" | "input" }[] }[]> = {
    home: [
      {
        label: "Home Slider - Slide 1 (Герман)",
        fields: [
          { path: "HeroSlider.slide1_title", label: "Title (Slide 1)", type: "input" },
          { path: "HeroSlider.slide1_desc", label: "Description (Slide 1)", type: "textarea" },
          { path: "HeroSlider.slide1_location", label: "Location Tag (Slide 1)", type: "input" },
        ],
      },
      {
        label: "Home Slider - Slide 2 (Австри)",
        fields: [
          { path: "HeroSlider.slide2_title", label: "Title (Slide 2)", type: "input" },
          { path: "HeroSlider.slide2_desc", label: "Description (Slide 2)", type: "textarea" },
          { path: "HeroSlider.slide2_location", label: "Location Tag (Slide 2)", type: "input" },
        ],
      },
      {
        label: "Home Slider - Slide 3 (Франц)",
        fields: [
          { path: "HeroSlider.slide3_title", label: "Title (Slide 3)", type: "input" },
          { path: "HeroSlider.slide3_desc", label: "Description (Slide 3)", type: "textarea" },
          { path: "HeroSlider.slide3_location", label: "Location Tag (Slide 3)", type: "input" },
        ],
      },
      {
        label: "General Text / Controls",
        fields: [
          { path: "HeroSlider.learnMore", label: "Learn More Button Text", type: "input" },
          { path: "HeroSlider.verified", label: "Verified Program Badge", type: "input" },
        ],
      },
    ],
    about: [
      {
        label: "About Us Header & Description",
        fields: [
          { path: "UsSection.badge", label: "Story Section Badge", type: "input" },
          { path: "UsSection.heading_pre", label: "Heading Prefix", type: "input" },
          { path: "UsSection.heading_seq1", label: "Heading Keyword 1", type: "input" },
          { path: "UsSection.heading_seq2", label: "Heading Keyword 2", type: "input" },
          { path: "UsSection.heading_seq3", label: "Heading Keyword 3", type: "input" },
          { path: "UsSection.heading_post", label: "Heading Suffix", type: "input" },
          { path: "UsSection.desc1", label: "Paragraph 1 Description", type: "textarea" },
          { path: "UsSection.desc2", label: "Paragraph 2 Description", type: "textarea" },
          { path: "UsSection.quote", label: "Inspirational Quote", type: "input" },
          { path: "UsSection.cta", label: "Call To Action Text", type: "input" },
        ],
      },
      {
        label: "Statistics Counters",
        fields: [
          { path: "UsSection.stat_exp", label: "Stat label: Experience", type: "input" },
          { path: "UsSection.stat_participants", label: "Stat label: Participants", type: "input" },
          { path: "UsSection.stat_global", label: "Stat label: Global Network", type: "input" },
          { path: "UsSection.stat_reliable", label: "Stat label: Reliability", type: "input" },
          { path: "UsSection.years", label: "Stat suffix: Years", type: "input" },
          { path: "UsSection.founder", label: "Founder Subtitle Label", type: "input" },
          { path: "UsSection.certified", label: "Certified Stamp Label", type: "input" },
        ],
      },
    ],
    steps: [
      {
        label: "Expectations Section Header",
        fields: [
          { path: "Expectations.badge", label: "Section Badge", type: "input" },
          { path: "Expectations.title", label: "Section Title", type: "input" },
          { path: "Expectations.subtitle", label: "Section Subtitle Description", type: "textarea" },
          { path: "Expectations.start", label: "Start Button Text", type: "input" },
        ],
      },
      {
        label: "Step 1: Course & Training",
        fields: [
          { path: "Expectations.step1_title", label: "Step 1 Title", type: "input" },
          { path: "Expectations.step1_desc", label: "Step 1 Description Details", type: "textarea" },
          { path: "Expectations.step1_duration", label: "Step 1 Duration / Tag", type: "input" },
        ],
      },
      {
        label: "Step 2: Language Exam",
        fields: [
          { path: "Expectations.step2_title", label: "Step 2 Title", type: "input" },
          { path: "Expectations.step2_desc", label: "Step 2 Description Details", type: "textarea" },
          { path: "Expectations.step2_duration", label: "Step 2 Duration / Tag", type: "input" },
        ],
      },
      {
        label: "Step 3: Host Family Matching",
        fields: [
          { path: "Expectations.step3_title", label: "Step 3 Title", type: "input" },
          { path: "Expectations.step3_desc", label: "Step 3 Description Details", type: "textarea" },
          { path: "Expectations.step3_duration", label: "Step 3 Duration / Tag", type: "input" },
        ],
      },
      {
        label: "Step 4: Visa Process & Prep",
        fields: [
          { path: "Expectations.step4_title", label: "Step 4 Title", type: "input" },
          { path: "Expectations.step4_desc", label: "Step 4 Description Details", type: "textarea" },
          { path: "Expectations.step4_duration", label: "Step 4 Duration / Tag", type: "input" },
        ],
      },
    ],
    whychooseus: [
      {
        label: "Why Choose Us Main Headers",
        fields: [
          { path: "WhyChooseUs.badge", label: "Section Badge", type: "input" },
          { path: "WhyChooseUs.title_pre", label: "Title Prefix", type: "input" },
          { path: "WhyChooseUs.title_highlight", label: "Highlighted Title", type: "input" },
          { path: "WhyChooseUs.desc", label: "Summary Description", type: "textarea" },
        ],
      },
      {
        label: "Card 1: Global Network",
        fields: [
          { path: "WhyChooseUs.card1_title", label: "Card 1 Title", type: "input" },
          { path: "WhyChooseUs.card1_desc", label: "Card 1 Description", type: "textarea" },
        ],
      },
      {
        label: "Card 2: Real Support",
        fields: [
          { path: "WhyChooseUs.card2_title", label: "Card 2 Title", type: "input" },
          { path: "WhyChooseUs.card2_desc", label: "Card 2 Description", type: "textarea" },
          { path: "WhyChooseUs.card2_btn", label: "Chat Button Text", type: "input" },
        ],
      },
      {
        label: "Card 3: Transparent Pricing",
        fields: [
          { path: "WhyChooseUs.card3_title", label: "Card 3 Title", type: "input" },
          { path: "WhyChooseUs.card3_desc", label: "Card 3 Description", type: "textarea" },
        ],
      },
      {
        label: "Card 4: Security Standard",
        fields: [
          { path: "WhyChooseUs.card4_title", label: "Card 4 Title", type: "input" },
          { path: "WhyChooseUs.card4_desc", label: "Card 4 Description", type: "textarea" },
        ],
      },
      {
        label: "Card 5: Free Application",
        fields: [
          { path: "WhyChooseUs.card5_title", label: "Card 5 Title", type: "input" },
          { path: "WhyChooseUs.card5_desc", label: "Card 5 Description", type: "textarea" },
        ],
      },
    ],
    contact: [
      {
        label: "Contact Information Details",
        fields: [
          { path: "ContactPage.badge", label: "Page Header Badge", type: "input" },
          { path: "ContactPage.heroTitle", label: "Hero Title Prefix", type: "input" },
          { path: "ContactPage.heroTitleHighlight", label: "Hero Title Highlight", type: "input" },
          { path: "ContactPage.heroDesc", label: "Hero Description Subtext", type: "textarea" },
          { path: "ContactPage.info.phone.label", label: "Phone Number Label", type: "input" },
          { path: "ContactPage.info.phone.value", label: "Phone Number Value", type: "input" },
          { path: "ContactPage.info.email.label", label: "Email Address Label", type: "input" },
          { path: "ContactPage.info.email.value", label: "Email Address Value", type: "input" },
          { path: "ContactPage.info.address.label", label: "Office Address Label", type: "input" },
          { path: "ContactPage.info.address.value", label: "Office Address Value", type: "textarea" },
        ],
      },
      {
        label: "Contact Inquiry Form Texts",
        fields: [
          { path: "ContactPage.formTitle", label: "Inquiry Form Title", type: "input" },
          { path: "ContactPage.formDesc", label: "Inquiry Form Description", type: "textarea" },
          { path: "ContactPage.labels.name", label: "Full Name Label", type: "input" },
          { path: "ContactPage.labels.email", label: "Email Label", type: "input" },
          { path: "ContactPage.labels.message", label: "Message Area Label", type: "input" },
          { path: "ContactPage.buttons.send", label: "Send Button Text", type: "input" },
          { path: "ContactPage.successTitle", label: "Success Sent Title", type: "input" },
          { path: "ContactPage.successDesc", label: "Success Sent Message", type: "textarea" },
        ],
      },
    ],
    countries: [], // Handled dynamically below
  };

  const countriesConfig: Record<string, { label: string; namespace: string; fields: { path: string; label: string; type?: "textarea" | "input" }[] }> = {
    germany: {
      label: "Germany (Герман)",
      namespace: "GermanyPage",
      fields: [
        { path: "GermanyPage.hero.title", label: "Hero Main Title", type: "input" },
        { path: "GermanyPage.hero.highlight", label: "Hero Highlighted Keyword", type: "input" },
        { path: "GermanyPage.hero.sub", label: "Hero Introduction Subtext", type: "textarea" },
        { path: "GermanyPage.info.desc", label: "Detailed Info Description", type: "textarea" },
        { path: "GermanyPage.contract.items.hours.title", label: "Contract Working Hours Title", type: "input" },
        { path: "GermanyPage.contract.items.hours.desc", label: "Contract Working Hours Details", type: "textarea" },
        { path: "GermanyPage.contract.items.money.title", label: "Pocket Money / Salary Title", type: "input" },
        { path: "GermanyPage.contract.items.money.desc", label: "Pocket Money / Salary Details", type: "textarea" },
        { path: "GermanyPage.contract.items.course.title", label: "Language Course Support Title", type: "input" },
        { path: "GermanyPage.contract.items.course.desc", label: "Language Course Support Details", type: "textarea" },
      ],
    },
    austria: {
      label: "Austria (Австри)",
      namespace: "AustriaPage",
      fields: [
        { path: "AustriaPage.hero.title", label: "Hero Main Title", type: "input" },
        { path: "AustriaPage.hero.highlight", label: "Hero Highlighted Keyword", type: "input" },
        { path: "AustriaPage.hero.sub", label: "Hero Introduction Subtext", type: "textarea" },
        { path: "AustriaPage.info.desc", label: "Detailed Info Description", type: "textarea" },
        { path: "AustriaPage.contract.items.hours.title", label: "Contract Working Hours Title", type: "input" },
        { path: "AustriaPage.contract.items.hours.desc", label: "Contract Working Hours Details", type: "textarea" },
        { path: "AustriaPage.contract.items.money.title", label: "Pocket Money / Salary Title", type: "input" },
        { path: "AustriaPage.contract.items.money.desc", label: "Pocket Money / Salary Details", type: "textarea" },
        { path: "AustriaPage.contract.items.course.title", label: "Language Course Support Title", type: "input" },
        { path: "AustriaPage.contract.items.course.desc", label: "Language Course Support Details", type: "textarea" },
      ],
    },
    switzerland: {
      label: "Switzerland (Швейцарь)",
      namespace: "SwitzerlandPage",
      fields: [
        { path: "SwitzerlandPage.hero.title", label: "Hero Main Title", type: "input" },
        { path: "SwitzerlandPage.hero.highlight", label: "Hero Highlighted Keyword", type: "input" },
        { path: "SwitzerlandPage.hero.sub", label: "Hero Introduction Subtext", type: "textarea" },
        { path: "SwitzerlandPage.info.desc", label: "Detailed Info Description", type: "textarea" },
        { path: "SwitzerlandPage.contract.items.hours.title", label: "Contract Working Hours Title", type: "input" },
        { path: "SwitzerlandPage.contract.items.hours.desc", label: "Contract Working Hours Details", type: "textarea" },
        { path: "SwitzerlandPage.contract.items.money.title", label: "Pocket Money / Salary Title", type: "input" },
        { path: "SwitzerlandPage.contract.items.money.desc", label: "Pocket Money / Salary Details", type: "textarea" },
        { path: "SwitzerlandPage.contract.items.course.title", label: "Language Course Support Title", type: "input" },
        { path: "SwitzerlandPage.contract.items.course.desc", label: "Language Course Support Details", type: "textarea" },
      ],
    },
    belgium: {
      label: "Belgium (Бельги)",
      namespace: "BelgiumPage",
      fields: [
        { path: "BelgiumPage.hero.title", label: "Hero Main Title", type: "input" },
        { path: "BelgiumPage.hero.highlight", label: "Hero Highlighted Keyword", type: "input" },
        { path: "BelgiumPage.hero.sub", label: "Hero Introduction Subtext", type: "textarea" },
        { path: "BelgiumPage.info.desc", label: "Detailed Info Description", type: "textarea" },
      ],
    },
    france: {
      label: "France (Франц)",
      namespace: "FrancePage",
      fields: [
        { path: "FrancePage.hero.title", label: "Hero Main Title", type: "input" },
        { path: "FrancePage.hero.highlight", label: "Hero Highlighted Keyword", type: "input" },
        { path: "FrancePage.hero.sub", label: "Hero Introduction Subtext", type: "textarea" },
        { path: "FrancePage.info.desc", label: "Detailed Info Description", type: "textarea" },
        { path: "FrancePage.contract.items.hours.title", label: "Contract Working Hours Title", type: "input" },
        { path: "FrancePage.contract.items.hours.desc", label: "Contract Working Hours Details", type: "textarea" },
        { path: "FrancePage.contract.items.money.title", label: "Pocket Money / Salary Title", type: "input" },
        { path: "FrancePage.contract.items.money.desc", label: "Pocket Money / Salary Details", type: "textarea" },
        { path: "FrancePage.contract.items.course.title", label: "Language Course Support Title", type: "input" },
        { path: "FrancePage.contract.items.course.desc", label: "Language Course Support Details", type: "textarea" },
      ],
    },
  };

  const renderFieldRow = (field: { path: string; label: string; type?: "textarea" | "input" }) => {
    const mnVal = getNestedValue(translations.mn, field.path);
    const enVal = getNestedValue(translations.en, field.path);
    const deVal = getNestedValue(translations.de, field.path);

    return (
      <div key={field.path} className="border-b border-slate-100 py-6 last:border-b-0 space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase text-slate-800 tracking-wider">
            {field.label}
          </label>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
            {field.path}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mongolian input */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">
              Монгол (MN)
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={mnVal}
                rows={3}
                onChange={(e) => handleFieldChange(field.path, "mn", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all resize-none"
              />
            ) : (
              <input
                type="text"
                value={mnVal}
                onChange={(e) => handleFieldChange(field.path, "mn", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
              />
            )}
          </div>

          {/* English input */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">
              English (EN)
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={enVal}
                rows={3}
                onChange={(e) => handleFieldChange(field.path, "en", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all resize-none"
              />
            ) : (
              <input
                type="text"
                value={enVal}
                onChange={(e) => handleFieldChange(field.path, "en", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
              />
            )}
          </div>

          {/* German input */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">
              Deutsch (DE)
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={deVal}
                rows={3}
                onChange={(e) => handleFieldChange(field.path, "de", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all resize-none"
              />
            ) : (
              <input
                type="text"
                value={deVal}
                onChange={(e) => handleFieldChange(field.path, "de", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Save Floating Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/80 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="text-[#E31B23]" size={20} /> Вэбсайт Мэдээлэл Засагч
          </h2>
          <p className="text-slate-400 text-xs font-semibold">
            Вэбсайтын хуудаснууд дээрх бүх текстийг нарийвчлан шууд засварлах хэсэг.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#E31B23] transition-all disabled:opacity-50 w-full sm:w-auto hover:-translate-y-1 active:scale-95"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={14} /> Хадгалж байна...
              </>
            ) : saveSuccess ? (
              <>
                <Check size={14} className="text-[#00C896]" /> Амжилттай хадгалагдлаа
              </>
            ) : (
              <>
                <Save size={14} /> Өөрчлөлтийг Хадгалах
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-2xl overflow-x-auto gap-1 scrollbar-none border border-slate-200">
        {[
          { id: "home", label: "Нүүр хуудас", icon: Home },
          { id: "about", label: "Бидний тухай", icon: Info },
          { id: "steps", label: "Алхмууд", icon: ListOrdered },
          { id: "whychooseus", label: "Яагаад бид?", icon: Sparkles },
          { id: "contact", label: "Холбоо барих", icon: Phone },
          { id: "countries", label: "Улсуудын Мэдээлэл", icon: Globe },
          { id: "search", label: "Хайх & Засах", icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-400 hover:text-slate-700 hover:bg-white/30"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
        <AnimatePresence mode="wait">
          {/* standard tabs */}
          {activeTab !== "countries" && activeTab !== "search" && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {formSections[activeTab]?.map((section, idx) => (
                <div key={idx} className="space-y-6 bg-[#FAFAFA] p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-sm font-black uppercase text-[#E31B23] tracking-widest border-b border-slate-200/60 pb-3">
                    {section.label}
                  </h3>
                  <div className="divide-y divide-slate-100/50">
                    {section.fields.map(renderFieldRow)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Countries Subtab */}
          {activeTab === "countries" && (
            <motion.div
              key="countries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                {Object.entries(countriesConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCountry(key)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                      activeCountry === key
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              <div className="space-y-6 bg-[#FAFAFA] p-6 rounded-3xl border border-slate-100">
                <h3 className="text-sm font-black uppercase text-[#E31B23] tracking-widest border-b border-slate-200 pb-3">
                  {countriesConfig[activeCountry]?.label} хуудасны мэдээлэл
                </h3>
                <div className="divide-y divide-slate-100/50">
                  {countriesConfig[activeCountry]?.fields.map(renderFieldRow)}
                </div>
              </div>
            </motion.div>
          )}

          {/* Global search tab */}
          {activeTab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Вэбсайтын дурын үг, хэллэг, орчуулгын түлхүүр үгээр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>

              {searchQuery && (
                <div className="bg-[#FAFAFA] p-6 rounded-3xl border border-slate-100 space-y-6">
                  <h3 className="text-sm font-black uppercase text-[#E31B23] tracking-widest border-b border-slate-200/60 pb-3">
                    Илэрцүүд ({searchResults.length})
                  </h3>
                  <div className="divide-y divide-slate-200">
                    {searchResults.length === 0 ? (
                      <p className="text-slate-400 text-sm italic py-4">Тохирох үр дүн олдсонгүй.</p>
                    ) : (
                      searchResults.map((res) => (
                        <div key={res.path} className="py-6 last:pb-0 first:pt-0 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-[#E31B23] font-mono bg-red-50 px-2 py-0.5 rounded">
                              {res.path}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">
                                Монгол (MN)
                              </span>
                              <textarea
                                value={res.mn}
                                rows={2}
                                onChange={(e) => handleFieldChange(res.path, "mn", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all resize-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">
                                English (EN)
                              </span>
                              <textarea
                                value={res.en}
                                rows={2}
                                onChange={(e) => handleFieldChange(res.path, "en", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all resize-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">
                                Deutsch (DE)
                              </span>
                              <textarea
                                value={res.de}
                                rows={2}
                                onChange={(e) => handleFieldChange(res.path, "de", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
