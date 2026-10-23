import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { updatePayloadSchema } from "@/lib/validators/update";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireRole("tpo")).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updatePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const docRef = await adminDb.collection("placementUpdates").add({
    ...parsed.data,
    createdBy: uid,
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
    return NextResponse.json({ error: "Missing update id" }, { status: 400 });
  }

  const parsed = updatePayloadSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ref = adminDb.collection("placementUpdates").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Update not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Missing update id" }, { status: 400 });
  }

  await adminDb.collection("placementUpdates").doc(id).delete();
  return NextResponse.json({ ok: true, id });
}
