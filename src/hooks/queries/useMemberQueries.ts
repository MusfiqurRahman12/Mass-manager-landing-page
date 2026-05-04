import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memberService, type AddMemberPayload, type CreateAndAddMemberPayload } from "../../services/memberService";
import { queryKeys } from "../../lib/queryKeys";
import { toast } from "sonner";

export function useMembers(includeInactive = false) {
  return useQuery({
    queryKey: queryKeys.members.list(includeInactive),
    queryFn: () => memberService.getMembers(includeInactive),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberPayload) => memberService.addMember(payload),
    onSuccess: () => {
      toast.success("Member added successfully");
      qc.invalidateQueries({ queryKey: queryKeys.members.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add member"),
  });
}

export function useCreateAndAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAndAddMemberPayload) => memberService.createAndAddMember(payload),
    onSuccess: () => {
      toast.success("Member created and added successfully");
      qc.invalidateQueries({ queryKey: queryKeys.members.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create member"),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => memberService.removeMember(userId),
    onSuccess: () => {
      toast.success("Member removed successfully");
      qc.invalidateQueries({ queryKey: queryKeys.members.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to remove member"),
  });
}

export function useUpdateMemberStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: string; is_active: boolean }) =>
      memberService.updateStatus(userId, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update member status"),
  });
}
