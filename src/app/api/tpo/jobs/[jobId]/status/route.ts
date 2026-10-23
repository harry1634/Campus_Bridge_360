import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { JobStatus } from "@/lib/types";

const VALID_STATUSES: JobStatus[] = ["draft", "published", "unpublished", "closed", "archived"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { jobId } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await adminDb.collection("jobs").doc(jobId).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}
