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

export interface CreateAndAddMemberPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface TransferManagerPayload {
  user_id: string;
}

export const memberService = {
  // Get members (optionally including inactive ones)
  getMembers: async (includeInactive: boolean = false): Promise<Member[]> => {
    const { data } = await apiClient.get<Member[]>(`/members?include_inactive=${includeInactive}`);
    return data;
  },

  // Add new member by email
  addMember: async (payload: AddMemberPayload): Promise<Member> => {
    const { data } = await apiClient.post<Member>("/members", payload);
    return data;
  },

  // Create new user and add to mess
  createAndAddMember: async (payload: CreateAndAddMemberPayload): Promise<Member> => {
    const { data } = await apiClient.post<Member>("/members/create-and-add", payload);
    return data;
  },

  // Remove member
  removeMember: async (userId: string): Promise<void> => {
    await apiClient.delete(`/members/${userId}`);
  },

  // Transfer manager role to another member
  transferManager: async (payload: TransferManagerPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.put<{ message: string }>(
      "/members/transfer-manager",
      payload,
    );
    return data;
  },

  // Update member status (active/inactive)
  updateStatus: async (userId: string, is_active: boolean): Promise<Member> => {
    const { data } = await apiClient.patch<Member>(`/members/${userId}/status`, { is_active });
    return data;
  },
};
