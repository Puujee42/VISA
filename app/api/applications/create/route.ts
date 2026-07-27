import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { connectToDB } from "@/lib/mongodb";
import Application from "@/lib/models/Application";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const data = await req.json();

    const programId = data.programId;
    const firstName = String(data.firstName || "").trim();
    const lastName = String(data.lastName || "").trim();
    const email = String(data.email || "").trim();
    const phone = normalizePhone(data.phone || "");
    const age = String(data.age || "").trim();
    const level = String(data.level || "").trim();
    const message = String(data.message || "").trim();
    const answers =
      data.answers && typeof data.answers === "object" ? data.answers : {};

    if (!programId || !firstName || !lastName || !email || !phone || !age || !level) {
      return NextResponse.json(
        { error: "Бүх заавал бөглөх талбарыг бөглөнө үү." },
        { status: 400 },
      );
    }

    await connectToDB();
    const row = await Application.create({
      programId,
      firstName,
      lastName,
      email,
      phone,
      age,
      level,
      message,
      answers,
      userId: userId || undefined,
      status: "pending",
    });

    return NextResponse.json(
      {
        _id: row._id.toString(),
        id: row._id.toString(),
        programId: row.programId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        age: row.age,
        level: row.level,
        message: row.message,
        answers: row.answers,
        status: row.status,
        userId: row.userId,
        createdAt: row.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { error: "Өргөдөл илгээж чадсангүй. Дахин оролдоно уу." },
      { status: 500 },
    );
  }
}
