"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Mail,
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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await api.post("/auth/verify-email", { token });
        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const msg = error.response?.data?.message || "Verification failed";
        setErrorMessage(msg);
        setStatus("error");
        toast.error(msg);
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setIsResending(true);
    try {
      await api.post("/auth/resend-verification", { email: resendEmail });
      toast.success("Verification email sent!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to resend verification email";
      toast.error(msg);
    } finally {
      setIsResending(false);
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
          <CardTitle className="text-2xl">Invalid Verification Link</CardTitle>
          <CardDescription>
            This verification link is missing or invalid. Please register again to receive a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 pb-6">
          <Link href="/register" className="w-full">
            <Button className="w-full">Go to Register</Button>
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

  // Loading state
  if (status === "loading") {
    return (
      <Card className="w-full max-w-md mx-4 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verifying Your Email...</CardTitle>
          <CardDescription>
            Please wait while we verify your email address.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Success state
  if (status === "success") {
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
                <Mail className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl">Email Verified!</CardTitle>
          <CardDescription>
            Your email has been verified successfully. Your account is now pending admin approval. You&apos;ll be notified once your account is activated.
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

  // Error state
  return (
    <Card className="w-full max-w-md mx-4 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <CardTitle className="text-2xl">Verification Failed</CardTitle>
        <CardDescription>{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage.toLowerCase().includes("expired") && (
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Your verification link has expired. Enter your email below to receive a new one.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resendEmail">Email Address</Label>
              <Input
                id="resendEmail"
                type="email"
                placeholder="Enter your email"
                className="h-11"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </div>
            <Button
              className="w-full h-11"
              onClick={handleResend}
              disabled={isResending || !resendEmail}
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isResending ? "Sending..." : "Request New Verification"}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pb-6">
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
