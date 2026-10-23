import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER } from "@/lib/business/application-status";
import { createNotification } from "@/lib/data/notifications-write";
import type { ApplicationStatus } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  let uid: string;
  try {
    uid = (await requireRole("tpo")).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { applicationId } = await params;
  const { status, notes } = await req.json();

  if (!APPLICATION_STATUS_ORDER.includes(status as ApplicationStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const ref = adminDb.collection("applications").doc(applicationId);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const nowIso = new Date().toISOString();
  const existingHistory = doc.data()?.statusHistory ?? [];

  await ref.update({
    status,
    statusHistory: [
      ...existingHistory,
      { status, changedAt: nowIso, changedBy: uid, ...(notes ? { notes } : {}) },
    ],
    updatedAt: FieldValue.serverTimestamp(),
  });

  const appData = doc.data();
  if (appData?.studentUid) {
    await createNotification({
      userUid: appData.studentUid,
      type: "status_change",
      title: "Application status updated",
      body: `Your application to ${appData.companyName} is now: ${APPLICATION_STATUS_LABELS[status as ApplicationStatus]}.`,
      link: "/student/applications",
    });
  }

  return NextResponse.json({ ok: true });
}
