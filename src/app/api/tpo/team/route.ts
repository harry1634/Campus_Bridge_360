import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { inviteTpoSchema } from "@/lib/validators/team";
import { FieldValue } from "firebase-admin/firestore";
import { getTpoTeam } from "@/lib/data/tpo-team";

export async function GET() {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const team = await getTpoTeam();
  return NextResponse.json({ team });
}

// Invites a new TPO teammate. Only an existing, signed-in TPO can reach this
// route — there is no public sign-up path for the TPO role, which keeps
// students from ever being able to create a TPO account themselves.
export async function POST(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteTpoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, designation } = parsed.data;

  const existing = await adminAuth.getUserByEmail(email).catch(() => null);
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const tempPassword = crypto.randomUUID();
  let uid: string;
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password: tempPassword,
      displayName: name,
      emailVerified: true,
    });
    uid = userRecord.uid;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const now = FieldValue.serverTimestamp();
  const batch = adminDb.batch();
  batch.set(adminDb.collection("users").doc(uid), {
    uid,
    email,
    role: "tpo",
    emailVerified: true,
    createdAt: now,
  });
  batch.set(adminDb.collection("tpoProfiles").doc(uid), {
    uid,
    name,
    email,
    designation: designation || "",
    createdAt: now,
  });
  await batch.commit();

  const resetLink = await adminAuth.generatePasswordResetLink(email);

  return NextResponse.json({ ok: true, uid, resetLink });
}
