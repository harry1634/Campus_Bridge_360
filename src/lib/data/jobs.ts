import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Job } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getJobs(): Promise<Job[]> {
  const snapshot = await adminDb.collection("jobs").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Job);
}

export async function getPublishedJobs(): Promise<Job[]> {
  const snapshot = await adminDb
    .collection("jobs")
    .where("status", "==", "published")
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Job);
}

export async function getJob(id: string): Promise<Job | null> {
  const doc = await adminDb.collection("jobs").doc(id).get();
  if (!doc.exists) return null;
  return toIsoTimestamps({ id: doc.id, ...doc.data() }) as Job;
}
