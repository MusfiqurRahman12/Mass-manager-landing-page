import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../lib/queryKeys";
import {
  adminStatsService,
  adminMessService,
  adminManagerService,
  adminUserService,
  adminTicketService,
  adminPackageService,
  adminAnnouncementService,
  adminAuditService,
  type PackageInput,
} from "../../services/adminService";

// ── Stats & Activity ───────────────────────────────────────────────────────

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.stats.overview(),
    queryFn: adminStatsService.getOverview,
  });
}

export function useAdminActivity(limit = 20) {
  return useQuery({
    queryKey: queryKeys.admin.stats.activity(limit),
    queryFn: () => adminStatsService.getActivity(limit),
  });
}

// ── Messes ─────────────────────────────────────────────────────────────────

export function useAdminMesses(params?: Parameters<typeof adminMessService.list>[0]) {
  return useQuery({
    queryKey: queryKeys.admin.messes.list(params),
    queryFn: () => adminMessService.list(params),
  });
}

export function useAdminMessDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.messes.detail(id),
    queryFn: () => adminMessService.get(id),
    enabled: !!id,
  });
}

export function useSuspendMess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminMessService.suspend(id),
    onSuccess: (_, id) => {
      toast.success("Mess suspended successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.messes.all });
      qc.invalidateQueries({ queryKey: queryKeys.admin.messes.detail(id) });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to suspend mess"),
  });
}

export function useActivateMess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminMessService.activate(id),
    onSuccess: (_, id) => {
      toast.success("Mess activated successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.messes.all });
      qc.invalidateQueries({ queryKey: queryKeys.admin.messes.detail(id) });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to activate mess"),
  });
}

export function useDeleteAdminMess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminMessService.delete(id),
    onSuccess: () => {
      toast.success("Mess deleted successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.messes.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete mess"),
  });
}

// ── Managers ───────────────────────────────────────────────────────────────

export function useAdminManagers(params?: Parameters<typeof adminManagerService.list>[0]) {
  return useQuery({
    queryKey: queryKeys.admin.managers.list(params),
    queryFn: () => adminManagerService.list(params),
  });
}

export function useAdminManagerDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.managers.detail(id),
    queryFn: () => adminManagerService.get(id),
    enabled: !!id,
  });
}

// ── Users ──────────────────────────────────────────────────────────────────

export function useAdminUsers(params?: Parameters<typeof adminUserService.list>[0]) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: () => adminUserService.list(params),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUserService.delete(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.users.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete user"),
  });
}

// ── Tickets ────────────────────────────────────────────────────────────────

export function useAdminTickets(params?: Parameters<typeof adminTicketService.list>[0]) {
  return useQuery({
    queryKey: queryKeys.admin.tickets.list(params),
    queryFn: () => adminTicketService.list(params),
  });
}

export function useAdminTicketDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.tickets.detail(id),
    queryFn: () => adminTicketService.get(id),
    enabled: !!id,
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => adminTicketService.reply(id, body),
    onSuccess: (_, { id }) => {
      toast.success("Reply sent successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.tickets.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.admin.tickets.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send reply"),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminTicketService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      toast.success("Ticket status updated");
      qc.invalidateQueries({ queryKey: queryKeys.admin.tickets.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.admin.tickets.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update ticket status"),
  });
}

// ── Packages ───────────────────────────────────────────────────────────────

export function useAdminPackages() {
  return useQuery({
    queryKey: queryKeys.admin.packages.list(),
    queryFn: adminPackageService.list,
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PackageInput) => adminPackageService.create(data),
    onSuccess: () => {
      toast.success("Package created successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.packages.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create package"),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PackageInput }) => adminPackageService.update(id, data),
    onSuccess: () => {
      toast.success("Package updated successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.packages.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update package"),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminPackageService.delete(id),
    onSuccess: () => {
      toast.success("Package deleted successfully");
      qc.invalidateQueries({ queryKey: queryKeys.admin.packages.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete package"),
  });
}

// ── Announcements ──────────────────────────────────────────────────────────

export function useBroadcastAnnouncement() {
  return useMutation({
    mutationFn: ({ title, body }: { title: string; body: string }) => adminAnnouncementService.broadcast(title, body),
    onSuccess: () => {
      toast.success("Announcement broadcasted successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to broadcast announcement"),
  });
}

// ── Audit Log ──────────────────────────────────────────────────────────────

export function useAdminAudit(params?: Parameters<typeof adminAuditService.list>[0]) {
  return useQuery({
    queryKey: queryKeys.admin.audit.list(params),
    queryFn: () => adminAuditService.list(params),
  });
}
