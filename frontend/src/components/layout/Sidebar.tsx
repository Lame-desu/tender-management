"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@/types";
import {
  LayoutDashboard,
  FileText,
  Users,
  ScrollText,
  Activity,
  ClipboardCheck,
  BarChart3,
  MessageSquareText,
  Search,
  FolderOpen,
  Bell,
  Landmark,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
    { label: "Monitoring", href: "/admin/monitoring", icon: Activity },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  [Role.PROCUREMENT_OFFICER]: [
    { label: "Dashboard", href: "/officer/dashboard", icon: LayoutDashboard },
    { label: "Tenders", href: "/officer/tenders", icon: FileText },
    { label: "Reports", href: "/officer/reports", icon: BarChart3 },
    { label: "Debriefings", href: "/officer/debriefings", icon: MessageSquareText },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  [Role.EVALUATOR]: [
    { label: "Dashboard", href: "/evaluator/dashboard", icon: LayoutDashboard },
    { label: "My Evaluations", href: "/evaluator/evaluations", icon: ClipboardCheck },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  [Role.BIDDER]: [
    { label: "Dashboard", href: "/bidder/dashboard", icon: LayoutDashboard },
    { label: "Browse Tenders", href: "/bidder/tenders", icon: Search },
    { label: "My Bids", href: "/bidder/my-bids", icon: FolderOpen },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
};

function SidebarContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = navByRole[role] || [];

  return (
    <div className="flex flex-col flex-grow bg-white overflow-y-auto">
      <div className="flex items-center gap-2 h-16 px-4 border-b flex-shrink-0">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <Landmark className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-sm">TenderETH</span>
          <span className="text-[9px] text-muted-foreground block -mt-0.5 leading-none">Procurement System</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r">
        <SidebarContent role={role} />
      </aside>

      {/* Mobile trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 z-50 md:hidden">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-2 z-10"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <SidebarContent role={role} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
