import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { getCompany } from "@/lib/data/companies";
import { jobPayloadSchema } from "@/lib/validators/job";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireRole("tpo")).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = jobPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const company = await getCompany(data.companyId);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const docRef = await adminDb.collection("jobs").add({
    companyId: data.companyId,
    companyName: company.name,
    title: data.title,
    description: data.description,
    location: data.location,
    workMode: data.workMode,
    package: data.package,
    requiredSkills: data.requiredSkills,
    preferredSkills: data.preferredSkills,
    applicationDeadline: data.applicationDeadline,
    driveDate: data.driveDate || null,
    jobType: data.jobType,
    eligibility: {
      departments: data.departments,
      minCgpa: data.minCgpa,
      maxBacklogs: data.maxBacklogs,
      batches: data.batches,
      otherRequirements: data.otherRequirements || "",
    },
    status: "draft",
    createdBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, id: docRef.id });
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing job id" }, { status: 400 });
  }

  const parsed = jobPayloadSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const company = await getCompany(data.companyId);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const ref = adminDb.collection("jobs").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  await ref.update({
    companyId: data.companyId,
    companyName: company.name,
    title: data.title,
    description: data.description,
    location: data.location,
    workMode: data.workMode,
    package: data.package,
    requiredSkills: data.requiredSkills,
    preferredSkills: data.preferredSkills,
    applicationDeadline: data.applicationDeadline,
    driveDate: data.driveDate || null,
    jobType: data.jobType,
    eligibility: {
      departments: data.departments,
      minCgpa: data.minCgpa,
      maxBacklogs: data.maxBacklogs,
      batches: data.batches,
      otherRequirements: data.otherRequirements || "",
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, id });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing job id" }, { status: 400 });
  }

  await adminDb.collection("jobs").doc(id).delete();
  return NextResponse.json({ ok: true, id });
}
