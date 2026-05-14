import apiClient from "./apiClient";

export interface TicketReply {
  id: string;
  author_name: string;
  body: string;
  is_admin_reply: boolean;
  created_at: string;
}

export interface TicketOut {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  reply_count: number;
}

export interface TicketDetail extends TicketOut {
  replies: TicketReply[];
}

export interface TicketCreate {
  title: string;
  body: string;
  category: string;
  priority: string;
}

export const ticketService = {
  getTickets: async (): Promise<TicketOut[]> => {
    const res = await apiClient.get("/tickets");
    return res.data;
  },
  
  getTicketDetail: async (id: string): Promise<TicketDetail> => {
    const res = await apiClient.get(`/tickets/${id}`);
    return res.data;
  },

  createTicket: async (data: TicketCreate): Promise<TicketOut> => {
    const res = await apiClient.post("/tickets", data);
    return res.data;
  },

  addReply: async (ticketId: string, body: string): Promise<TicketReply> => {
    const res = await apiClient.post(`/tickets/${ticketId}/replies`, { body });
    return res.data;
  },
};
