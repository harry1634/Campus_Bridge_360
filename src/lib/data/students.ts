import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { StudentProfile } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  const doc = await adminDb.collection("students").doc(uid).get();
  if (!doc.exists) return null;
  return toIsoTimestamps(doc.data()) as StudentProfile;
}

export async function getAllStudents(): Promise<StudentProfile[]> {
  const snapshot = await adminDb.collection("students").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps(doc.data()) as StudentProfile);
}
