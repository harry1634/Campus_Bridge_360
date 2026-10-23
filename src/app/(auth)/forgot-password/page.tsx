"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { AlertCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSent(true);
    } catch {
      setServerError("Could not send reset email. Check the address and try again.");
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
            <p className="text-sm text-slate-500">Enter your email to receive a reset link</p>
          </div>
        </div>

        {sent ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password reset email sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@college.edu" {...register("email")} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              Send reset link
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
