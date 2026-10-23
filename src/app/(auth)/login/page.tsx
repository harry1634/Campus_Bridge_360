"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/layout/auth-shell";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

type Role = "student" | "tpo";

const roleTabs: { value: Role; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "student", label: "Student Login", icon: GraduationCap },
  { value: "tpo", label: "TPO Login", icon: Building2 },
];

const REMEMBER_KEY = "cb360-remembered-email";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole: Role = searchParams.get("role") === "tpo" ? "tpo" : "student";

  const [role, setRole] = React.useState<Role>(initialRole);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  React.useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBER_KEY);
    if (remembered) {
      setValue("email", remembered);
      setRememberMe(true);
    }
  }, [setValue]);

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await credential.user.getIdToken();

      const userDoc = await getDoc(doc(db, "users", credential.user.uid));
      const accountRole = userDoc.exists() ? userDoc.data().role : null;

      if (accountRole !== role) {
        const actual = accountRole === "tpo" ? "TPO" : accountRole === "student" ? "Student" : null;
        setServerError(
          actual
            ? `This account is registered as a ${actual}. Switch to the ${actual} tab to sign in.`
            : "Account role could not be determined."
        );
        return;
      }

      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_KEY, data.email);
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (role === "tpo") {
        router.push("/tpo/dashboard");
      } else if (!credential.user.emailVerified) {
        router.push("/verify-email");
      } else {
        router.push("/student/dashboard");
      }
    } catch {
      setServerError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell variant={role}>
      <div
        className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white"
        style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.10)" }}
      >
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back! 👋</h1>
              <p className="mt-0.5 text-sm text-[#64748B]">Sign in to continue to your account</p>
            </div>
          </div>

          {/* Role tabs */}
          <div className="mt-7 flex items-center gap-2 border-b border-[#E2E8F0]">
            {roleTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setRole(tab.value);
                  setServerError(null);
                }}
                className={`relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                  role === tab.value
                    ? "text-emerald-600"
                    : "rounded-lg bg-[#F1F5F9] text-[#64748B] hover:text-slate-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {role === tab.value && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-600" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {serverError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email or Student ID
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="text"
                  placeholder="you@college.edu or 22CS1001"
                  className="h-[52px] rounded-[10px] border-[#E2E8F0] bg-[#F8FAFC] pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-[52px] rounded-[10px] border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-10"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="group h-[52px] w-full rounded-[12px] bg-emerald-600 font-semibold shadow-sm hover:bg-emerald-700"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : role === "tpo" ? "Sign in as TPO" : "Sign in"}
              {!submitting && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>

            {role === "student" ? (
              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <a href="/register" className="font-medium text-emerald-600 hover:underline">
                  Create one
                </a>
              </p>
            ) : (
              <p className="text-center text-xs text-slate-400">
                TPO accounts are provisioned by your placement cell administrator.
              </p>
            )}
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[#E2E8F0] bg-[#F0FDF4] px-6 py-3.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <p className="text-xs text-[#475569]">Your data is safe with us. We never share your information.</p>
        </div>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
