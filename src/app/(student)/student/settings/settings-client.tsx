"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, KeyRound, LogOut } from "lucide-react";

export function SettingsClient({ email }: { email: string }) {
  const router = useRouter();
  const [sent, setSent] = React.useState(false);

  async function handleResetPassword() {
    await sendPasswordResetEmail(auth, email);
    setSent(true);
  }

  async function handleLogout() {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900">{email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sent && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Password reset email sent to {email}
            </div>
          )}
          <Button variant="outline" onClick={handleResetPassword}>
            <KeyRound className="h-4 w-4" />
            Send password reset email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
