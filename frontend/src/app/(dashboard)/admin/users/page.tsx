"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, Search, MoreHorizontal, Eye, UserCheck, UserX, Shield, Loader2, Trash2,
} from "lucide-react";
import api from "@/lib/api";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  PROCUREMENT_OFFICER: "bg-blue-100 text-blue-700 border-blue-200",
  EVALUATOR: "bg-cyan-100 text-cyan-700 border-cyan-200",
  BIDDER: "bg-gray-100 text-gray-700 border-gray-200",
};
const roleLabel: Record<string, string> = {
  ADMIN: "Admin", PROCUREMENT_OFFICER: "Procurement Officer", EVALUATOR: "Evaluator", BIDDER: "Bidder",
};
const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-red-100 text-red-700 border-red-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
};

type ApiErr = { response?: { data?: { message?: string } } };

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ user: User; action: "ACTIVE" | "INACTIVE" } | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) p.set("search", search);
      if (roleFilter !== "ALL") p.set("role", roleFilter);
      if (statusFilter !== "ALL") p.set("status", statusFilter);
      return (await api.get(`/users?${p}`)).data.data as { users: User[]; total: number; page: number; totalPages: number };
    },
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { await api.patch(`/users/${id}/status`, { status }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success(confirmAction?.action === "ACTIVE" ? "User activated" : "User deactivated"); setConfirmAction(null); },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  const roleMut = useMutation({
    mutationFn: async (p: { id: number; role: string; department?: string; position?: string; organizationName?: string }) => { const { id, ...body } = p; await api.patch(`/users/${id}/role`, body); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Role updated"); setRoleChangeUser(null); },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/users/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User deleted"); setDeleteUser(null); },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed to delete user"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create User</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="PROCUREMENT_OFFICER">Procurement Officer</SelectItem>
            <SelectItem value="EVALUATOR">Evaluator</SelectItem>
            <SelectItem value="BIDDER">Bidder</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Name</TableHead>
              <TableHead className="w-[25%]">Email</TableHead>
              <TableHead className="w-[18%]">Role</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[15%]">Registered</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : !data?.users.length ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No users found.</TableCell></TableRow>
            ) : data.users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge variant="outline" className={roleBadge[u.role]}>{roleLabel[u.role]}</Badge></TableCell>
                <TableCell><Badge variant="outline" className={statusBadge[u.status]}>{u.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDetailUser(u)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                      {u.status !== "ACTIVE" && <DropdownMenuItem onClick={() => setConfirmAction({ user: u, action: "ACTIVE" })}><UserCheck className="mr-2 h-4 w-4" />Activate</DropdownMenuItem>}
                      {u.status === "ACTIVE" && <DropdownMenuItem onClick={() => setConfirmAction({ user: u, action: "INACTIVE" })}><UserX className="mr-2 h-4 w-4" />Deactivate</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => setRoleChangeUser(u)}><Shield className="mr-2 h-4 w-4" />Change Role</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteUser(u)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {data.page} of {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Dialogs */}
      {detailUser && <ViewDetailsDialog user={detailUser} onClose={() => setDetailUser(null)} />}
      {confirmAction && <ConfirmStatusDialog data={confirmAction} onClose={() => setConfirmAction(null)} onConfirm={() => statusMut.mutate({ id: confirmAction.user.id, status: confirmAction.action })} isLoading={statusMut.isPending} />}
      {roleChangeUser && <ChangeRoleDialog user={roleChangeUser} onClose={() => setRoleChangeUser(null)} onConfirm={(p) => roleMut.mutate(p)} isLoading={roleMut.isPending} />}
      {deleteUser && <ConfirmDeleteDialog user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={() => deleteMut.mutate(deleteUser.id)} isLoading={deleteMut.isPending} />}
      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ["users"] }); setCreateOpen(false); }} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="text-right max-w-[220px] truncate">{value}</span></div>;
}

function ViewDetailsDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const bp = user.bidderProfile;
  const op = user.officerProfile;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{user.fullName}</DialogTitle><DialogDescription>{user.email}</DialogDescription></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant="outline" className={roleBadge[user.role]}>{roleLabel[user.role]}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className={statusBadge[user.status]}>{user.status}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Registered</span><span>{format(new Date(user.createdAt), "MMM d, yyyy HH:mm")}</span></div>
          {bp && (<><hr /><h4 className="font-semibold">Bidder Profile</h4><DetailRow label="Type" value={bp.bidderType} />{bp.organizationName && <DetailRow label="Organization" value={bp.organizationName} />}<DetailRow label="TIN Number" value={bp.tinNumber} />{bp.tradeLicenseNumber && <DetailRow label="Trade License" value={bp.tradeLicenseNumber} />}<DetailRow label="Contact Person" value={bp.contactPerson} /><DetailRow label="Phone" value={bp.phoneNumber} /><DetailRow label="Address" value={bp.address} /></>)}
          {op && (<><hr /><h4 className="font-semibold">Officer Profile</h4><DetailRow label="Department" value={op.department} /><DetailRow label="Position" value={op.position} /><DetailRow label="Organization" value={op.organizationName} /></>)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmStatusDialog({ data, onClose, onConfirm, isLoading }: { data: { user: User; action: "ACTIVE" | "INACTIVE" }; onClose: () => void; onConfirm: () => void; isLoading: boolean }) {
  const isActivate = data.action === "ACTIVE";
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isActivate ? "Activate" : "Deactivate"} User</DialogTitle>
          <DialogDescription>Are you sure you want to {isActivate ? "activate" : "deactivate"} <strong>{data.user.fullName}</strong>?</DialogDescription>
        </DialogHeader>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={isActivate ? "default" : "destructive"} onClick={onConfirm} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isActivate ? "Activate" : "Deactivate"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangeRoleDialog({ user, onClose, onConfirm, isLoading }: { user: User; onClose: () => void; onConfirm: (p: { id: number; role: string; department?: string; position?: string; organizationName?: string }) => void; isLoading: boolean }) {
  const [newRole, setNewRole] = useState("");
  const [dept, setDept] = useState("");
  const [pos, setPos] = useState("");
  const [org, setOrg] = useState("");
  const needsOfficer = newRole === "PROCUREMENT_OFFICER" && !user.officerProfile;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Change Role</DialogTitle><DialogDescription>Change role for {user.fullName}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="PROCUREMENT_OFFICER">Procurement Officer</SelectItem><SelectItem value="EVALUATOR">Evaluator</SelectItem><SelectItem value="BIDDER">Bidder</SelectItem></SelectContent></Select></div>
          {needsOfficer && (<><div className="space-y-2"><Label>Department *</Label><Input value={dept} onChange={(e) => setDept(e.target.value)} /></div><div className="space-y-2"><Label>Position *</Label><Input value={pos} onChange={(e) => setPos(e.target.value)} /></div><div className="space-y-2"><Label>Organization</Label><Input value={org} onChange={(e) => setOrg(e.target.value)} /></div></>)}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm({ id: user.id, role: newRole, ...(needsOfficer && { department: dept, position: pos, organizationName: org }) })} disabled={isLoading || !newRole || (needsOfficer && (!dept || !pos))}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [sub, setSub] = useState(false);
  const [f, setF] = useState({ fullName: "", email: "", password: "", role: "", department: "", position: "", organizationName: "" });
  const isOfficer = f.role === "PROCUREMENT_OFFICER";
  const canSubmit = f.fullName && f.email && f.password && f.role && (!isOfficer || (f.department && f.position));
  const submit = async () => {
    setSub(true);
    try { await api.post("/users", f); toast.success("User created"); setF({ fullName: "", email: "", password: "", role: "", department: "", position: "", organizationName: "" }); onCreated(); }
    catch (e: unknown) { toast.error((e as ApiErr).response?.data?.message || "Failed"); }
    finally { setSub(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent><DialogHeader><DialogTitle>Create Internal User</DialogTitle><DialogDescription>Create a new admin, officer, or evaluator account.</DialogDescription></DialogHeader>
        <form autoComplete="off" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Hidden decoy fields to absorb browser autofill */}
          <input type="text" name="fake_user" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} />
          <input type="password" name="fake_pass" autoComplete="current-password" style={{ display: 'none' }} tabIndex={-1} />
          <div className="space-y-2"><Label>Full Name *</Label><Input value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} autoComplete="nope" /></div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="nope" /></div>
          <div className="space-y-2"><Label>Password *</Label><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="one-time-code" /></div>
          <div className="space-y-2"><Label>Role *</Label><Select value={f.role} onValueChange={(v) => setF({ ...f, role: v })}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="PROCUREMENT_OFFICER">Procurement Officer</SelectItem><SelectItem value="EVALUATOR">Evaluator</SelectItem></SelectContent></Select></div>
          {isOfficer && (<><div className="space-y-2"><Label>Department *</Label><Input value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} /></div><div className="space-y-2"><Label>Position *</Label><Input value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} /></div><div className="space-y-2"><Label>Organization</Label><Input value={f.organizationName} onChange={(e) => setF({ ...f, organizationName: e.target.value })} /></div></>)}
        </form>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={sub || !canSubmit}>{sub && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create User</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDeleteDialog({ user, onClose, onConfirm, isLoading }: { user: User; onClose: () => void; onConfirm: () => void; isLoading: boolean }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete User</DialogTitle>
          <DialogDescription>Are you sure you want to permanently delete <strong>{user.fullName}</strong>? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
