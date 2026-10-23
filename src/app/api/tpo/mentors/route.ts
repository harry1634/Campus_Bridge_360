import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { mentorFormSchema, mentorFormToPayload } from "@/lib/validators/mentor";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = mentorFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const docRef = await adminDb.collection("mentors").add({
    ...mentorFormToPayload(parsed.data),
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, id: docRef.id });
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing mentor id" }, { status: 400 });
  }

  const parsed = mentorFormSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ref = adminDb.collection("mentors").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  await ref.update({ ...mentorFormToPayload(parsed.data), updatedAt: FieldValue.serverTimestamp() });

  return NextResponse.json({ ok: true, id });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing mentor id" }, { status: 400 });
  }

  await adminDb.collection("mentors").doc(id).delete();
  return NextResponse.json({ ok: true, id });
}
