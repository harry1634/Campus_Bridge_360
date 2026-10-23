import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { companySchema } from "@/lib/validators/company";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const docRef = await adminDb.collection("companies").add({
    ...parsed.data,
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
    return NextResponse.json({ error: "Missing company id" }, { status: 400 });
  }

  const parsed = companySchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ref = adminDb.collection("companies").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  await ref.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });

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
    return NextResponse.json({ error: "Missing company id" }, { status: 400 });
  }

  await adminDb.collection("companies").doc(id).delete();
  return NextResponse.json({ ok: true, id });
}
