"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [sent, setSent] = React.useState(false);
  const [checking, setChecking] = React.useState(false);

  async function resend() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setSent(true);
    }
  }

  async function checkVerified() {
    setChecking(true);
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      router.push("/student/dashboard");
    }
    setChecking(false);
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-500">
          We&apos;ve sent a verification link to your email address. Please verify to continue.
        </p>

        <div className="mt-6 space-y-3">
          {sent && (
            <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              Verification email resent.
            </p>
          )}
          <Button onClick={checkVerified} disabled={checking} size="lg" className="w-full shadow-lg shadow-teal-600/25">
            {checking ? "Checking..." : "I've verified my email"}
          </Button>
          <Button onClick={resend} variant="outline" size="lg" className="w-full">
            Resend verification email
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
