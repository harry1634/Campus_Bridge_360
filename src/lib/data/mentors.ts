import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Mentor, MentorshipRequest } from "@/lib/types";
import { toIsoTimestamps } from "./serialize";

export async function getMentors(): Promise<Mentor[]> {
  const snapshot = await adminDb.collection("mentors").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as Mentor);
}

export async function getMentorshipRequestsForStudent(uid: string): Promise<MentorshipRequest[]> {
  const snapshot = await adminDb
    .collection("mentorshipRequests")
    .where("studentUid", "==", uid)
    .get();
  return snapshot.docs.map((doc) => toIsoTimestamps({ id: doc.id, ...doc.data() }) as MentorshipRequest);
}
