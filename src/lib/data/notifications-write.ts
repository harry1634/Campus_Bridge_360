import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { NotificationType } from "@/lib/types";

export async function createNotification(params: {
  userUid: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  await adminDb.collection("notifications").add({
    ...params,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}
