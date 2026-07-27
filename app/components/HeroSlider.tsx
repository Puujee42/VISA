"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/navigation";
import Image from "next/image";
import { FaMapMarkerAlt, FaClock, FaArrowRight, FaGlobeEurope, FaUserCheck } from "react-icons/fa";
import { useTranslations } from "next-intl";

const AUTOPLAY_DURATION = 7000;
const HERO_IMG =
  "https://res.cloudinary.com/dxoxdiuwr/video/upload/f_auto,q_auto:eco,w_1920,c_fill,so_0/v1/A_cinematic_highquality_202601201908_j5s2n_kkoosh.jpg";

const HeroSlider = () => {
  const t = useTranslations("HeroSlider");
  const [slideIndex, setSlideIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = [
    {
      id: 1,
      title: t("slide1_title"),
      desc: t("slide1_desc"),
      location: t("slide1_location"),
      path: "/aupair/germany",
      duration: "12 Months",
    },
    {
      id: 2,
      title: t("slide2_title"),
      desc: t("slide2_desc"),
      location: t("slide2_location"),
      path: "/aupair/austria",
      duration: "12 Months",
    },
    {
      id: 3,
      title: t("slide3_title"),
      desc: t("slide3_desc"),
      location: t("slide3_location"),
      path: "/aupair/france",
      duration: "12 Months",
    },
  ];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const activeSlide = slides[slideIndex];

  const goTo = (index: number) => {
    setSlideIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_DURATION);
  };

  return (
    <section className="relative w-full bg-slate-950 text-white overflow-hidden h-[100svh] min-h-[560px] -mt-[calc(var(--app-header-height)+env(safe-area-inset-top,0px))] lg:mt-0 lg:h-[100dvh] lg:min-h-[100dvh] lg:max-h-none lg:flex lg:items-center">
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_IMG}
          alt="AUPAIR"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/90 lg:bg-[linear-gradient(105deg,rgba(2,12,22,0.92)_0%,rgba(2,12,22,0.72)_42%,rgba(2,12,22,0.28)_70%,rgba(2,12,22,0.45)_100%)]" />
        <div className="hidden lg:block absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="hidden lg:block absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/90 to-transparent" />
      </div>

      {/* Mobile */}
      <div className="lg:hidden relative z-10 flex flex-col justify-end h-full px-4 pb-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom,0px)+16px)]">
        <div key={activeSlide.id} className="hero-fade">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 border border-white/15 text-[11px] font-semibold backdrop-blur-sm">
              <FaGlobeEurope className="text-[#00C896]" size={11} />
              {activeSlide.location}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C896]/20 border border-[#00C896]/35 text-[11px] font-semibold text-[#00C896] backdrop-blur-sm">
              <FaUserCheck size={11} />
              {t("verified")}
            </span>
          </div>

          <div className="hero-glass-card p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-[#E31B23] mb-2">AUPAIR</p>
            <h1 className="text-[26px] font-black leading-[1.08] tracking-tight mb-2">
              {activeSlide.title}
            </h1>
            <p className="text-[14px] text-white/75 leading-relaxed line-clamp-2 mb-4 font-medium">
              {activeSlide.desc}
            </p>
            <div className="flex items-center gap-3 mb-4 text-[12px] font-semibold text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <FaClock size={11} className="text-[#E31B23]" />
                {activeSlide.duration}
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="inline-flex items-center gap-1.5">
                <FaMapMarkerAlt size={11} className="text-[#00C896]" />
                {activeSlide.location}
              </span>
            </div>
            <Link href="/apply" className="hero-mobile-cta">
              {t("learnMore")}
              <FaArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                index === slideIndex ? "w-5 bg-[#00C896]" : "w-1.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop — full viewport, content under floating nav */}
      <div className="hidden lg:grid relative z-10 w-full max-w-[1280px] mx-auto px-8 xl:px-10 pt-24 pb-10 grid-cols-12 items-center gap-6">
        <div className="col-span-8">
          <div key={activeSlide.id} className="hero-fade max-w-2xl">
            <p className="text-xs font-black tracking-[0.28em] text-[#E31B23] mb-4">
              AUPAIR
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 border border-white/15 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <FaGlobeEurope className="text-[#00C896]" size={12} />
                {activeSlide.location}
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00C896]/15 border border-[#00C896]/30 text-[11px] font-bold uppercase tracking-widest text-[#00C896] backdrop-blur-sm">
                <FaUserCheck size={12} />
                {t("verified")}
              </span>
            </div>

            <h1 className="text-[2.75rem] xl:text-6xl font-black leading-[1.02] tracking-tight mb-5 text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
              {activeSlide.title}
            </h1>

            <p className="text-base xl:text-lg text-white/80 max-w-lg leading-relaxed font-medium mb-6 border-l-2 border-[#E31B23] pl-4">
              {activeSlide.desc}
            </p>

            <div className="flex items-center gap-5 mb-8 text-sm font-bold text-white/85">
              <span className="inline-flex items-center gap-2">
                <FaClock size={13} className="text-[#E31B23]" />
                {activeSlide.duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <FaMapMarkerAlt size={13} className="text-[#00C896]" />
                {activeSlide.location}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#E31B23] text-white rounded-full font-bold text-sm hover:brightness-110 transition-[filter,transform] active:scale-[0.98] shadow-[0_12px_40px_-12px_rgba(227,27,35,0.65)]"
              >
                {t("learnMore")}
                <FaArrowRight size={11} />
              </Link>
              <Link
                href={activeSlide.path}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/25 bg-white/5 text-white font-bold text-sm hover:bg-white/12 transition-colors backdrop-blur-sm"
              >
                {t("viewProgram")}
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col justify-center items-end gap-2.5">
          {slides.map((item, index) => {
            const isActive = index === slideIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={`w-full max-w-[240px] text-right px-5 py-3.5 rounded-2xl border transition-[opacity,background-color,border-color,transform] duration-200 outline-none backdrop-blur-md ${
                  isActive
                    ? "bg-white/12 border-white/25 opacity-100 scale-[1.02]"
                    : "bg-black/20 border-white/5 opacity-50 hover:opacity-85"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E31B23] mb-0.5">
                  0{index + 1}
                </p>
                <p className="text-[15px] font-bold text-white">{item.location}</p>
                {isActive && (
                  <div className="mt-2.5 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      key={slideIndex}
                      className="h-full bg-gradient-to-r from-[#00C896] to-[#E31B23] hero-progress"
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
