"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, isToday, format } from "date-fns";
import {
  Bell, FileText, Award, Users, Shield, MessageSquare, CheckCheck,
  Loader2, Trash2, Inbox,
} from "lucide-react";
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
  return <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
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

function formatTime(date: string) {
  const d = new Date(date);
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, "MMM d, yyyy");
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["all-notifications", page],
    queryFn: async () =>
      (await api.get(`/notifications?page=${page}&limit=20`)).data.data as {
        notifications: Notification[];
        total: number;
        page: number;
        totalPages: number;
        unreadCount: number;
      },
  });

  const markReadMut = useMutation({
    mutationFn: async (id: number) => { await api.patch(`/notifications/${id}/read`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-unread-count"] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: async () => { await api.patch("/notifications/read-all"); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-unread-count"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/notifications/${id}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-unread-count"] });
    },
  });

  const handleClick = (n: Notification) => {
    if (!n.isRead) markReadMut.mutate(n.id);
    const link = getNotifLink(n, user?.role || "");
    if (link) router.push(link);
  };

  const notifications = data?.notifications ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {(data?.unreadCount ?? 0) > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{data!.unreadCount} unread</p>
          )}
        </div>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllMut.mutate()} disabled={markAllMut.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" />Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`group flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                !n.isRead ? "bg-blue-50/60 border-blue-100" : "bg-white"
              }`}
              onClick={() => handleClick(n)}
            >
              {!n.isRead && <div className="h-2.5 w-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
              {n.isRead && <div className="h-2.5 w-2.5 flex-shrink-0" />}
              {getNotifIcon(n.notificationType)}
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-snug ${!n.isRead ? "font-medium" : ""}`}>{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTime(n.sentDate)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); deleteMut.mutate(n.id); }}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {data.page} of {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
