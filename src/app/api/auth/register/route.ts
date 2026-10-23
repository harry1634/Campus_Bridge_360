import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { registerSchema } from "@/lib/validators/auth";
import { FieldValue } from "firebase-admin/firestore";

// Students self-register through this route. TPO accounts are provisioned
// separately (out of scope for self-serve signup) to keep the two roles
// clearly separated at the point of account creation.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, studentId, email, password, department, batch, graduationYear } = parsed.data;

  const existing = await adminDb
    .collection("students")
    .where("studentId", "==", studentId)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json(
      { error: "A student with this Student ID is already registered." },
      { status: 409 }
    );
  }

  let uid: string;
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });
    uid = userRecord.uid;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const now = FieldValue.serverTimestamp();
  const batchWrite = adminDb.batch();

  batchWrite.set(adminDb.collection("users").doc(uid), {
    uid,
    email,
    role: "student",
    emailVerified: false,
    createdAt: now,
  });

  batchWrite.set(adminDb.collection("students").doc(uid), {
    uid,
    studentId,
    name,
    email,
    department,
    batch,
    graduationYear,
    cgpa: 0,
    backlogs: 0,
    skills: [],
    projects: [],
    internships: [],
    certifications: [],
    createdAt: now,
    updatedAt: now,
  });

  await batchWrite.commit();

  // Email verification is sent client-side after sign-in (see register page),
  // since that uses the client SDK's sendEmailVerification with the signed-in user.
  return NextResponse.json({ ok: true, uid });
}
