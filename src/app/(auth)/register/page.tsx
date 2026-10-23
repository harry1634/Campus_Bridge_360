"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap } from "lucide-react";
import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Registration failed");
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
      await sendEmailVerification(credential.user);
      router.push("/verify-email");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create your student account</h1>
            <p className="text-sm text-slate-500">Join Campus Bridge 360 in a few steps</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Priya Sharma" {...register("name")} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" placeholder="e.g. 21CSE045" {...register("studentId")} />
              {errors.studentId && (
                <p className="text-xs text-red-600">{errors.studentId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@college.edu" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                {...register("department")}
              >
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {DEPARTMENT_LABELS[d]}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-red-600">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="graduationYear">Graduation year</Label>
              <Input id="graduationYear" type="number" placeholder="2026" {...register("graduationYear")} />
              {errors.graduationYear && (
                <p className="text-xs text-red-600">{errors.graduationYear.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch">Batch</Label>
            <Input id="batch" placeholder="e.g. 2022-2026" {...register("batch")} />
            {errors.batch && <p className="text-xs text-red-600">{errors.batch.message}</p>}
          </div>

          <Button
            type="submit"
            className="group mt-1 w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
            {!submitting && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-teal-600 hover:underline">
              Sign in
            </a>
          </p>
          <p className="text-center text-xs text-slate-400">
            Placement cell staff?{" "}
            <a href="/login?role=tpo" className="font-medium text-slate-500 hover:underline">
              Sign in as TPO
            </a>{" "}
            — TPO accounts are provisioned by your administrator.
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
