import apiClient from "./apiClient";

export interface Member {
  user_id: string;
  email: string;
  full_name: string;
  joined_at: string;
  is_active: boolean;
  role: "member" | "manager";
}

export interface AddMemberPayload {
  email: string;
}

export interface TransferManagerPayload {
  user_id: string;
}

export const memberService = {
  // Get all members
  getMembers: async (): Promise<Member[]> => {
    const { data } = await apiClient.get<Member[]>("/members");
    return data;
  },

  // Add new member by email
  addMember: async (payload: AddMemberPayload): Promise<Member> => {
    const { data } = await apiClient.post<Member>("/members", payload);
    return data;
  },

  // Remove member
  removeMember: async (userId: string): Promise<void> => {
    await apiClient.delete(`/members/${userId}`);
  },

  // Transfer manager role to another member
  transferManager: async (payload: TransferManagerPayload): Promise<any> => {
    const { data } = await apiClient.put<any>(
      "/members/transfer-manager",
      payload,
    );
    return data;
  },
};
