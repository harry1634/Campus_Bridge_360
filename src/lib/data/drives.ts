import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { PlacementDrive } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getDrives(): Promise<PlacementDrive[]> {
  const snapshot = await adminDb.collection("placementDrives").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as PlacementDrive);
}
