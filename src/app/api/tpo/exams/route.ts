import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { getCompany } from "@/lib/data/companies";
import { examPayloadSchema } from "@/lib/validators/exam";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    await requireRole("tpo");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = examPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  let companyName: string | undefined;
  if (data.companyId) {
    const company = await getCompany(data.companyId);
    companyName = company?.name;
  }

  const docRef = await adminDb.collection("placementExams").add({
    name: data.name,
    companyId: data.companyId || null,
    companyName: companyName || null,
    date: data.date,
    time: data.time,
    durationMinutes: data.durationMinutes,
    examType: data.examType,
    platform: data.platform || "",
    examLink: data.examLink || "",
    instructions: data.instructions || "",
    deadline: data.deadline,
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
    return NextResponse.json({ error: "Missing exam id" }, { status: 400 });
  }

  const parsed = examPayloadSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  let companyName: string | undefined;
  if (data.companyId) {
    const company = await getCompany(data.companyId);
    companyName = company?.name;
  }

  const ref = adminDb.collection("placementExams").doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  await ref.update({
    name: data.name,
    companyId: data.companyId || null,
    companyName: companyName || null,
    date: data.date,
    time: data.time,
    durationMinutes: data.durationMinutes,
    examType: data.examType,
    platform: data.platform || "",
    examLink: data.examLink || "",
    instructions: data.instructions || "",
    deadline: data.deadline,
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
    return NextResponse.json({ error: "Missing exam id" }, { status: 400 });
  }

  await adminDb.collection("placementExams").doc(id).delete();
  return NextResponse.json({ ok: true, id });
}
