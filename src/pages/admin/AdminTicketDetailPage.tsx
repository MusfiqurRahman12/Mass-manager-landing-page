import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, MessageSquare, Send, Shield } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../../components/admin-layout";
import {
  adminTicketService,
  type AdminTicketDetail,
} from "../../services/adminService";
import { formatDistanceToNow } from "../../utils/format.utils";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

function statusBadge(status: string): string {
  if (status === "open") return "admin-badge--amber";
  if (status === "in_progress") return "admin-badge--indigo";
  if (status === "resolved") return "admin-badge--success";
  return "admin-badge--ghost";
}

export function AdminTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<AdminTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    if (!ticketId) return;
    adminTicketService
      .get(ticketId)
      .then(setTicket)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [ticketId]);

  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticketId || !replyBody.trim()) return;
    setSubmitting(true);
    try {
      await adminTicketService.reply(ticketId, replyBody.trim());
      toast.success("Reply posted");
      setReplyBody("");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return;
    try {
      await adminTicketService.updateStatus(ticketId, newStatus);
      toast.success("Status updated");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Ticket Detail">
        <div className="admin-page-loading">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout pageTitle="Ticket Detail">
        <div className="admin-page">
          <p className="admin-empty">Ticket not found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Ticket Detail">
      <div className="admin-page">
        <button
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => navigate("/admin/tickets")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </button>

        <div className="admin-ticket-header">
          <h2 className="admin-page__heading">{ticket.title}</h2>
          <div className="admin-ticket-header__meta">
            <span className={`admin-badge ${statusBadge(ticket.status)}`}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className="admin-badge admin-badge--ghost">{ticket.category}</span>
            <span className="admin-badge admin-badge--ghost">{ticket.priority} priority</span>
            <select
              className="admin-select"
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-ticket-submitter">
          <p>
            <strong>From:</strong> {ticket.submitter_name} ({ticket.submitter_email})
          </p>
          <p className="admin-table__sub">
            Submitted {formatDistanceToNow(new Date(ticket.created_at))}
          </p>
        </div>

        {/* Original message */}
        <div className="admin-ticket-message">
          <p>{ticket.body}</p>
        </div>

        {/* Reply thread */}
        <div className="admin-card">
          <div className="admin-card__header">
            <MessageSquare className="w-5 h-5" />
            <h3 className="admin-card__title">
              Conversation ({ticket.replies.length})
            </h3>
          </div>
          <div className="admin-ticket-thread">
            {ticket.replies.length === 0 ? (
              <p className="admin-empty">No replies yet.</p>
            ) : (
              ticket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`admin-ticket-reply ${reply.is_admin_reply ? "admin-ticket-reply--admin" : ""}`}
                >
                  <div className="admin-ticket-reply__header">
                    {reply.is_admin_reply && (
                      <Shield className="w-3 h-3 text-indigo-400" />
                    )}
                    <strong>{reply.author_name}</strong>
                    <span className="admin-table__sub">
                      {formatDistanceToNow(new Date(reply.created_at))}
                    </span>
                    {reply.is_admin_reply && (
                      <span className="admin-badge admin-badge--indigo admin-badge--xs">Admin</span>
                    )}
                  </div>
                  <p className="admin-ticket-reply__body">{reply.body}</p>
                </div>
              ))
            )}
          </div>

          {/* Reply form */}
          <form className="admin-ticket-reply-form" onSubmit={handleReply}>
            <textarea
              className="admin-textarea"
              rows={4}
              placeholder="Write your reply…"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              required
            />
            <div className="admin-ticket-reply-form__actions">
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Post Reply</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
