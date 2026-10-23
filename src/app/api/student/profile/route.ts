import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { profileFormSchema, profileFormToPayload } from "@/lib/validators/profile";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireRole("student")).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = profileFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await adminDb
    .collection("students")
    .doc(uid)
    .update({
      ...profileFormToPayload(parsed.data),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ ok: true });
}
