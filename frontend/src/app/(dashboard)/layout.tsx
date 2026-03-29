"use client";

import { useAuth, getRoleDashboard } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Clock } from "lucide-react";
import { Role } from "@/types";

// Map role → allowed route prefixes
const roleRoutes: Record<Role, string[]> = {
  [Role.ADMIN]: ["/admin", "/notifications"],
  [Role.PROCUREMENT_OFFICER]: ["/officer", "/notifications"],
  [Role.EVALUATOR]: ["/evaluator", "/notifications"],
  [Role.BIDDER]: ["/bidder", "/notifications"],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in → login
    if (!user) {
      router.push("/login");
      return;
    }

    // Active user on wrong role route → redirect to their own dashboard
    if (user.status === "ACTIVE") {
      const allowed = roleRoutes[user.role] || [];
      const isAllowed = allowed.some((prefix) => pathname.startsWith(prefix));
      if (!isAllowed) {
        router.replace(getRoleDashboard(user.role));
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Pending / inactive state
  if (user.status !== "ACTIVE") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4 max-w-md mx-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold">Account Pending Verification</h2>
          <p className="text-muted-foreground">
            Your account is awaiting admin approval. You&apos;ll be notified once
            it&apos;s activated.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-primary hover:underline text-sm"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // Check if on wrong route — show nothing while redirecting
  const allowed = roleRoutes[user.role] || [];
  const isAllowed = allowed.some((prefix) => pathname.startsWith(prefix));
  if (!isAllowed) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
