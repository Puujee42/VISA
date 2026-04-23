"use client";

import { useState } from "react";

const fixes = [
  {
    id: 1,
    priority: "critical" as const,
    label: "motion → m Migration",
    icon: "⚡",
    shortDesc: "Fix LazyMotion bypass across 20+ files",
    prompt: `You are an expert Next.js and Framer Motion developer. I have a Next.js 15 project that uses LazyMotion with domAnimation feature set, but many components import \`motion\` directly instead of \`m\`, which bypasses LazyMotion and loads the full ~100KB Framer Motion bundle.

## Your Task
Migrate ALL direct \`motion\` imports to use \`m\` from framer-motion so they work correctly inside the existing \`<LazyMotion features={domAnimation}>\` wrapper that's already set up in MotionProvider.tsx.

## The Rule
- \`import { motion } from "framer-motion"\` → \`import { m } from "framer-motion"\`
- Every \`<motion.div\`, \`<motion.span\`, \`<motion.section\`, etc. → \`<m.div\`, \`<m.span\`, \`<m.section\`
- Keep all props, variants, and animation attributes exactly the same
- Keep AnimatePresence, useScroll, useTransform, useSpring, Variants — those don't change
- Do NOT wrap individual components in LazyMotion — it's already in the layout provider

## Files to Migrate
1. app/components/BeforeLoginNews.tsx
2. app/components/QPayModal.tsx
3. app/components/StudentInformation.tsx
4. app/components/admin/LessonsManager.tsx
5. app/[locale]/contact/ContactClient.tsx
6. app/[locale]/aupair/france/FranceClient.tsx
7. app/[locale]/aupair/belgium/BelgiumClient.tsx
8. app/[locale]/aupair/switzerland/SwitzerlandClient.tsx
9. app/[locale]/aupair/germany/GermanyClient.tsx
10. app/[locale]/register/page.tsx
11. app/[locale]/news/NewsClient.tsx
12. app/[locale]/news/[id]/page.tsx
13. app/[locale]/sign-up/page.tsx
14. app/[locale]/sign-in/page.tsx
15. app/[locale]/admin/page.tsx
16. app/[locale]/dashboard/page.tsx
17. app/[locale]/apply/page.tsx
18. app/[locale]/submit-documents/page.tsx
19. app/[locale]/join/page.tsx
20. app/[locale]/shop/ShopClient.tsx
21. app/[locale]/shop/[id]/ItemClient.tsx
22. app/[locale]/opportunities/[id]/page.tsx
23. app/[locale]/events/[id]/page.tsx

For each file, show me the complete updated import line and every JSX tag change. Be thorough — don't miss any motion.* usage including motion.button, motion.li, motion.p, motion.h1, motion.img, motion.a, motion.ul, motion.nav, motion.header, motion.footer.`
  },
  {
    id: 2,
    priority: "critical" as const,
    label: "Split Admin Page",
    icon: "🗂️",
    shortDesc: "Break 2,658-line admin page into lazy-loaded tabs",
    prompt: `You are an expert Next.js developer. I have a massive admin page at app/[locale]/admin/page.tsx that is 2,658 lines and ~107KB. This entire file is sent to the client as one chunk, causing slow initial loads.

## Your Task
Refactor the admin page into a tab-based architecture with lazy-loaded panels using Next.js \`dynamic()\`.

## Architecture to Implement

\`\`\`
app/[locale]/admin/
  page.tsx                    ← Thin shell: auth check + tab router only
  components/
    AdminShell.tsx            ← Tab navigation UI ("use client")  
    tabs/
      UsersTab.tsx            ← dynamic() loaded on tab click
      ApplicationsTab.tsx     ← dynamic() loaded on tab click
      EventsTab.tsx           ← dynamic() loaded on tab click
      NewsTab.tsx             ← dynamic() loaded on tab click
      ShoppingTab.tsx         ← dynamic() loaded on tab click
      BookingsTab.tsx         ← dynamic() loaded on tab click
      LessonsTab.tsx          ← dynamic() loaded on tab click
      ClubsTab.tsx            ← dynamic() loaded on tab click
\`\`\`

## Rules
- page.tsx should stay a Server Component — only do auth/role check and pass locale
- AdminShell.tsx manages which tab is active via useState
- Each tab component is loaded with:
  \`\`\`tsx
  const UsersTab = dynamic(() => import("./tabs/UsersTab"), {
    loading: () => <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />,
    ssr: false
  })
  \`\`\`
- Move all data fetching inside each tab using useEffect + fetch (keep existing API routes)
- Keep ALL existing functionality, just reorganize into separate files
- Preserve all existing Tailwind classes and UI

Show me the complete code for page.tsx, AdminShell.tsx, and at least UsersTab.tsx and ApplicationsTab.tsx as examples.`
  },
  {
    id: 3,
    priority: "critical" as const,
    label: "Server-Side Events & News Fetch",
    icon: "🌐",
    shortDesc: "Move client fetch() to Server Components",
    prompt: `You are an expert Next.js 15 App Router developer. In my project, the home page Events component (app/components/Events.tsx) fetches events and news client-side via useEffect + fetch(), which means:
1. Users see blank content until JS runs and fetch completes
2. Every page visit hits the API (no caching)
3. The component is marked "use client" just to fetch data

## Your Task
Refactor the data fetching to happen on the server using Next.js 15 App Router patterns.

## Current Pattern (Bad)
\`\`\`tsx
// Events.tsx - "use client"
useEffect(() => {
  Promise.all([
    fetch('/api/events').then(r => r.json()),
    fetch('/api/news').then(r => r.json())
  ])
}, [])
\`\`\`

## Target Pattern

**Step 1** — Create a server-side data fetcher:
\`\`\`ts
// lib/data/getEventsAndNews.ts
import { connectToDBWithRetry } from "@/lib/mongodb";
import Event from "@/models/Event";
import News from "@/models/News";

export async function getEventsAndNews() {
  await connectToDBWithRetry();
  const [events, news] = await Promise.all([
    Event.find({}).sort({ date: 1 }).limit(6).lean(),
    News.find({}).sort({ publishedDate: -1 }).limit(4).lean()
  ]);
  return { 
    events: JSON.parse(JSON.stringify(events)), 
    news: JSON.parse(JSON.stringify(news)) 
  };
}
\`\`\`

**Step 2** — Split Events.tsx into Server + Client:
- \`EventsSection.tsx\` (Server Component) — fetches data, passes as props
- \`EventsClient.tsx\` (Client Component) — receives props, handles UI/animations only

**Step 3** — Add revalidation to the server fetcher (revalidate every 60 seconds using \`unstable_cache\` or \`next/cache\`)

Show me the complete implementation of both files and the data fetcher, maintaining all existing UI/animation logic.`
  },
  {
    id: 4,
    priority: "medium" as const,
    label: "Add .lean() to MongoDB Queries",
    icon: "🍃",
    shortDesc: "3-5x faster read queries across API routes",
    prompt: `You are a MongoDB and Mongoose expert. In my Next.js API routes, many read-only Mongoose queries are missing \`.lean()\`, which means they return full Mongoose Document objects (with all prototype methods, virtuals, etc.) instead of plain JavaScript objects. This is 3–5x slower for read-only operations.

## Your Task
Add \`.lean()\` to every read-only query across these API route files. Also add \`.select()\` where we're returning more fields than needed.

## Files to Update
- app/api/bookings/route.ts
- app/api/bookings/available-times/route.ts  
- app/api/news/route.ts
- app/api/news/[id]/route.ts
- app/api/admin/bookings/route.ts
- app/api/admin/news/route.ts
- app/api/admin/events/route.ts
- app/api/admin/lessons/route.ts
- app/api/admin/clubs/route.ts
- app/api/admin/shopping/route.ts
- app/api/user/dashboard/route.ts
- app/api/user/get-profile/route.ts
- app/api/user/applications/route.ts
- app/api/events/route.ts
- app/api/opportunities/route.ts
- app/api/shopping/route.ts

## Rules
- Add \`.lean()\` to: \`.find()\`, \`.findById()\`, \`.findOne()\` when used for READ operations
- Do NOT add \`.lean()\` to queries followed by \`.save()\` or document methods
- For list endpoints returning many items, also add \`.limit(50)\` or appropriate limits if not already present
- For queries returning full user profiles to the frontend, use \`.select('-password -__v')\` style selectors to avoid leaking sensitive fields

Show me each file with the exact changes, with a brief comment on each change explaining why.`
  },
  {
    id: 5,
    priority: "medium" as const,
    label: "Add sizes to next/image",
    icon: "🖼️",
    shortDesc: "Prevent oversized images on mobile",
    prompt: `You are a Next.js performance expert. In my project, \`next/image\` is used correctly throughout but most Image components are missing the \`sizes\` prop. Without \`sizes\`, Next.js serves full-viewport-width images to all devices, including mobile phones that only need a fraction of that size.

## Your Task
Add correct \`sizes\` props to every \`<Image />\` component across the project.

## Files to Update
- app/components/HeroSlider.tsx
- app/components/Hero.tsx
- app/components/Events.tsx
- app/components/UseSection.tsx
- app/components/Navbar.tsx
- app/[locale]/aupair/AuPairClient.tsx
- app/[locale]/aupair/austria/AustriaClient.tsx
- app/[locale]/aupair/france/FranceClient.tsx
- app/[locale]/aupair/germany/GermanyClient.tsx
- app/[locale]/aupair/switzerland/SwitzerlandClient.tsx
- app/[locale]/aupair/belgium/BelgiumClient.tsx
- app/[locale]/news/NewsClient.tsx
- app/[locale]/news/[id]/page.tsx
- app/[locale]/events/[id]/page.tsx
- app/[locale]/dashboard/page.tsx

## Sizing Rules to Apply
Use these patterns based on how the image is used:

| Image usage | sizes value |
|---|---|
| Full-width hero/banner | \`sizes="100vw"\` |
| Full-width on mobile, half on desktop | \`sizes="(max-width: 768px) 100vw, 50vw"\` |
| Card in a grid (3 cols desktop) | \`sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"\` |
| Thumbnail / avatar / small icon | \`sizes="(max-width: 768px) 64px, 96px"\` |
| Sidebar / narrow column image | \`sizes="(max-width: 768px) 100vw, 300px"\` |

For each Image component, examine the surrounding layout context to determine which pattern applies. Show me all changes with the reasoning for each.`
  },
  {
    id: 6,
    priority: "medium" as const,
    label: "Fix Package Dependencies",
    icon: "📦",
    shortDesc: "Move server-only packages out of client bundle",
    prompt: `You are a Node.js and Next.js build optimization expert. My package.json has some issues that could affect bundle size and security.

## Current package.json issues to fix:

### Issue 1: livekit-server-sdk in dependencies (not devDependencies)
\`livekit-server-sdk\` is a server-side only SDK for managing LiveKit rooms from a backend. It should never be in the client bundle. Move it to be properly excluded.

### Issue 2: @types packages in wrong place
\`@types/nodemailer\` is in \`dependencies\` instead of \`devDependencies\` — type packages are only needed at build time.

### Issue 3: Add bundle size safeguards to next.config.ts
Add these experimental flags to prevent accidental client-side inclusion of server packages:

\`\`\`ts
experimental: {
  // existing optimizePackageImports stays...
  serverComponentsExternalPackages: [
    'mongoose',
    'livekit-server-sdk', 
    'nodemailer',
    'cloudinary'
  ]
}
\`\`\`

### Issue 4: Verify livekit imports are server-only
Check these files and ensure they are never imported in Client Components (files with "use client"):
- Any file importing from \`livekit-server-sdk\`
- Any file importing from \`nodemailer\`

If they are in API routes or Server Components only, add \`import 'server-only'\` at the top as a safeguard.

Show me the corrected package.json and next.config.ts, and any files that need \`import 'server-only'\` added.`
  },
  {
    id: 7,
    priority: "low" as const,
    label: "Optimize Scroll Animations",
    icon: "🎬",
    shortDesc: "Prevent jank from heavy useScroll on mobile",
    prompt: `You are a Framer Motion and web performance expert. My project has heavy scroll-linked animations in two components that can cause frame drops, especially on mobile and mid-range devices.

## Components to Optimize

### 1. app/components/WhyChooseUs.tsx
Currently uses:
- \`useScroll\` with target ref
- Multiple \`useTransform\` on scrollYProgress  
- \`useSpring\` with stiffness/damping
- \`useMotionValue\` for mouse tracking with springs

### 2. app/components/UseSection.tsx
Currently uses:
- \`useScroll\` + \`useTransform\` for parallax
- \`useSpring\` for smooth values

## Optimizations to Apply

**1. Add \`will-change\` hints via Framer Motion style:**
\`\`\`tsx
<m.div style={{ y: yBg, willChange: 'transform' }}>
\`\`\`

**2. Throttle mouse tracking with useCallback + requestAnimationFrame:**
\`\`\`tsx
const rafRef = useRef<number>();
const handleMouseMove = useCallback((e: MouseEvent) => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  rafRef.current = requestAnimationFrame(() => {
    x.set(e.clientX);
    y.set(e.clientY);
  });
}, [x, y]);
\`\`\`

**3. Disable spring physics on low-end devices:**
\`\`\`tsx
const prefersReducedMotion = useReducedMotion();
const springConfig = prefersReducedMotion ? { stiffness: 0, damping: 0 } : { stiffness: 100, damping: 20 };
\`\`\`

**4. Use \`layout\` prop carefully** — avoid \`layoutId\` on elements that scroll.

**5. Add \`transform: translateZ(0)\` via Tailwind \`will-change-transform\` on animated containers** to promote to GPU layer.

Show me the fully updated WhyChooseUs.tsx and UseSection.tsx with all these optimizations applied.`
  }
];

type Priority = "critical" | "medium" | "low";

const priorityConfig: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  medium:   { label: "Medium",   color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)" },
  low:      { label: "Low",      color: "#eab308", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.3)" },
};

export default function PromptDashboard() {
  const [selected, setSelected] = useState(fixes[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selected.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pc = priorityConfig[selected.priority as Priority];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      display: "flex",
      flexDirection: "column",
      color: "#e2e8f0"
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#a78bfa" }}>
              VISA PROJECT · CLAUDE OPUS 4.6
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
              Performance Fix Prompts — use with claude-opus-4-6
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{
          width: 240,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflowY: "auto",
          padding: "12px 8px",
          flexShrink: 0
        }}>
          {fixes.map(fix => {
            const p = priorityConfig[fix.priority as Priority];
            const isActive = fix.id === selected.id;
            return (
              <div
                key={fix.id}
                onClick={() => setSelected(fix)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 4,
                  cursor: "pointer",
                  background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{fix.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: isActive ? "#c4b5fd" : "#cbd5e1",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                      {fix.label}
                    </div>
                    <div style={{
                      display: "inline-block",
                      marginTop: 4,
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: p.color,
                      background: p.bg,
                      border: `1px solid ${p.border}`,
                      textTransform: "uppercase"
                    }}>
                      {p.label}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 4, lineHeight: 1.4, paddingLeft: 24 }}>
                  {fix.shortDesc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Prompt header */}
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{selected.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
                  {selected.label}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {selected.shortDesc}
                </div>
              </div>
              <div style={{
                padding: "3px 10px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: pc.color,
                background: pc.bg,
                border: `1px solid ${pc.border}`,
                textTransform: "uppercase"
              }}>
                {pc.label}
              </div>
            </div>
            <button
              onClick={handleCopy}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(99,102,241,0.5)",
                background: copied ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.15)",
                color: copied ? "#4ade80" : "#a78bfa",
                fontSize: 12, fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                letterSpacing: "0.04em"
              }}
            >
              {copied ? "✓ COPIED" : "⎘ COPY PROMPT"}
            </button>
          </div>

          {/* Usage instruction */}
          <div style={{
            margin: "12px 24px 0",
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
            fontSize: 11,
            color: "#818cf8",
            flexShrink: 0
          }}>
            <span style={{ fontWeight: 700 }}>HOW TO USE: </span>
            Copy this prompt → Open Claude.ai → Select <span style={{ 
              padding: "1px 5px", 
              borderRadius: 4, 
              background: "rgba(139,92,246,0.2)",
              color: "#c4b5fd",
              fontWeight: 700
            }}>claude-opus-4-6</span> → Paste the prompt → Attach the relevant file(s) from your project
          </div>

          {/* Prompt text */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px 24px"
          }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "20px 24px",
              fontSize: 12.5,
              lineHeight: 1.8,
              color: "#cbd5e1",
              whiteSpace: "pre-wrap",
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace"
            }}>
              {selected.prompt}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 28px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 10,
        color: "#334155"
      }}>
        <span>{fixes.filter(f => f.priority === "critical").length} critical · {fixes.filter(f => f.priority === "medium").length} medium · {fixes.filter(f => f.priority === "low").length} low</span>
        <span>VISA PROJECT PERFORMANCE AUDIT</span>
      </div>
    </div>
  );
}
