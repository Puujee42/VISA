import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { phoneToEmail } from "@/lib/phone";

/** Promote phone 99918122 (and ADMIN_PHONES) to admin in public.users */
export async function POST() {
  try {
    const admin = getSupabaseAdmin();
    const phone = "99918122";
    const email = phoneToEmail(phone);

    const { data: byPhone } = await admin
      .from("users")
      .update({ role: "admin", phone })
      .or(`phone.eq.${phone},email.eq.${email}`)
      .select("id, clerk_id, email, phone, role");

    // Also update any auth user matching email metadata via list is heavy —
    // upsert a stub if nobody exists yet (they must still register/login once).
    if (!byPhone?.length) {
      return NextResponse.json({
        ok: true,
        updated: 0,
        message:
          "Одоогоор энэ дугаартай хэрэглэгч DB-д алга. 99918122-оор бүртгүүлэх/нэвтрэхэд автоматаар admin болно.",
        phone,
        email,
      });
    }

    return NextResponse.json({
      ok: true,
      updated: byPhone.length,
      users: byPhone,
      message: "99918122 admin болголоо.",
    });
  } catch (error) {
    console.error("[ensure-admin]", error);
    return NextResponse.json(
      {
        error:
          "Шинэчилж чадсангүй. Supabase холболт эсвэл users хүснэгтийг шалгана уу.",
      },
      { status: 500 },
    );
  }
}
