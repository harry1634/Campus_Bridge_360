import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { PlacementUpdate } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getUpdates(): Promise<PlacementUpdate[]> {
  const snapshot = await adminDb.collection("placementUpdates").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as PlacementUpdate);
}
