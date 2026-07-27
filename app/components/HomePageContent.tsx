"use client";

import dynamic from "next/dynamic";
import { Link } from "@/navigation";
import { Plane, CalendarDays, ShoppingBag, FileText, GraduationCap, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import LazySection from "./LazySection";
import MobileHowItWorks from "./MobileHowItWorks";
import MobileFooter from "./MobileFooter";
import { DesktopDestinations, DesktopHowItWorks } from "./DesktopHomeSections";
import HeroSlider from "./HeroSlider";

const EventsSection = dynamic(() => import("./Events"), { ssr: false });
const Expectations = dynamic(() => import("./Expectations"), { ssr: false });
const UsSection = dynamic(() => import("./UseSection"), { ssr: false });
const WhyChooseUs = dynamic(() => import("./WhyChooseUs"), { ssr: false });

function MobileQuickActions() {
  const t = useTranslations("navbar");
  const home = useTranslations("HomePage");

  const actions = [
    { icon: Plane, label: t("program"), href: "/aupair", color: "#00C896" },
    { icon: FileText, label: t("register"), href: "/apply", color: "#E31B23" },
    { icon: CalendarDays, label: t("events"), href: "/events", color: "#2563EB" },
    { icon: GraduationCap, label: t("lessons"), href: "/lessons", color: "#8B5CF6" },
    { icon: ShoppingBag, label: t("shop"), href: "/shop", color: "#F59E0B" },
    { icon: Info, label: t("about"), href: "/about", color: "#64748B" },
  ];

  return (
    <section className="lg:hidden px-4 py-4">
      <p className="mobile-section-label px-1 mb-3">{home("quickAccess")}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] active:scale-95 transition-transform"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${action.color}18, ${action.color}08)`, color: action.color }}
            >
              <action.icon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionSkeleton({ h = "h-[400px]" }: { h?: string }) {
  return <div className={`w-full ${h} bg-slate-100/80 rounded-2xl animate-pulse`} />;
}

export default function HomePageContent() {
  return (
    <div className="w-full">
      {/* Full-bleed hero — must stay outside width-constrained wrap */}
      <HeroSlider />

      <div className="app-content-wrap">
        <MobileQuickActions />
        <MobileHowItWorks />

        <DesktopDestinations />
        <DesktopHowItWorks />

        <section className="app-section content-auto">
          <div className="lg:max-w-6xl lg:mx-auto lg:px-6">
            <div className="lg:rounded-[2rem] lg:overflow-hidden lg:border lg:border-slate-100 lg:bg-white">
              <LazySection placeholder={<SectionSkeleton h="h-[480px]" />}>
                <UsSection />
              </LazySection>
            </div>
          </div>
        </section>

        <section className="app-section pt-0 content-auto">
          <div className="lg:max-w-6xl lg:mx-auto lg:px-6">
            <LazySection placeholder={<SectionSkeleton h="h-[420px]" />}>
              <EventsSection />
            </LazySection>
          </div>
        </section>

        <section className="app-section pt-0 content-auto">
          <div className="lg:max-w-6xl lg:mx-auto lg:px-6">
            <LazySection placeholder={<SectionSkeleton h="h-[380px]" />}>
              <Expectations />
            </LazySection>
          </div>
        </section>

        <section className="app-section pt-0 content-auto">
          <div className="lg:max-w-6xl lg:mx-auto lg:px-6">
            <LazySection placeholder={<SectionSkeleton h="h-[520px]" />}>
              <WhyChooseUs />
            </LazySection>
          </div>
        </section>

        <MobileFooter />
      </div>
    </div>
  );
}
