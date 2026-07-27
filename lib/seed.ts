import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase env vars in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const seedData = async () => {
  try {
    console.log("Clearing existing seed data...");
    await Promise.all([
      supabase.from("event_attendees").delete().neq("event_id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("events").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("users").delete().like("clerk_id", "user_%"),
      supabase.from("opportunities").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("clubs").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("news").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);

    console.log("Seeding users...");
    const usersToInsert = [
      ...Array.from({ length: 5 }, (_, i) => ({
        clerk_id: `user_mnums_${i}`,
        email: `mnums${i}@test.com`,
        student_id: `MNUMS${202400 + i}`,
        full_name: `MNUMS Student ${i}`,
        university: "MNUMS",
        role: "member",
      })),
      ...Array.from({ length: 8 }, (_, i) => ({
        clerk_id: `user_num_${i}`,
        email: `num${i}@test.com`,
        student_id: `NUM${202400 + i}`,
        full_name: `NUM Student ${i}`,
        university: "NUM",
        role: "member",
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        clerk_id: `user_must_${i}`,
        email: `must${i}@test.com`,
        student_id: `MUST${202400 + i}`,
        full_name: `MUST Student ${i}`,
        university: "MUST",
        role: "member",
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        clerk_id: `user_ufe_${i}`,
        email: `ufe${i}@test.com`,
        student_id: `UFE${202400 + i}`,
        full_name: `UFE Student ${i}`,
        university: "UFE",
        role: "member",
      })),
    ];
    const { error: usersErr } = await supabase.from("users").insert(usersToInsert);
    if (usersErr) throw usersErr;

    console.log("Seeding events...");
    const eventsToInsert = [
      {
        title: { en: "Youth Leadership Summit 2025", mn: "Залуучуудын Манлайллын Чуулган 2025" },
        description: {
          en: "Empowering the next generation of changemakers.",
          mn: "Ирээдүйн өөрчлөлтийг бүтээгчдийг чадавхжуулах.",
        },
        date: "2025-10-24T09:00:00.000Z",
        time_string: "09:00 - 18:00",
        location: { en: "Shangri-La, Ulaanbaatar", mn: "Шангри-Ла, Улаанбаатар" },
        image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop",
        category: "campaign",
        status: "upcoming",
        featured: true,
        university: "NUM",
      },
      {
        title: { en: "Book Donation Drive", mn: "Номын Хандивын Аян" },
        description: { en: "Help us collect books for rural schools.", mn: "Хөдөөгийн сургуулиудад ном цуглуулах аян." },
        date: "2025-11-05T10:00:00.000Z",
        time_string: "All Day",
        location: { en: "MNUMS Campus", mn: "АШУҮИС Кампус" },
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
        category: "fundraiser",
        status: "upcoming",
        featured: false,
        university: "MNUMS",
      },
      {
        title: { en: "Mental Health Workshop", mn: "Сэтгэл Зүйн Эрүүл Мэнд" },
        description: { en: "Stress management with psychologists.", mn: "Стресс менежментийн сургалт." },
        date: "2025-11-12T14:00:00.000Z",
        time_string: "14:00 - 16:00",
        location: { en: "Library Hall 404", mn: "Номын Сан 404" },
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
        category: "workshop",
        status: "upcoming",
        featured: false,
        university: "MUST",
      },
    ];
    const { error: eventsErr } = await supabase.from("events").insert(eventsToInsert);
    if (eventsErr) throw eventsErr;

    console.log("Seeding opportunities...");
    const { error: oppErr } = await supabase.from("opportunities").insert([
      {
        type: "scholarship",
        title: { en: "Global Health Scholarship", mn: "Дэлхийн Эрүүл Мэндийн Тэтгэлэг" },
        provider: { en: "UNICEF Mongolia", mn: "ЮНИСЕФ Монгол" },
        location: { en: "Ulaanbaatar", mn: "Улаанбаатар" },
        deadline: "2025-03-30",
        posted_date: "2025-01-01",
        description: { en: "Supporting rural health students.", mn: "Орон нутгийн эрүүл мэндийн оюутнуудад." },
        requirements: { en: ["GPA 3.5+"], mn: ["Голч дүн 3.5+"] },
        tags: ["Health", "Public", "Grant"],
        link: "https://www.unicef.org/mongolia",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
      },
    ]);
    if (oppErr) throw oppErr;

    console.log("Seeding clubs...");
    const { error: clubsErr } = await supabase.from("clubs").insert([
      {
        club_id: "MNUMS",
        name: { en: "MNUMS", mn: "АШУҮИС" },
        description: { en: "Medical university.", mn: "Анагаахын их сургууль." },
        website: "https://mnums.edu.mn/",
        email: "info@mnums.edu.mn",
        image: "https://images.unsplash.com/photo-1626125345510-470341582301?q=80&w=2070&auto=format&fit=crop",
      },
      {
        club_id: "NUM",
        name: { en: "NUM", mn: "МУИС" },
        description: { en: "National University of Mongolia.", mn: "Монгол Улсын Их Сургууль." },
        website: "https://www.num.edu.mn/",
        email: "contact@num.edu.mn",
        image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1978&auto=format&fit=crop",
      },
    ]);
    if (clubsErr) throw clubsErr;

    console.log("Seeding news...");
    const { error: newsErr } = await supabase.from("news").insert([
      {
        title: { en: "UNICEF Launches New Youth Strategy", mn: "ЮНИСЕФ Залуучуудын Шинэ Стратегиа Танилцууллаа" },
        summary: { en: "A new framework to empower young people.", mn: "Залуучуудыг чадавхжуулах шинэ тогтолцоо." },
        content: { en: "UNICEF Mongolia unveiled its 5-year strategy.", mn: "ЮНИСЕФ Монгол 5 жилийн стратегиа танилцууллаа." },
        author: "Admin",
        image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2070&auto=format&fit=crop",
        tags: ["Strategy", "Youth", "UNICEF"],
        featured: true,
        status: "published",
      },
    ]);
    if (newsErr) throw newsErr;

    console.log("✅ Supabase seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }

  process.exit(0);
};

seedData();
