"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, FileText, Award, Users, Shield, MessageSquare, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Notification } from "@/types";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, React.ElementType> = {
  TENDER_PUBLISHED: FileText,
  ADDENDUM_ISSUED: FileText,
  CLARIFICATION_ASKED: MessageSquare,
  CLARIFICATION_ANSWERED: MessageSquare,
  BID_SUBMITTED: FileText,
  BIDS_OPENED: FileText,
  COMMITTEE_ASSIGNED: Users,
  TECH_EVAL_FINALIZED: Award,
  BID_SELECTED: Award,
  BID_NOT_SELECTED: Shield,
  DEBRIEFING_REQUESTED: MessageSquare,
  DEBRIEFING_RESPONDED: MessageSquare,
  ACCOUNT_STATUS: Users,
};

function getNotifIcon(type: string) {
  const Icon = typeIcons[type] || Bell;
  return <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
}

function getNotifLink(n: Notification, userRole: string): string | null {
  if (!n.entityType || !n.entityId) return null;
  if (n.entityType === "Tender") {
    if (userRole === "PROCUREMENT_OFFICER") return `/officer/tenders/${n.entityId}`;
    if (userRole === "EVALUATOR") return `/evaluator/tenders/${n.entityId}/evaluate`;
    return `/bidder/tenders/${n.entityId}`;
  }
  if (n.entityType === "Bid") return "/bidder/my-bids";
  if (n.entityType === "DebriefingRequest") {
    if (userRole === "PROCUREMENT_OFFICER") return "/officer/debriefings";
    return "/bidder/my-bids";
  }
  return null;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery({
    queryKey: ["notif-unread-count"],
    queryFn: async () => (await api.get("/notifications/unread-count")).data.data as { count: number },
    refetchInterval: 30000,
    enabled: !!user,
  });

  const { data: recentData } = useQuery({
    queryKey: ["notif-recent"],
    queryFn: async () => (await api.get("/notifications?limit=5")).data.data as {
      notifications: Notification[];
    },
    enabled: open && !!user,
  });

  const markReadMut = useMutation({
    mutationFn: async (id: number) => { await api.patch(`/notifications/${id}/read`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notif-unread-count"] });
      qc.invalidateQueries({ queryKey: ["notif-recent"] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: async () => { await api.patch("/notifications/read-all"); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notif-unread-count"] });
      qc.invalidateQueries({ queryKey: ["notif-recent"] });
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = countData?.count ?? 0;
  const notifications = recentData?.notifications ?? [];

  const handleClick = (n: Notification) => {
    if (!n.isRead) markReadMut.mutate(n.id);
    const link = getNotifLink(n, user?.role || "");
    if (link) router.push(link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <button
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={() => markAllMut.mutate()}
              >
                <CheckCheck className="h-3 w-3" />Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-blue-50/50" : ""}`}
                  onClick={() => handleClick(n)}
                >
                  {!n.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                  {n.isRead && <div className="h-2 w-2 flex-shrink-0" />}
                  {getNotifIcon(n.notificationType)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(n.sentDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t">
            <button
              className="text-xs text-primary hover:underline w-full text-center"
              onClick={() => { router.push("/notifications"); setOpen(false); }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
