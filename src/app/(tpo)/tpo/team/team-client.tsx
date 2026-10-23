"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TpoProfile } from "@/lib/types";
import { inviteTpoSchema, type InviteTpoInput } from "@/lib/validators/team";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2, Check, Copy, Plus, UserPlus, X } from "lucide-react";

export function TeamClient({ team }: { team: TpoProfile[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resetLink, setResetLink] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteTpoInput>({ resolver: zodResolver(inviteTpoSchema) });

  async function onSubmit(data: InviteTpoInput) {
    setSubmitting(true);
    setError(null);
    setResetLink(null);
    try {
      const res = await fetch("/api/tpo/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Failed to invite teammate");
        return;
      }
      setResetLink(json.resetLink);
      reset();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!resetLink) return;
    await navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setShowForm((s) => !s);
            setResetLink(null);
          }}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Invite TPO"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              {error && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Priya Sharma" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="priya@college.edu" {...register("email")} />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" placeholder="Assistant Placement Officer" {...register("designation")} />
              </div>
              <Button type="submit" disabled={submitting} className="sm:col-span-2 sm:w-fit">
                <UserPlus className="h-4 w-4" />
                {submitting ? "Inviting..." : "Create TPO account"}
              </Button>
            </form>

            {resetLink && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">
                  Account created. Share this link so they can set their password:
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                    {resetLink}
                  </code>
                  <Button type="button" size="sm" variant="outline" onClick={copyLink}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {team.length === 0 ? (
        <EmptyState icon={Building2} title="No TPO accounts yet" description="Invite your first teammate above." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((t) => (
            <Card key={t.uid}>
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.designation || "TPO"}</p>
                <p className="mt-2 text-xs text-slate-400">{t.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
