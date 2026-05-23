"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, UserRound, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Required"),
    bidderType: z.enum(["ORGANIZATION", "INDIVIDUAL"]),
    organizationName: z.string().optional(),
    tinNumber: z.string().min(1, "Required"),
    tradeLicenseNumber: z.string().optional(),
    contactPerson: z.string().min(1, "Required"),
    phoneNumber: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.bidderType === "ORGANIZATION") return !!data.organizationName;
      return true;
    },
    { message: "Organization name is required", path: ["organizationName"] }
  );

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [step, setStep] = useState<"type" | "form" | "success">("type");
  const [bidderType, setBidderType] = useState<"ORGANIZATION" | "INDIVIDUAL" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { bidderType: "ORGANIZATION" },
  });

  const selectType = (type: "ORGANIZATION" | "INDIVIDUAL") => {
    setBidderType(type);
    setValue("bidderType", type);
    setStep("form");
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      setStep("success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Choose type
  if (step === "type") {
    return (
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bidder Registration</CardTitle>
          <CardDescription>Select your account type to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <button
            onClick={() => selectType("ORGANIZATION")}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Building2 className="h-10 w-10 text-primary" />
            <span className="font-semibold">Organization</span>
            <span className="text-xs text-muted-foreground text-center">
              Company, PLC, Partnership, Sole Proprietorship
            </span>
          </button>
          <button
            onClick={() => selectType("INDIVIDUAL")}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <UserRound className="h-10 w-10 text-primary" />
            <span className="font-semibold">Individual</span>
            <span className="text-xs text-muted-foreground text-center">
              Independent Consultant or Professional
            </span>
          </button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Step 3: Success
  if (step === "success") {
    return (
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <Mail className="h-16 w-16 text-primary mx-auto" />
          <h2 className="text-xl font-semibold">Check Your Email!</h2>
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to your email address. Please click
            the link to verify your email. After verification, an administrator
            will review and activate your account.
          </p>
          <Link href="/login">
            <Button className="mt-4">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Registration form
  const isOrg = bidderType === "ORGANIZATION";

  return (
    <Card className="w-full max-w-2xl mx-4 my-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep("type")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back
          </button>
        </div>
        <CardTitle className="text-2xl">
          {isOrg ? "Organization Registration" : "Individual Consultant Registration"}
        </CardTitle>
        <CardDescription>
          Fill in the details below. Fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Business Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {isOrg ? "Organization Information" : "Personal Information"}
            </h3>

            {isOrg && (
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input id="organizationName" {...register("organizationName")} />
                {errors.organizationName && (
                  <p className="text-sm text-destructive">{errors.organizationName.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">
                {isOrg ? "Organization Name (for account)" : "Full Name"} *
              </Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tinNumber">{isOrg ? "TIN Number" : "National ID / TIN"} *</Label>
                <Input id="tinNumber" {...register("tinNumber")} />
                {errors.tinNumber && (
                  <p className="text-sm text-destructive">{errors.tinNumber.message}</p>
                )}
              </div>
              {isOrg && (
                <div className="space-y-2">
                  <Label htmlFor="tradeLicenseNumber">Trade License Number</Label>
                  <Input id="tradeLicenseNumber" {...register("tradeLicenseNumber")} />
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">
                  {isOrg ? "Contact Person" : "Profession / Expertise"} *
                </Label>
                <Input id="contactPerson" {...register("contactPerson")} />
                {errors.contactPerson && (
                  <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input id="phoneNumber" type="tel" {...register("phoneNumber")} />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Account Credentials
            </h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Registration
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
