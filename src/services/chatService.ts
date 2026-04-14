import apiClient from "./apiClient";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  reactions?: Record<string, string[]>;
}

export interface CreateMessagePayload {
  text: string;
}

export interface PaginatedMessages {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
}

export const chatService = {
  // Get chat messages with pagination
  getMessages: async (
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedMessages> => {
    const { data } = await apiClient.get<PaginatedMessages>("/chat/messages", {
      params: { page, limit },
    });
    return data;
  },

  // Send message
  sendMessage: async (payload: CreateMessagePayload): Promise<Message> => {
    const { data } = await apiClient.post<Message>("/chat/messages", payload);
    return data;
  },
};
