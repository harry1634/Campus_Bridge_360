import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { getJob } from "@/lib/data/jobs";
import { getStudentProfile } from "@/lib/data/students";
import { evaluateEligibility } from "@/lib/business/eligibility";
import { createNotification } from "@/lib/data/notifications-write";
import { FieldValue } from "firebase-admin/firestore";

// Creates an application. Eligibility is re-checked here, server-side, so a
// student can never apply to a job they don't qualify for — even if the
// frontend was bypassed or the job URL was guessed directly.
export async function POST(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireRole("student")).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { jobId } = await req.json();
  if (!jobId || typeof jobId !== "string") {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const [job, student] = await Promise.all([getJob(jobId), getStudentProfile(uid)]);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.status !== "published") {
    return NextResponse.json({ error: "This job is not accepting applications" }, { status: 400 });
  }
  if (!student) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }
  if (new Date(job.applicationDeadline) < new Date()) {
    return NextResponse.json({ error: "Application deadline has passed" }, { status: 400 });
  }

  const eligibility = evaluateEligibility(student, job.eligibility);
  if (!eligibility.eligible) {
    return NextResponse.json(
      { error: "You are not eligible for this job", reasons: eligibility.failureReasons },
      { status: 403 }
    );
  }

  const existing = await adminDb
    .collection("applications")
    .where("jobId", "==", jobId)
    .where("studentUid", "==", uid)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 });
  }

  const now = FieldValue.serverTimestamp();
  const nowIso = new Date().toISOString();

  const docRef = await adminDb.collection("applications").add({
    jobId,
    companyId: job.companyId,
    companyName: job.companyName,
    studentUid: uid,
    studentId: student.studentId,
    studentName: student.name,
    department: student.department,
    cgpa: student.cgpa,
    status: "applied",
    statusHistory: [{ status: "applied", changedAt: nowIso, changedBy: uid }],
    appliedAt: now,
    updatedAt: now,
  });

  await createNotification({
    userUid: uid,
    type: "application_confirmation",
    title: "Application submitted",
    body: `You've applied for ${job.title} at ${job.companyName}.`,
    link: "/student/applications",
  });

  return NextResponse.json({ ok: true, id: docRef.id });
}
