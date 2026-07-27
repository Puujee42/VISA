import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApiList } from "@/lib/supabase/mappers";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";

const FALLBACK_QUESTIONS = [
  {
    id: "fallback-firstName",
    fieldKey: "firstName",
    label: { en: "First name", mn: "Нэр", de: "Vorname" },
    type: "text",
    options: [],
    required: true,
    sortOrder: 10,
    isSystem: true,
  },
  {
    id: "fallback-lastName",
    fieldKey: "lastName",
    label: { en: "Last name", mn: "Овог", de: "Nachname" },
    type: "text",
    options: [],
    required: true,
    sortOrder: 20,
    isSystem: true,
  },
  {
    id: "fallback-email",
    fieldKey: "email",
    label: { en: "Email", mn: "И-мэйл", de: "E-Mail" },
    type: "email",
    options: [],
    required: true,
    sortOrder: 30,
    isSystem: true,
  },
  {
    id: "fallback-phone",
    fieldKey: "phone",
    label: { en: "Phone", mn: "Утас", de: "Telefon" },
    type: "phone",
    options: [],
    required: true,
    sortOrder: 40,
    isSystem: true,
  },
  {
    id: "fallback-age",
    fieldKey: "age",
    label: { en: "Age", mn: "Нас", de: "Alter" },
    type: "number",
    options: [],
    required: true,
    sortOrder: 50,
    isSystem: true,
  },
  {
    id: "fallback-level",
    fieldKey: "level",
    label: { en: "Language level", mn: "Хэлний түвшин", de: "Sprachniveau" },
    type: "select",
    options: ["A1", "A2", "B1", "B2", "C1"],
    required: true,
    sortOrder: 60,
    isSystem: true,
  },
  {
    id: "fallback-message",
    fieldKey: "message",
    label: { en: "Message", mn: "Нэмэлт мэдээлэл", de: "Nachricht" },
    type: "textarea",
    options: [],
    required: false,
    sortOrder: 70,
    isSystem: true,
  },
];

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("apply_questions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    );

    if (error) throw error;
    if (!data?.length) {
      return NextResponse.json(FALLBACK_QUESTIONS, {
        headers: { "Cache-Control": "public, s-maxage=30" },
      });
    }

    return NextResponse.json(toApiList(data), {
      headers: { "Cache-Control": "public, s-maxage=30" },
    });
  } catch (error) {
    console.error("[GET /api/apply-questions]", error);
    return NextResponse.json(FALLBACK_QUESTIONS);
  }
}
