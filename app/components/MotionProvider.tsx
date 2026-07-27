"use client";

import { MotionConfig, LazyMotion, domAnimation } from "framer-motion";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
