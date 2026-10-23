import Link from "next/link";
import { getAllStudents } from "@/lib/data/students";
import { Button } from "@/components/ui/button";
import { StudentsClient } from "./students-client";
import { Upload } from "lucide-react";

export default async function TpoStudentsPage() {
  const students = await getAllStudents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-slate-500">
            {students.length} student{students.length === 1 ? "" : "s"} registered
          </p>
        </div>
        <Link href="/tpo/students/import">
          <Button variant="outline">
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </Link>
      </div>
      <StudentsClient students={students} />
    </div>
  );
}
