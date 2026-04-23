"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/navigation";
import Image from "next/image";
import { AnimatePresence, m, Variants } from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import {
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaGlobeEurope,
  FaUserCheck,
} from "react-icons/fa";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";

const CloudinaryPlayer = dynamic(() => import("./CloudinaryPlayer"), {
  ssr: false,
});

/* ────────────────────── Configuration ────────────────────── */
const AUTOPLAY_DURATION = 8000; // 8 Seconds per slide

/* ────────────────────── Animation Variants ────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ────────────────────── Main Component ────────────────────── */
const HeroSlider = () => {
  const t = useTranslations("HeroSlider");
  const locale = useLocale();
  const [slideIndex, setSlideIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Auto-play logic
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_DURATION);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[slideIndex];

  useEffect(() => {
    // Intersection Observer to lazy load video
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[100dvh] min-h-[700px] w-full bg-slate-900 text-white flex items-center justify-center overflow-hidden selection:bg-red-500 selection:text-white"
    >
      {/* ─── 1. Background (Video/Image) ─── */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Video Background */}
        <div className="hidden md:block absolute inset-0 w-full h-full">
          {mounted && inView && (
            <CloudinaryPlayer
              publicId="A_cinematic_highquality_202601201908_j5s2n_kkoosh"
              cloudName="dxoxdiuwr"
              poster="https://res.cloudinary.com/dxoxdiuwr/video/upload/f_auto,q_30,so_0/v1/A_cinematic_highquality_202601201908_j5s2n_kkoosh.jpg"
              className="w-full h-full object-cover opacity-50 scale-105 pointer-events-none"
            />
          )}
        </div>

        {/* Mobile Static Image Background */}
        <div className="block md:hidden absolute inset-0 w-full h-full">
          <Image
            src="https://res.cloudinary.com/dxoxdiuwr/video/upload/f_auto,q_auto,so_0/v1/A_cinematic_highquality_202601201908_j5s2n_kkoosh.jpg"
            alt="Hero Background"
            fill
            className="object-cover opacity-50 transition-transform duration-700 will-change-transform"
            priority
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            sizes="100vw"
            style={{ transform: "scale(1.05)" }}
          />
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
      </div>

      {/* ─── 2. Main Content ─── */}
      <div className="relative z-10 container mx-auto px-5 md:px-6 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 items-center h-full">
        {/* LEFT COLUMN: Text Content */}
        <div className="lg:col-span-8 pt-24 pb-20 lg:pt-0 lg:pb-0">
          <AnimatePresence mode="wait">
            <m.div
              key={activeSlide.id}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-4xl text-left"
            >
              {/* Floating Badges */}
              <m.div
                variants={textVariants}
                className="flex flex-wrap items-center gap-3 mb-8"
              >
                {/* Location Badge */}
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                  <FaGlobeEurope className="text-[#00C896]" size={14} />
                  {activeSlide.location}
                </span>

                {/* Verified Badge */}
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C896]/10 backdrop-blur-md border border-[#00C896]/20 text-xs font-bold uppercase tracking-widest text-[#00C896] shadow-lg">
                  <FaUserCheck size={14} />
                  {t("verified")}
                </span>
              </m.div>

              {/* Headline */}
              <m.h1
                variants={textVariants}
                className="text-[40px] sm:text-[48px] md:text-[64px] font-bold leading-[1.05] tracking-tight mb-5 md:mb-8 drop-shadow-lg text-slate-50"
              >
                {activeSlide.title.split(" ").map((word: string, i: number) => (
                  <span key={i} className="inline-block mr-2 md:mr-3">
                    {word === "Au" || word === "Pair" ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300 drop-shadow-sm">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
              </m.h1>

              {/* Description with Vertical Accent Line */}
              <m.div
                variants={textVariants}
                className="flex gap-6 mb-10 pl-2"
              >
                <div className="w-1 rounded-full bg-gradient-to-b from-[#E31B23] to-transparent h-auto min-h-[60px]" />
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-medium">
                  {activeSlide.desc}
                </p>
              </m.div>

              {/* Metadata Stats */}
              <m.div
                variants={textVariants}
                className="flex items-center gap-8 mb-10 text-sm font-bold text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-[#E31B23]">
                    <FaClock />
                  </div>
                  <span>{activeSlide.duration}</span>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-[#00C896]">
                    <FaMapMarkerAlt />
                  </div>
                  <span>{activeSlide.location}</span>
                </div>
              </m.div>

              {/* CTA Button */}
              <m.div variants={textVariants}>
                <Link href={activeSlide.path}>
                  <m.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 20px 40px -10px rgba(227, 27, 35, 0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-4 px-8 py-4 bg-[#E31B23] text-white rounded-full font-bold text-lg overflow-hidden transition-all duration-300"
                  >
                    <span className="relative z-10">{t("learnMore")}</span>
                    <span className="relative z-10 p-1 bg-white/20 rounded-full group-hover:rotate-45 transition-transform duration-300">
                      <FaArrowRight size={12} />
                    </span>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  </m.button>
                </Link>
              </m.div>
            </m.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Cinematic Pagination */}
        <div className="hidden lg:flex lg:col-span-4 h-full flex-col justify-center items-end pl-12">
          <div className="flex flex-col gap-6">
            {slides.map((item, index) => {
              const isActive = index === slideIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setSlideIndex(index)}
                  className="group relative w-72 flex items-center justify-end gap-6 outline-none"
                >
                  <div
                    className={`text-right transition-all duration-500 ${isActive ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4 group-hover:opacity-70"}`}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-[#E31B23] mb-1">
                      0{index + 1}
                    </p>
                    <h2 className="text-lg font-bold text-white">
                      {item.location}
                    </h2>
                  </div>

                  {/* Vertical Progress Bar */}
                  <div className="relative w-[6px] h-[80px] rounded-full overflow-hidden transition-all duration-500 bg-slate-800 shrink-0">
                    {isActive && (
                      <m.div
                        layoutId="activeGlow"
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#00C896] to-[#E31B23]"
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        transition={{
                          duration: AUTOPLAY_DURATION / 1000,
                          ease: "linear",
                        }}
                        key={slideIndex}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
