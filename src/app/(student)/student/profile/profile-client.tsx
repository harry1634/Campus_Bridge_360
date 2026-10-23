"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StudentProfile } from "@/lib/types";
import { profileFormSchema, type ProfileFormInput } from "@/lib/validators/profile";
import { computeProfileCompletion } from "@/lib/business/profile-completion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/shared/progress-ring";
import { CheckCircle2 } from "lucide-react";

export function ProfileClient({ student }: { student: StudentProfile }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { percentage, missingFields } = computeProfileCompletion(student);

  const { register, handleSubmit } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      phone: student.phone ?? "",
      skills: student.skills.join(", "),
      projects: student.projects.map((p) => `${p.title} | ${p.description}`).join("\n"),
      internships: student.internships
        .map((i) => `${i.company} | ${i.role} | ${i.duration}`)
        .join("\n"),
      certifications: student.certifications.map((c) => `${c.name} | ${c.issuer}`).join("\n"),
      resumeUrl: student.resumeUrl ?? "",
      linkedin: student.linkedin ?? "",
      github: student.github ?? "",
      portfolio: student.portfolio ?? "",
      preferredRole: student.preferredRole ?? "",
      preferredIndustry: student.preferredIndustry ?? "",
      preferredLocation: student.preferredLocation ?? "",
    },
  });

  async function onSubmit(data: ProfileFormInput) {
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save profile");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Completion + read-only info */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <ProgressRing percentage={percentage} size={80} />
            <span className="absolute text-base font-bold text-slate-900">{percentage}%</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Profile Completion</p>
            {missingFields.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">Missing: {missingFields.join(", ")}</p>
            ) : (
              <p className="mt-1 text-xs text-emerald-600">Your profile is complete!</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{student.department}</Badge>
            <Badge variant="purple">Batch {student.batch}</Badge>
            <Badge variant="success">CGPA {student.cgpa || "—"}</Badge>
            <Badge variant={student.backlogs > 0 ? "warning" : "success"}>
              {student.backlogs} backlogs
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic Details (managed by TPO)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Student ID</p>
            <p className="font-medium text-slate-900">{student.studentId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Department</p>
            <p className="font-medium text-slate-900">{student.department}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Graduation year</p>
            <p className="font-medium text-slate-900">{student.graduationYear}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="font-medium text-slate-900">{student.email}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal & Career</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
            {saved && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Profile saved
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" placeholder="React, Node.js, SQL" {...register("skills")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" {...register("linkedin")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" {...register("github")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input id="portfolio" {...register("portfolio")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input id="resumeUrl" placeholder="Link to your hosted resume" {...register("resumeUrl")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="projects">Projects (one per line: Title | Description)</Label>
              <textarea
                id="projects"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                {...register("projects")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="internships">Internships (one per line: Company | Role | Duration)</Label>
              <textarea
                id="internships"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                {...register("internships")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="certifications">Certifications (one per line: Name | Issuer)</Label>
              <textarea
                id="certifications"
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                {...register("certifications")}
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Career preferences
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="preferredRole">Preferred job role</Label>
                <Input id="preferredRole" {...register("preferredRole")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferredIndustry">Preferred industry</Label>
                <Input id="preferredIndustry" {...register("preferredIndustry")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferredLocation">Preferred location</Label>
                <Input id="preferredLocation" {...register("preferredLocation")} />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-fit">
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
