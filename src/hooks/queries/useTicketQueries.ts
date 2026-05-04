import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService, type TicketCreate } from "../../services";
import { toast } from "sonner";
import { queryKeys } from "../../lib/queryKeys";

export function useTickets() {
  return useQuery({
    queryKey: queryKeys.tickets.all,
    queryFn: () => ticketService.getTickets(),
  });
}

export function useTicketDetail(ticketId: string | null) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId!),
    queryFn: () => ticketService.getTicketDetail(ticketId!),
    enabled: !!ticketId,
  });
}

export function useAddTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TicketCreate) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      toast.success("Ticket submitted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit ticket");
    },
  });
}

export function useAddTicketReply(ticketId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: string) => ticketService.addReply(ticketId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      toast.success("Reply added");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add reply");
    },
  });
}
