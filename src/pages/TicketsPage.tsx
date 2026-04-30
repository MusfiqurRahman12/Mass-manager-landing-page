import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Shield,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MainLayout } from "../components/layout/MainLayout";
import { useAuth } from "../context";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("token");
}
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const e = await res.json().catch(() => ({ detail: "Error" }));
    throw new Error(e.detail);
  }
  return res.json();
}

interface TicketReply {
  id: string;
  author_name: string;
  body: string;
  is_admin_reply: boolean;
  created_at: string;
}

interface TicketOut {
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

interface TicketDetail extends TicketOut {
  replies: TicketReply[];
}

function statusColor(status: string) {
  if (status === "open") return "var(--color-amber, #f59e0b)";
  if (status === "in_progress") return "var(--primary)";
  if (status === "resolved") return "#22c55e";
  return "#6b7280";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "resolved" || status === "closed")
    return <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />;
  return <Clock className="w-4 h-4" style={{ color: statusColor(status) }} />;
}

export function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // New ticket form state
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "general",
    priority: "medium",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = () => {
    setLoading(true);
    req<TicketOut[]>(`${API_BASE}/api/v1/tickets`, { headers: authHeaders() })
      .then(setTickets)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, []);

  const loadDetail = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetail(null);
    setDetailLoading(true);
    req<TicketDetail>(`${API_BASE}/api/v1/tickets/${id}`, { headers: authHeaders() })
      .then(setDetail)
      .catch((e) => toast.error(e.message))
      .finally(() => setDetailLoading(false));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await req(`${API_BASE}/api/v1/tickets`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...form, mess_id: user?.mess_id }),
      });
      toast.success("Ticket submitted successfully!");
      setShowForm(false);
      setForm({ title: "", body: "", category: "general", priority: "medium" });
      loadTickets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
              Support Tickets
            </h1>
            <p style={{ margin: "0.25rem 0 0", opacity: 0.6, fontSize: "0.875rem" }}>
              Submit issues or questions to our admin team
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Ticket"}
          </button>
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: "1.5rem", padding: "1.5rem" }}>
            <h2
              style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}
            >
              <MessageSquare className="w-4 h-4" style={{ display: "inline", marginRight: "0.5rem" }} />
              New Support Ticket
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  placeholder="Brief summary of your issue"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="bug">Bug Report</option>
                    <option value="billing">Billing</option>
                    <option value="manager_complaint">Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Describe your issue in detail…"
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket List */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <MessageSquare style={{ width: 48, height: 48, margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ opacity: 0.6 }}>No tickets yet. Create one above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem 1.25rem",
                    cursor: "pointer",
                  }}
                  onClick={() => loadDetail(ticket.id)}
                >
                  <StatusIcon status={ticket.status} />
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <p style={{ fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ticket.title}
                    </p>
                    <p style={{ margin: "0.2rem 0 0", opacity: 0.5, fontSize: "0.8rem" }}>
                      {ticket.category} • {ticket.priority} priority •{" "}
                      {ticket.reply_count} repl{ticket.reply_count === 1 ? "y" : "ies"}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: `${statusColor(ticket.status)}20`,
                      color: statusColor(ticket.status),
                    }}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                  {expandedId === ticket.id ? (
                    <ChevronUp className="w-4 h-4" style={{ opacity: 0.5 }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ opacity: 0.5 }} />
                  )}
                </div>

                {/* Expanded replies */}
                {expandedId === ticket.id && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "1.25rem" }}>
                    {detailLoading ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : detail ? (
                      <>
                        <p style={{ opacity: 0.7, marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                          {detail.body}
                        </p>
                        {detail.replies.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                            {detail.replies.map((r) => (
                              <div
                                key={r.id}
                                style={{
                                  padding: "0.75rem 1rem",
                                  borderRadius: "0.5rem",
                                  background: r.is_admin_reply
                                    ? "var(--primary)15"
                                    : "var(--neutral-100, #f5f5f5)",
                                  borderLeft: r.is_admin_reply
                                    ? "3px solid var(--primary)"
                                    : "3px solid transparent",
                                }}
                              >
                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                                  {r.is_admin_reply && <Shield className="w-3 h-3" style={{ color: "var(--primary)" }} />}
                                  <strong style={{ fontSize: "0.85rem" }}>{r.author_name}</strong>
                                  {r.is_admin_reply && (
                                    <span style={{ fontSize: "0.7rem", background: "var(--primary)", color: "#fff", padding: "0 6px", borderRadius: "9999px" }}>
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.8 }}>{r.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
