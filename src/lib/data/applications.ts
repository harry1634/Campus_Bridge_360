import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Application } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getApplicationsForStudent(uid: string): Promise<Application[]> {
  const snapshot = await adminDb
    .collection("applications")
    .where("studentUid", "==", uid)
    .orderBy("appliedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Application);
}

export async function getAllApplications(): Promise<Application[]> {
  const snapshot = await adminDb.collection("applications").orderBy("appliedAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Application);
}

export async function getApplicationsForJob(jobId: string): Promise<Application[]> {
  const snapshot = await adminDb.collection("applications").where("jobId", "==", jobId).get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Application);
}
