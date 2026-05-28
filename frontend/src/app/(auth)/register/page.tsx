"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Building2,
  UserRound,
  Loader2,
  Mail,
  Landmark,
  Shield,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Hash,
  Lock,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

/* ─── Shared left branding panel ──────────────────────────────────── */
function BrandingPanel({
  title,
  subtitle,
  highlights,
}: {
  title: React.ReactNode;
  subtitle: string;
  highlights: { icon: React.ElementType; label: string }[];
}) {
  return (
    <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating orbs */}
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
              {title}
            </h1>
            <p className="mt-5 text-lg text-blue-200/80 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((feature) => (
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

        {/* Bottom */}
        <div className="flex items-center gap-6 text-sm text-blue-300/70">
          <span>Ethiopia&apos;s Digital Procurement</span>
          <span className="h-1 w-1 rounded-full bg-blue-400/40" />
          <span>Trusted & Transparent</span>
          <span className="h-1 w-1 rounded-full bg-blue-400/40" />
          <span>24/7 Access</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Styled input wrapper ────────────────────────────────────────── */
function FormField({
  label,
  error,
  icon: Icon,
  children,
  required,
}: {
  label: string;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="h-4 w-4" />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

const inputClasses =
  "h-11 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400";
const inputWithIconClasses = `${inputClasses} pl-10`;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [step, setStep] = useState<"type" | "form" | "success">("type");
  const [bidderType, setBidderType] = useState<
    "ORGANIZATION" | "INDIVIDUAL" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const isOrg = bidderType === "ORGANIZATION";

  /* ═══════════════════════════════════════════════════════════════════
     STEP 1 — Choose bidder type
     ═══════════════════════════════════════════════════════════════════ */
  if (step === "type") {
    return (
      <div className="fixed inset-0 flex min-h-screen">
        <BrandingPanel
          title={
            <>
              Join{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                thousands
              </span>{" "}
              of trusted bidders
            </>
          }
          subtitle="Register to discover open tenders, submit competitive bids, and grow your business through Ethiopia's premier digital procurement platform."
          highlights={[
            { icon: FileText, label: "Browse Tenders" },
            { icon: Users, label: "Submit Proposals" },
            { icon: BarChart3, label: "Track Results" },
            { icon: Shield, label: "Secure & Audited" },
          ]}
        />

        {/* Right panel */}
        <div className="w-full lg:w-[52%] flex items-center justify-center bg-gray-50 relative overflow-y-auto">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative w-full max-w-[480px] px-6 sm:px-8 py-12">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                TenderETH
              </span>
            </div>

            {/* Header */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Choose how you&apos;d like to participate in the procurement
                process
              </p>
            </div>

            {/* Type cards */}
            <div className="space-y-4">
              <button
                onClick={() => selectType("ORGANIZATION")}
                className="group w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    Organization
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                    Company, PLC, Partnership, or Sole Proprietorship looking to
                    participate in tenders
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["TIN Required", "Trade License", "Contact Person"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center text-xs font-medium bg-blue-50 text-blue-600 rounded-md px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
              </button>

              <button
                onClick={() => selectType("INDIVIDUAL")}
                className="group w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300 text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200/50 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <UserRound className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                    Individual
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                    Independent consultant or professional offering expertise
                    and services
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["National ID / TIN", "Expertise Area", "Contact Info"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center text-xs font-medium bg-violet-50 text-violet-600 rounded-md px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
              </button>
            </div>

            {/* Footer */}
            <div className="mt-10 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gray-50 px-3 text-gray-400">
                    Already registered?
                  </span>
                </div>
              </div>
              <Link href="/login" className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-200"
                >
                  Sign in to your account
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
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     STEP 3 — Success
     ═══════════════════════════════════════════════════════════════════ */
  if (step === "success") {
    return (
      <div className="fixed inset-0 flex min-h-screen">
        <BrandingPanel
          title={
            <>
              You&apos;re{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                almost there
              </span>
            </>
          }
          subtitle="Your registration has been submitted. Once verified, you'll have full access to browse tenders and submit bids."
          highlights={[
            { icon: FileText, label: "Browse Tenders" },
            { icon: Users, label: "Submit Proposals" },
            { icon: BarChart3, label: "Track Results" },
            { icon: Shield, label: "Secure & Audited" },
          ]}
        />

        {/* Right panel */}
        <div className="w-full lg:w-[52%] flex items-center justify-center bg-gray-50 relative overflow-y-auto">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative w-full max-w-[440px] px-6 sm:px-8 py-12 text-center">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-200/50">
                  <Mail className="h-9 w-9 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Check your email!
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              We&apos;ve sent a verification link to your email address. Please
              click the link to verify your email. After verification, an
              administrator will review and activate your account.
            </p>

            {/* Steps */}
            <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
              {[
                {
                  step: "1",
                  label: "Verify your email",
                  desc: "Click the link we sent",
                  done: false,
                },
                {
                  step: "2",
                  label: "Admin review",
                  desc: "Your account will be verified",
                  done: false,
                },
                {
                  step: "3",
                  label: "Start bidding",
                  desc: "Access the full platform",
                  done: false,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/login" className="block mt-8">
              <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-sm font-semibold transition-all duration-200">
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Sign In
              </Button>
            </Link>
            <Link
              href="/"
              className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium mt-4"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     STEP 2 — Registration form
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 flex min-h-screen">
      <BrandingPanel
        title={
          isOrg ? (
            <>
              Register your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                organization
              </span>
            </>
          ) : (
            <>
              Register as an{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                individual
              </span>
            </>
          )
        }
        subtitle={
          isOrg
            ? "Set up your organization's account to start discovering tenders and submitting competitive bids."
            : "Create your professional profile to offer your expertise and participate in consulting opportunities."
        }
        highlights={[
          { icon: FileText, label: "Browse Tenders" },
          { icon: Users, label: "Submit Proposals" },
          { icon: BarChart3, label: "Track Results" },
          { icon: Shield, label: "Secure & Audited" },
        ]}
      />

      {/* Right panel */}
      <div className="w-full lg:w-[52%] flex bg-gray-50 relative overflow-y-auto">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative w-full max-w-[520px] mx-auto px-6 sm:px-8 py-8 lg:py-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              TenderETH
            </span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => setStep("type")}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Change account type
            </button>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isOrg
                ? "Organization Registration"
                : "Individual Registration"}
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Fill in your details below. Fields marked with{" "}
              <span className="text-red-400">*</span> are required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ─── Section 1: Business / Personal Info ─── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-6 w-6 rounded-md bg-gradient-to-br ${
                    isOrg
                      ? "from-blue-500 to-indigo-600"
                      : "from-violet-500 to-purple-600"
                  } flex items-center justify-center`}
                >
                  {isOrg ? (
                    <Building2 className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {isOrg ? "Organization Information" : "Personal Information"}
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm">
                {isOrg && (
                  <FormField
                    label="Organization Name"
                    error={errors.organizationName?.message}
                    icon={Building2}
                    required
                  >
                    <Input
                      id="organizationName"
                      placeholder="e.g. Ethio Construction PLC"
                      className={inputWithIconClasses}
                      {...register("organizationName")}
                    />
                  </FormField>
                )}

                <FormField
                  label={isOrg ? "Account Display Name" : "Full Name"}
                  error={errors.fullName?.message}
                  icon={User}
                  required
                >
                  <Input
                    id="fullName"
                    placeholder={
                      isOrg
                        ? "Name displayed on the platform"
                        : "e.g. Abebe Kebede"
                    }
                    className={inputWithIconClasses}
                    {...register("fullName")}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label={isOrg ? "TIN Number" : "National ID / TIN"}
                    error={errors.tinNumber?.message}
                    icon={Hash}
                    required
                  >
                    <Input
                      id="tinNumber"
                      placeholder={isOrg ? "0000000000" : "ID or TIN number"}
                      className={inputWithIconClasses}
                      {...register("tinNumber")}
                    />
                  </FormField>
                  {isOrg && (
                    <FormField
                      label="Trade License Number"
                      icon={Briefcase}
                    >
                      <Input
                        id="tradeLicenseNumber"
                        placeholder="Optional"
                        className={inputWithIconClasses}
                        {...register("tradeLicenseNumber")}
                      />
                    </FormField>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Section 2: Contact Info ─── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Contact Information
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label={
                      isOrg ? "Contact Person" : "Profession / Expertise"
                    }
                    error={errors.contactPerson?.message}
                    icon={User}
                    required
                  >
                    <Input
                      id="contactPerson"
                      placeholder={
                        isOrg ? "e.g. Tigist Haile" : "e.g. Civil Engineer"
                      }
                      className={inputWithIconClasses}
                      {...register("contactPerson")}
                    />
                  </FormField>
                  <FormField
                    label="Phone Number"
                    error={errors.phoneNumber?.message}
                    icon={Phone}
                    required
                  >
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      className={inputWithIconClasses}
                      {...register("phoneNumber")}
                    />
                  </FormField>
                </div>
                <FormField
                  label="Address"
                  error={errors.address?.message}
                  icon={MapPin}
                  required
                >
                  <Input
                    id="address"
                    placeholder="City, Sub-city, Woreda"
                    className={inputWithIconClasses}
                    {...register("address")}
                  />
                </FormField>
              </div>
            </div>

            {/* ─── Section 3: Account Credentials ─── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Account Credentials
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm">
                <FormField
                  label="Email Address"
                  error={errors.email?.message}
                  icon={Mail}
                  required
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={inputWithIconClasses}
                    {...register("email")}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Password"
                    error={errors.password?.message}
                    icon={Lock}
                    required
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className={`${inputWithIconClasses} pr-10`}
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
                  </FormField>
                  <FormField
                    label="Confirm Password"
                    error={errors.confirmPassword?.message}
                    icon={Lock}
                    required
                  >
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      className={`${inputWithIconClasses} pr-10`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </FormField>
                </div>
                <p className="text-xs text-gray-400">
                  Must be 8+ characters with at least one uppercase letter and
                  one number.
                </p>
              </div>
            </div>

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
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
