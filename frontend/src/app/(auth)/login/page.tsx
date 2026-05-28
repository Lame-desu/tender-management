"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Landmark, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const ROLE_OPTIONS = [
  { value: "BIDDER", label: "Bidder" },
  { value: "PROCUREMENT_OFFICER", label: "Procurement Manager" },
  { value: "EVALUATOR", label: "Evaluator" },
] as const;

export default function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    setLoginError("");
    try {
      // Pass selectedRole if one was chosen, otherwise undefined (admin case)
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
      toast.error(error.response?.data?.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <Landmark className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl">TenderETH</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admin users can leave this unselected
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register as a bidder
            </Link>
          </p>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground text-center">
            &larr; Back to home
          </Link>
        </CardFooter>
      </form>
      {loginError.toLowerCase().includes("verify your email") && (
        <div className="px-6 pb-6">
          <div className="rounded-lg border border-muted bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Didn&apos;t receive the verification email?</span>
            </div>
            <form onSubmit={handleResendVerification} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="text-sm h-8"
                required
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={isResending}
                className="shrink-0"
              >
                {isResending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                Resend
              </Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
