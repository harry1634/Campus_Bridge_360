"use client";

import { Pencil, Trash2 } from "lucide-react";

export function RowActions({
  onEdit,
  onDelete,
  label,
  className = "absolute right-3 top-3",
}: {
  onEdit: () => void;
  onDelete: () => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        title="Edit"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        title="Delete"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
