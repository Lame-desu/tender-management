"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "./api";
import { User, Role } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  bidderType: "ORGANIZATION" | "INDIVIDUAL";
  organizationName?: string;
  tinNumber: string;
  tradeLicenseNumber?: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getRoleDashboard(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return "/admin/users";
    case Role.PROCUREMENT_OFFICER:
      return "/officer/dashboard";
    case Role.EVALUATOR:
      return "/evaluator/dashboard";
    case Role.BIDDER:
      return "/bidder/dashboard";
    default:
      return "/login";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated on mount
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post("/auth/login", { email, password });
      const loggedInUser = res.data.data.user;
      setUser(loggedInUser);
      toast.success("Login successful");
      router.push(getRoleDashboard(loggedInUser.role));
    },
    [router]
  );

  const register = useCallback(async (data: RegisterData) => {
    await api.post("/auth/register", data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    }
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { getRoleDashboard };
