"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Landmark,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const passwordValue = watch("newPassword", "");

  // Password strength indicators
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const strengthCount = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

  const onSubmit = async (data: ResetForm) => {
    if (!token) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Something went wrong";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <Card className="w-full max-w-md mx-4 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is missing or invalid. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 pb-6">
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Success state
  if (success) {
    return (
      <Card className="w-full max-w-md mx-4 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center animate-bounce">
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl">Password Reset!</CardTitle>
          <CardDescription>
            Your password has been changed successfully. You can now log in with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 pb-6">
          <Link href="/login" className="w-full">
            <Button className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-500/20">
              Go to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Reset form
  return (
    <Card className="w-full max-w-md mx-4 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <CardHeader className="text-center space-y-2 pb-2">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Landmark className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>
          Choose a strong password to secure your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-4">
          {/* Key icon illustration */}
          <div className="flex justify-center py-1">
            <div className="h-16 w-16 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-3">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {apiError}
              </p>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                className="h-11 pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}

            {/* Password strength bar */}
            {passwordValue.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= strengthCount
                          ? strengthCount === 1
                            ? "bg-red-500"
                            : strengthCount === 2
                            ? "bg-amber-500"
                            : "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  {[
                    { met: hasMinLength, label: "At least 8 characters" },
                    { met: hasUppercase, label: "One uppercase letter" },
                    { met: hasNumber, label: "One number" },
                  ].map((req) => (
                    <p
                      key={req.label}
                      className={`text-xs flex items-center gap-1.5 transition-colors ${
                        req.met
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span className={`inline-block w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] ${
                        req.met
                          ? "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700"
                          : "border-gray-300 dark:border-gray-600"
                      }`}>
                        {req.met ? "✓" : ""}
                      </span>
                      {req.label}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your new password"
                className="h-11 pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
