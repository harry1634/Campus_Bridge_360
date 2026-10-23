import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { getCompany } from "@/lib/data/companies";
import { drivePayloadSchema } from "@/lib/validators/drive";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = drivePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const company = await getCompany(data.companyId);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const docRef = await adminDb.collection("placementDrives").add({
    companyId: data.companyId,
    companyName: company.name,
    jobRole: data.jobRole,
    package: data.package,
    driveDate: data.driveDate,
    location: data.location,
    workMode: data.workMode,
    applicationDeadline: data.applicationDeadline,
    description: data.description,
    recruitmentStages: data.recruitmentStages,
    eligibility: {
      departments: data.departments,
      minCgpa: data.minCgpa,
      maxBacklogs: data.maxBacklogs,
      batches: data.batches,
    },
    createdAt: FieldValue.serverTimestamp(),
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
    return NextResponse.json({ error: "Missing drive id" }, { status: 400 });
  }

  const parsed = drivePayloadSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const company = await getCompany(data.companyId);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const ref = adminDb.collection("placementDrives").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }

  await ref.update({
    companyId: data.companyId,
    companyName: company.name,
    jobRole: data.jobRole,
    package: data.package,
    driveDate: data.driveDate,
    location: data.location,
    workMode: data.workMode,
    applicationDeadline: data.applicationDeadline,
    description: data.description,
    recruitmentStages: data.recruitmentStages,
    eligibility: {
      departments: data.departments,
      minCgpa: data.minCgpa,
      maxBacklogs: data.maxBacklogs,
      batches: data.batches,
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
    return NextResponse.json({ error: "Missing drive id" }, { status: 400 });
  }

  await adminDb.collection("placementDrives").doc(id).delete();
  return NextResponse.json({ ok: true, id });
}
