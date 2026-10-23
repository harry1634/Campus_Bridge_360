import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { studentAcademicRowSchema } from "@/lib/validators/import";
import { FieldValue } from "firebase-admin/firestore";
import type { ImportError } from "@/lib/types";

// Rows are validated again here (never trust the client), then matched
// against existing student accounts by studentId and their academic fields
// updated. Rows with no matching account are reported as failures rather
// than silently creating orphaned records.
export async function POST(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireRole("tpo")).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { fileName, rows } = await req.json();
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Missing rows" }, { status: 400 });
  }

  const errors: ImportError[] = [];
  let successCount = 0;

  for (const row of rows) {
    const parsed = studentAcademicRowSchema.safeParse(row.data ?? row);
    if (!parsed.success) {
      errors.push({
        row: row.rowIndex ?? 0,
        studentId: row.data?.studentId,
        message: parsed.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }

    const { studentId, department, batch, cgpa, backlogs } = parsed.data;

    const snapshot = await adminDb
      .collection("students")
      .where("studentId", "==", studentId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      errors.push({
        row: row.rowIndex ?? 0,
        studentId,
        message: "No registered student account found with this Student ID",
      });
      continue;
    }

    await snapshot.docs[0].ref.update({
      department,
      batch,
      cgpa,
      backlogs,
      updatedAt: FieldValue.serverTimestamp(),
    });
    successCount += 1;
  }

  await adminDb.collection("imports").add({
    fileName: fileName || "unknown",
    totalRows: rows.length,
    successCount,
    failedCount: errors.length,
    errors,
    importedBy: uid,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    ok: true,
    totalRows: rows.length,
    successCount,
    failedCount: errors.length,
    errors,
  });
}
