import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Loader2, RefreshCw, Ticket } from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import { formatDistanceToNow } from "../../utils/format.utils";
import { useAdminTickets } from "../../hooks/queries/useAdminQueries";

const STATUS_OPTIONS = ["", "open", "in_progress", "resolved", "closed"];
const CATEGORY_OPTIONS = ["", "bug", "billing", "manager_complaint", "general"];
const PRIORITY_OPTIONS = ["", "low", "medium", "high"];

function statusBadge(status: string): string {
  if (status === "open") return "admin-badge--amber";
  if (status === "in_progress") return "admin-badge--indigo";
  if (status === "resolved") return "admin-badge--success";
  return "admin-badge--ghost";
}

function priorityBadge(priority: string): string {
  if (priority === "high") return "admin-badge--danger";
  if (priority === "medium") return "admin-badge--amber";
  return "admin-badge--ghost";
}

export function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const navigate = useNavigate();

  const { data: tickets = [], isLoading: loading, refetch: load } = useAdminTickets({
    ticket_status: statusFilter || undefined,
    category: categoryFilter || undefined,
    priority: priorityFilter || undefined,
  });

  return (
    <AdminLayout pageTitle="Tickets">
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__heading">Support Tickets</h2>
          <div className="admin-page__actions">
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
            </select>
            <select className="admin-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
            </select>
            <select className="admin-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p || "All Priorities"}</option>)}
            </select>
            <button className="admin-btn admin-btn--ghost" onClick={() => load()}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-page-loading">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>From</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Replies</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-table__empty">
                      <Ticket className="w-8 h-8" />
                      <span>No tickets found</span>
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="admin-table__name">{t.title}</div>
                      </td>
                      <td>
                        <div className="admin-table__name">{t.submitter_name}</div>
                        <div className="admin-table__sub">{t.submitter_email}</div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--ghost">{t.category}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${priorityBadge(t.priority)}`}>{t.priority}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${statusBadge(t.status)}`}>{t.status.replace("_", " ")}</span>
                      </td>
                      <td>{t.reply_count}</td>
                      <td className="admin-table__sub">
                        {formatDistanceToNow(new Date(t.created_at))}
                      </td>
                      <td>
                        <button
                          className="admin-icon-btn admin-icon-btn--info"
                          title="View ticket"
                          onClick={() => navigate(`/admin/tickets/${t.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
