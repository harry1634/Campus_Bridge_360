import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { TpoProfile } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getTpoTeam(): Promise<TpoProfile[]> {
  const snapshot = await adminDb.collection("tpoProfiles").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ uid: doc.id, ...doc.data() }) as TpoProfile);
}
