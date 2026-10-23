"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { validateRows, type ParsedRow } from "@/lib/validators/import";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, X, XCircle } from "lucide-react";

const COLUMN_HINTS = ["Student ID", "Name", "Department", "Batch", "CGPA", "Backlogs"];

interface ImportResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: { row: number; studentId?: string; message: string }[];
}

export function ImportClient() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileSize, setFileSize] = React.useState<number | null>(null);
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;

  async function processFile(file: File) {
    setParseError(null);
    setResult(null);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });

      if (json.length === 0) {
        setParseError("The file has no data rows.");
        setRows([]);
        return;
      }

      setRows(validateRows(json));
    } catch {
      setParseError("Could not read this file. Make sure it's a valid .xlsx or .csv file.");
      setRows([]);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/tpo/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          rows: rows.filter((r) => r.valid),
        }),
      });
      const json = await res.json();
      setResult(json);
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setFileName(null);
    setFileSize(null);
    setRows([]);
    setResult(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragActive ? "border-teal-400 bg-teal-50/50" : "border-slate-200 bg-slate-50/40"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-8 ring-teal-50/50">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">
                Drag & drop your file here
              </p>
              <p className="mt-1 text-sm text-slate-500">or click below to browse from your device</p>
            </div>

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Browse files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <span className="text-xs text-slate-400">Required columns:</span>
              {COLUMN_HINTS.map((c) => (
                <Badge key={c} variant="outline" className="bg-white text-[11px]">
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          {fileName && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{fileName}</p>
                  {fileSize != null && (
                    <p className="text-xs text-slate-400">{formatFileSize(fileSize)}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                aria-label="Remove file"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {parseError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {parseError}
            </div>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && !result && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline">{rows.length} total records</Badge>
                <Badge variant="success">{validCount} valid</Badge>
                {invalidCount > 0 && <Badge variant="destructive">{invalidCount} invalid</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleImport} disabled={importing || validCount === 0}>
                  <Upload className="h-4 w-4" />
                  {importing ? "Importing..." : `Import ${validCount} valid records`}
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-lg border border-slate-100">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="px-4 py-2 font-medium">Row</th>
                    <th className="px-4 py-2 font-medium">Student ID</th>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Department</th>
                    <th className="px-4 py-2 font-medium">Batch</th>
                    <th className="px-4 py-2 font-medium">CGPA</th>
                    <th className="px-4 py-2 font-medium">Backlogs</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.rowIndex}
                      className={`border-b border-slate-50 last:border-0 ${!row.valid ? "bg-red-50/40" : ""}`}
                    >
                      <td className="px-4 py-2 text-slate-400">{row.rowIndex}</td>
                      <td className="px-4 py-2">{String(row.raw.studentId ?? row.raw["Student ID"] ?? "")}</td>
                      <td className="px-4 py-2">{String(row.raw.name ?? row.raw.Name ?? "")}</td>
                      <td className="px-4 py-2">{String(row.raw.department ?? row.raw.Department ?? "")}</td>
                      <td className="px-4 py-2">{String(row.raw.batch ?? row.raw.Batch ?? "")}</td>
                      <td className="px-4 py-2">{String(row.raw.cgpa ?? row.raw.CGPA ?? "")}</td>
                      <td className="px-4 py-2">{String(row.raw.backlogs ?? row.raw.Backlogs ?? "")}</td>
                      <td className="px-4 py-2">
                        {row.valid ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-red-600"
                            title={row.errors.join("; ")}
                          >
                            <XCircle className="h-3.5 w-3.5" /> {row.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{result.totalRows}</p>
                <p className="text-xs text-slate-500">Total records</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{result.successCount}</p>
                <p className="text-xs text-slate-500">Imported</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{result.failedCount}</p>
                <p className="text-xs text-slate-500">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Validation errors
                </p>
                <div className="max-h-64 space-y-1.5 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <div key={i} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      Row {err.row}{err.studentId ? ` (${err.studentId})` : ""}: {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" className="mt-4" onClick={reset}>
              Import another file
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
