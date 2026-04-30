import { useEffect, useState } from "react";
import { ClipboardList, Loader2, RefreshCw, Search } from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import { adminAuditService, type AuditLogEntry } from "../../services/adminService";
import { toast } from "sonner";
import { formatDistanceToNow } from "../../utils/format.utils";

function actionBadge(action: string): string {
  if (action.includes("DELETE")) return "admin-badge--danger";
  if (action.includes("SUSPEND")) return "admin-badge--warning";
  if (action.includes("ACTIVAT") || action.includes("CREATE")) return "admin-badge--success";
  return "admin-badge--indigo";
}

export function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const load = () => {
    setLoading(true);
    adminAuditService
      .list({
        action: actionFilter || undefined,
        entity_type: entityFilter || undefined,
        limit: 100,
      })
      .then(setLogs)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [actionFilter, entityFilter]);

  return (
    <AdminLayout pageTitle="Audit Log">
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__heading">Audit Log</h2>
          <div className="admin-page__actions">
            <div className="admin-search">
              <Search className="admin-search__icon w-4 h-4" />
              <input
                className="admin-search__input"
                placeholder="Filter by action…"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              />
            </div>
            <input
              className="admin-search__input"
              placeholder="Entity type…"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              style={{ maxWidth: "140px" }}
            />
            <button className="admin-btn admin-btn--ghost" onClick={load}>
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
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Actor ID</th>
                  <th>Changes</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table__empty">
                      <ClipboardList className="w-8 h-8" />
                      <span>No audit logs found</span>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className={`admin-badge ${actionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        {log.entity_type && (
                          <div className="admin-table__name">{log.entity_type}</div>
                        )}
                        {log.entity_id && (
                          <div className="admin-table__sub">{log.entity_id.slice(0, 8)}…</div>
                        )}
                      </td>
                      <td className="admin-table__sub">
                        {log.actor_id?.slice(0, 8)}…
                      </td>
                      <td>
                        {log.changes ? (
                          <code className="admin-table__code">
                            {JSON.stringify(log.changes)}
                          </code>
                        ) : (
                          <span className="admin-table__sub">—</span>
                        )}
                      </td>
                      <td className="admin-table__sub">
                        {formatDistanceToNow(new Date(log.created_at))}
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
