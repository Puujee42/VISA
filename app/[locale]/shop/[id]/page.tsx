import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isDbId, toApi } from "@/lib/supabase/mappers";
import ItemClient from "./ItemClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;

  if (!isDbId(id)) {
    return { title: "Item Not Found" };
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const item = toApi(data);
  if (!item) {
    return { title: "Item Not Found" };
  }

  const name = item.name as Record<string, string> | undefined;
  const descObj = item.description as Record<string, string> | undefined;
  const title = name?.[locale] || name?.en || "Shop Item";
  const desc = descObj?.[locale] || descObj?.en || "";

  return {
    title: `${title} - VISA Shop`,
    description: desc,
  };
}

export default async function ShopItemPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;

  if (!isDbId(id)) {
    notFound();
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const itemResponse = toApi(data);
  if (!itemResponse || !itemResponse.isActive) {
    notFound();
  }

  const item = {
    ...itemResponse,
    createdAt: itemResponse.createdAt ? String(itemResponse.createdAt) : undefined,
    updatedAt: itemResponse.updatedAt ? String(itemResponse.updatedAt) : undefined,
  };

  return (
    <main className="min-h-screen pt-24 pb-12">
      <ItemClient item={item} locale={locale} />
    </main>
  );
}
