import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const {
      firstName,
      lastName,
      sex,
      dob,
      placeOfBirth,
      nationality,
      religion,
      phone,
      mobile,
      skype,
      bestTime,
      street,
      number,
      postalCode,
      city,
      country,
      fatherProfession,
      motherProfession,
      brothers,
      sisters,
      hobbies,
      languages,
      childcareExperience,
      householdTasks,
      motivation,
    } = data;

    const profileUpdate = {
      firstName,
      lastName,
      "profile.sex": sex,
      "profile.dob": dob ? new Date(dob) : null,
      "profile.placeOfBirth": placeOfBirth,
      "profile.nationality": nationality,
      "profile.religion": religion,
      "profile.phone": phone,
      "profile.mobile": mobile,
      "profile.skype": skype,
      "profile.bestTime": bestTime,
      "profile.address.street": street,
      "profile.address.number": number,
      "profile.address.postalCode": postalCode,
      "profile.address.city": city,
      "profile.address.country": country,
      "profile.fatherProfession": fatherProfession,
      "profile.motherProfession": motherProfession,
      "profile.brothers": brothers,
      "profile.sisters": sisters,
      "profile.hobbies": hobbies,
      "profile.languages": languages,
      "profile.childcareExperience": childcareExperience,
      "profile.householdTasks": householdTasks,
      "profile.motivation": motivation,
      documentsSubmitted: true,
    };

    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: profileUpdate },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!user) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}