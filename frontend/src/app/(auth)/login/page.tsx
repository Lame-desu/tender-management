"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Landmark,
  Loader2,
  Mail,
  Shield,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const ROLE_OPTIONS = [
  {
    value: "BIDDER",
    label: "Bidder",
    description: "Browse tenders & submit bids",
    icon: Users,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  {
    value: "PROCUREMENT_OFFICER",
    label: "Procurement Manager",
    description: "Create tenders & manage bids",
    icon: FileText,
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  {
    value: "EVALUATOR",
    label: "Evaluator",
    description: "Review & score proposals",
    icon: BarChart3,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
  },
] as const;

export default function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === selectedRole);

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    setLoginError("");
    try {
      await login(data.email, data.password, selectedRole || undefined);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || "Login failed";
      setLoginError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async (e: FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsResending(true);
    try {
      await api.post("/auth/resend-verification", { email: resendEmail });
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ||
          "Failed to resend verification email"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex min-h-screen">
      {/* ─── LEFT PANEL — Branding & Illustration ───────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />

        {/* Animated grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-32 right-16 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"
          style={{ animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"
          style={{ animation: "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              TenderETH
            </span>
          </div>

          {/* Center content */}
          <div className="space-y-8 max-w-lg">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm font-medium text-blue-200 mb-6">
                <Shield className="h-3.5 w-3.5" />
                Secure Procurement Platform
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Welcome back to{" "}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  transparent
                </span>{" "}
                procurement
              </h1>
              <p className="mt-5 text-lg text-blue-200/80 leading-relaxed">
                Sign in to manage tenders, submit bids, and track evaluations —
                all from one secure dashboard.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, label: "Tender Management" },
                { icon: Users, label: "Bid Submissions" },
                { icon: BarChart3, label: "Smart Evaluation" },
                { icon: Shield, label: "Audit Trails" },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.08]"
                >
                  <feature.icon className="h-4 w-4 text-blue-300 flex-shrink-0" />
                  <span className="text-sm text-blue-100 font-medium">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial-like stat */}
          <div className="flex items-center gap-6 text-sm text-blue-300/70">
            <span>Ethiopia&apos;s Digital Procurement</span>
            <span className="h-1 w-1 rounded-full bg-blue-400/40" />
            <span>Trusted & Transparent</span>
            <span className="h-1 w-1 rounded-full bg-blue-400/40" />
            <span>24/7 Access</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL — Login Form ───────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-gray-50 relative overflow-y-auto">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative w-full max-w-[440px] px-6 sm:px-8 py-8">
          {/* Mobile logo (shown only on smaller screens) */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              TenderETH
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Select your role and enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* ─── Role Selection (Custom dropdown) ─── */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Login as
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${
                    selectedRoleOption
                      ? "border-gray-200"
                      : "border-gray-200"
                  } ${isDropdownOpen ? "border-blue-400 ring-2 ring-blue-500/20" : ""}`}
                >
                  {selectedRoleOption ? (
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg bg-gradient-to-br ${selectedRoleOption.gradient} flex items-center justify-center shadow-sm`}
                      >
                        <selectedRoleOption.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {selectedRoleOption.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedRoleOption.description}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Select your role...
                    </span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                {isDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 py-2 animate-in fade-in-0 zoom-in-95 duration-150">
                    {ROLE_OPTIONS.map((role) => {
                      const isSelected = selectedRole === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                            isSelected
                              ? `${role.bg}`
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`h-9 w-9 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-sm`}
                          >
                            <role.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-semibold ${
                                isSelected ? role.text : "text-gray-900"
                              }`}
                            >
                              {role.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {role.description}
                            </div>
                          </div>
                          {isSelected && (
                            <div
                              className={`h-5 w-5 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0`}
                            >
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                    <div className="border-t border-gray-100 mt-1 pt-1 px-4 py-2">
                      <p className="text-xs text-gray-400 text-center">
                        Admin? Leave unselected and sign in directly
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Email ─── */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border-2 border-gray-200 bg-white px-4 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ─── Password ─── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-11 rounded-xl border-2 border-gray-200 bg-white px-4 pr-11 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ─── Error Display ─── */}
            {loginError && !loginError.toLowerCase().includes("verify your email") && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-600 font-medium">{loginError}</p>
              </div>
            )}

            {/* ─── Submit ─── */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-sm font-semibold transition-all duration-200 hover:shadow-blue-500/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* ─── Resend Verification (conditional) ─── */}
          {loginError.toLowerCase().includes("verify your email") && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
                <Mail className="h-4 w-4" />
                <span>Didn&apos;t receive the verification email?</span>
              </div>
              <form
                onSubmit={handleResendVerification}
                className="flex gap-2"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="text-sm h-9 rounded-lg border-amber-200 bg-white"
                  required
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={isResending}
                  className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {isResending && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  Resend
                </Button>
              </form>
            </div>
          )}

          {/* ─── Footer links ─── */}
          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-50 px-3 text-gray-400">
                  New to TenderETH?
                </span>
              </div>
            </div>
            <Link href="/register" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-200"
              >
                Create a Bidder Account
              </Button>
            </Link>
            <Link
              href="/"
              className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
