import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationId } = await params;
  const ref = adminDb.collection("notifications").doc(notificationId);
  const doc = await ref.get();

  if (!doc.exists || doc.data()?.userUid !== user.uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await ref.update({ read: true });
  return NextResponse.json({ ok: true });
}
