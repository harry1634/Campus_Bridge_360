import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Company } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getCompanies(): Promise<Company[]> {
  const snapshot = await adminDb.collection("companies").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Company);
}

export async function getCompany(id: string): Promise<Company | null> {
  const doc = await adminDb.collection("companies").doc(id).get();
  if (!doc.exists) return null;
  return toIsoTimestamps({ id: doc.id, ...doc.data() }) as Company;
}
