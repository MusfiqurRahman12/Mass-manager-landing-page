const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
const ADMIN_TOKEN_KEY = "admin_token";

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Overview Stats ─────────────────────────────────────────────────────────

export interface OverviewStats {
  total_messes: number;
  total_users: number;
  total_managers: number;
  total_members: number;
  open_tickets: number;
  in_progress_tickets: number;
  total_tickets: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
}

export const adminStatsService = {
  getOverview: (): Promise<OverviewStats> =>
    fetch(`${API_BASE}/admin/stats/overview`, { headers: getHeaders() }).then((r) =>
      handleResponse<OverviewStats>(r),
    ),

  getActivity: (limit = 20): Promise<ActivityItem[]> =>
    fetch(`${API_BASE}/admin/stats/activity?limit=${limit}`, {
      headers: getHeaders(),
    }).then((r) => handleResponse<ActivityItem[]>(r)),
};

// ── Messes ─────────────────────────────────────────────────────────────────

export interface AdminMess {
  id: string;
  name: string;
  address: string | null;
  manager_name: string;
  manager_email: string;
  manager_id: string;
  member_count: number;
  is_suspended: boolean;
  currency: string;
  created_at: string;
}

export const adminMessService = {
  list: (params?: { search?: string; skip?: number; limit?: number }): Promise<AdminMess[]> => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.limit !== undefined) q.set("limit", String(params.limit));
    return fetch(`${API_BASE}/admin/messes?${q}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminMess[]>(r),
    );
  },
  get: (id: string): Promise<AdminMess> =>
    fetch(`${API_BASE}/admin/messes/${id}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminMess>(r),
    ),
  suspend: (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/messes/${id}/suspend`, {
      method: "PATCH",
      headers: getHeaders(),
    }).then((r) => handleResponse(r)),
  activate: (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/messes/${id}/activate`, {
      method: "PATCH",
      headers: getHeaders(),
    }).then((r) => handleResponse(r)),
  delete: (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/messes/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((r) => handleResponse(r)),
};

// ── Managers ───────────────────────────────────────────────────────────────

export interface AdminManager {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  mess_id: string | null;
  mess_name: string | null;
}

export const adminManagerService = {
  list: (params?: { search?: string }): Promise<AdminManager[]> => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    return fetch(`${API_BASE}/admin/managers?${q}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminManager[]>(r),
    );
  },
  get: (id: string): Promise<AdminManager> =>
    fetch(`${API_BASE}/admin/managers/${id}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminManager>(r),
    ),
};

// ── Users ──────────────────────────────────────────────────────────────────

export interface AdminUserOut {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export const adminUserService = {
  list: (params?: { role?: string; search?: string }): Promise<AdminUserOut[]> => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.search) q.set("search", params.search);
    return fetch(`${API_BASE}/admin/users?${q}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminUserOut[]>(r),
    );
  },
  delete: (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((r) => handleResponse(r)),
};

// ── Tickets ────────────────────────────────────────────────────────────────

export interface AdminTicket {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  submitter_name: string;
  submitter_email: string;
  mess_id: string | null;
  created_at: string;
  updated_at: string;
  reply_count: number;
}

export interface TicketReply {
  id: string;
  author_name: string;
  body: string;
  is_admin_reply: boolean;
  created_at: string;
}

export interface AdminTicketDetail extends AdminTicket {
  replies: TicketReply[];
}

export const adminTicketService = {
  list: (params?: {
    ticket_status?: string;
    category?: string;
    priority?: string;
  }): Promise<AdminTicket[]> => {
    const q = new URLSearchParams();
    if (params?.ticket_status) q.set("ticket_status", params.ticket_status);
    if (params?.category) q.set("category", params.category);
    if (params?.priority) q.set("priority", params.priority);
    return fetch(`${API_BASE}/admin/tickets?${q}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminTicket[]>(r),
    );
  },
  get: (id: string): Promise<AdminTicketDetail> =>
    fetch(`${API_BASE}/admin/tickets/${id}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminTicketDetail>(r),
    ),
  reply: (id: string, body: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/tickets/${id}/reply`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ body }),
    }).then((r) => handleResponse(r)),
  updateStatus: (id: string, status: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/tickets/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then((r) => handleResponse(r)),
};

// ── Packages ───────────────────────────────────────────────────────────────

export interface AdminPackage {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  max_members: number;
  features: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface PackageInput {
  name: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  max_members: number;
  features?: Record<string, unknown>;
  is_active: boolean;
}

export const adminPackageService = {
  list: (): Promise<AdminPackage[]> =>
    fetch(`${API_BASE}/admin/packages`, { headers: getHeaders() }).then((r) =>
      handleResponse<AdminPackage[]>(r),
    ),
  create: (data: PackageInput): Promise<AdminPackage> =>
    fetch(`${API_BASE}/admin/packages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<AdminPackage>(r)),
  update: (id: string, data: PackageInput): Promise<AdminPackage> =>
    fetch(`${API_BASE}/admin/packages/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<AdminPackage>(r)),
  delete: (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/packages/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((r) => handleResponse(r)),
};

// ── Announcements ──────────────────────────────────────────────────────────

export const adminAnnouncementService = {
  broadcast: (title: string, body: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/admin/announcements`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title, body }),
    }).then((r) => handleResponse(r)),
};

// ── Audit Log ──────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export const adminAuditService = {
  list: (params?: { action?: string; entity_type?: string; skip?: number; limit?: number }): Promise<AuditLogEntry[]> => {
    const q = new URLSearchParams();
    if (params?.action) q.set("action", params.action);
    if (params?.entity_type) q.set("entity_type", params.entity_type);
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.limit !== undefined) q.set("limit", String(params.limit));
    return fetch(`${API_BASE}/admin/audit?${q}`, { headers: getHeaders() }).then((r) =>
      handleResponse<AuditLogEntry[]>(r),
    );
  },
};
