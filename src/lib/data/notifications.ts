import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { NotificationRecord } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getNotificationsForUser(uid: string): Promise<NotificationRecord[]> {
  const snapshot = await adminDb
    .collection("notifications")
    .where("userUid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as NotificationRecord);
}
