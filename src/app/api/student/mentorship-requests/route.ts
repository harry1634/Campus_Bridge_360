import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { getStudentProfile } from "@/lib/data/students";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireRole("student")).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { mentorId, message } = await req.json();
  if (!mentorId || typeof mentorId !== "string") {
    return NextResponse.json({ error: "Missing mentorId" }, { status: 400 });
  }

  const student = await getStudentProfile(uid);
  if (!student) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const existing = await adminDb
    .collection("mentorshipRequests")
    .where("mentorId", "==", mentorId)
    .where("studentUid", "==", uid)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json({ error: "You've already requested this mentor" }, { status: 409 });
  }

  const docRef = await adminDb.collection("mentorshipRequests").add({
    mentorId,
    studentUid: uid,
    studentName: student.name,
    message: message || "",
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, id: docRef.id });
}
