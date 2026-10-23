import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Alumni } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getAlumni(): Promise<Alumni[]> {
  const snapshot = await adminDb.collection("alumni").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Alumni);
}
