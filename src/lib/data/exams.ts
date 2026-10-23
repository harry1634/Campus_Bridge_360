import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { PlacementExam } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getExams(): Promise<PlacementExam[]> {
  const snapshot = await adminDb.collection("placementExams").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as PlacementExam);
}
