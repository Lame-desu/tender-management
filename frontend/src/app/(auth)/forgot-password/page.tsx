"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Landmark, Loader2, Mail, ArrowLeft, CheckCircle2, Sparkles, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
      toast.success("Reset email sent!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 overflow-hidden">
      {/* Decorative top accent */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="text-center space-y-2 pb-2">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Landmark className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl">
          {submitted ? "Check Your Email" : "Forgot Password?"}
        </CardTitle>
        <CardDescription>
          {submitted
            ? "We've sent a password reset link to your email"
            : "No worries! Enter your email and we'll help you reset it"}
        </CardDescription>
      </CardHeader>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-4">
            {/* Email icon illustration */}
            <div className="flex justify-center py-2">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-blue-500" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center animate-bounce">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Sending..." : "Send Reset Link"}
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
      ) : (
        <div>
          <CardContent className="space-y-5 pt-4">
            {/* Success illustration */}
            <div className="flex justify-center py-2">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center animate-bounce">
                  <Mail className="h-3.5 w-3.5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Email sent info */}
              <div className="rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20 p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-green-300 leading-relaxed">
                  We&apos;ve sent a reset link to
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-green-200 mt-1">
                  {submittedEmail}
                </p>
              </div>

              {/* Instructions */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                <div className="flex items-start gap-3">
                  <Inbox className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Next steps:</p>
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li>Open your email inbox</li>
                      <li>Find the email from <span className="font-medium text-foreground">TenderETH System</span></li>
                      <li>Click the <span className="font-medium text-foreground">&quot;Reset Password&quot;</span> button</li>
                      <li>Set your new password</li>
                    </ol>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                setSubmittedEmail("");
              }}
            >
              Try a different email
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </CardFooter>
        </div>
      )}
    </Card>
  );
}
