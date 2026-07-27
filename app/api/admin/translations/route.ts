import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { withAdminAuth } from "@/lib/adminAuth";

export const GET = withAdminAuth(async () => {
  try {
    const mnPath = path.join(process.cwd(), "messages", "mn.json");
    const enPath = path.join(process.cwd(), "messages", "en.json");
    const dePath = path.join(process.cwd(), "messages", "de.json");

    const [mnContent, enContent, deContent] = await Promise.all([
      fs.readFile(mnPath, "utf8").catch(() => "{}"),
      fs.readFile(enPath, "utf8").catch(() => "{}"),
      fs.readFile(dePath, "utf8").catch(() => "{}"),
    ]);

    return NextResponse.json({
      mn: JSON.parse(mnContent),
      en: JSON.parse(enContent),
      de: JSON.parse(deContent),
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to read translation files", error);
    return NextResponse.json({ error: "Failed to read translations" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (request: Request) => {
  try {
    const { mn, en, de } = await request.json();

    const mnPath = path.join(process.cwd(), "messages", "mn.json");
    const enPath = path.join(process.cwd(), "messages", "en.json");
    const dePath = path.join(process.cwd(), "messages", "de.json");

    const writePromises = [];

    if (mn) {
      writePromises.push(fs.writeFile(mnPath, JSON.stringify(mn, null, 2), "utf8"));
    }
    if (en) {
      writePromises.push(fs.writeFile(enPath, JSON.stringify(en, null, 2), "utf8"));
    }
    if (de) {
      writePromises.push(fs.writeFile(dePath, JSON.stringify(de, null, 2), "utf8"));
    }

    await Promise.all(writePromises);

    return NextResponse.json({ message: "Translations updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to save translation files", error);
    return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
  }
});
