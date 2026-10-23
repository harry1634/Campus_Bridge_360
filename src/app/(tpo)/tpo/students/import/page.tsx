import { ImportClient } from "./import-client";

export default function TpoStudentImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import Student Data</h1>
        <p className="mt-1 text-slate-500">
          Upload an Excel or CSV file to update academic records for registered students.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
