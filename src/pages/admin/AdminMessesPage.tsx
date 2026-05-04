import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Loader2,
  Search,
  Trash2,
  Eye,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import { type AdminMess } from "../../services/adminService";
import { formatDistanceToNow } from "../../utils/format.utils";
import { useAdminMesses, useSuspendMess, useActivateMess, useDeleteAdminMess } from "../../hooks/queries/useAdminQueries";

function StatusBadge({ suspended }: { suspended: boolean }) {
  return (
    <span className={`admin-badge ${suspended ? "admin-badge--danger" : "admin-badge--success"}`}>
      {suspended ? "Suspended" : "Active"}
    </span>
  );
}

export function AdminMessesPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: messes = [], isLoading: loading, refetch: load } = useAdminMesses({ search: search || undefined });
  
  const suspendMess = useSuspendMess();
  const activateMess = useActivateMess();
  const deleteMess = useDeleteAdminMess();

  const handleSuspend = async (mess: AdminMess) => {
    try {
      if (mess.is_suspended) {
        await activateMess.mutateAsync(mess.id);
      } else {
        await suspendMess.mutateAsync(mess.id);
      }
    } catch (e: unknown) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMess.mutateAsync(id);
      setDeleteId(null);
    } catch (e: unknown) {
      // Error handled by hook
    }
  };

  return (
    <AdminLayout pageTitle="Messes">
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__heading">Mess Management</h2>
          <div className="admin-page__actions">
            <div className="admin-search">
              <Search className="admin-search__icon w-4 h-4" />
              <input
                className="admin-search__input"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
                  <th>Mess Name</th>
                  <th>Manager</th>
                  <th>Members</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-table__empty">
                      <Building2 className="w-8 h-8" />
                      <span>No messes found</span>
                    </td>
                  </tr>
                ) : (
                  messes.map((mess) => (
                    <tr key={mess.id}>
                      <td>
                        <div className="admin-table__name">{mess.name}</div>
                        {mess.address && (
                          <div className="admin-table__sub">{mess.address}</div>
                        )}
                      </td>
                      <td>
                        <div className="admin-table__name">{mess.manager_name}</div>
                        <div className="admin-table__sub">{mess.manager_email}</div>
                      </td>
                      <td>{mess.member_count}</td>
                      <td>
                        <span className="admin-badge admin-badge--ghost">{mess.currency}</span>
                      </td>
                      <td>
                        <StatusBadge suspended={mess.is_suspended} />
                      </td>
                      <td className="admin-table__sub">
                        {formatDistanceToNow(new Date(mess.created_at))}
                      </td>
                      <td>
                        <div className="admin-table__actions">
                          <button
                            className="admin-icon-btn admin-icon-btn--info"
                            title="View detail"
                            onClick={() => navigate(`/admin/messes/${mess.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className={`admin-icon-btn ${mess.is_suspended ? "admin-icon-btn--success" : "admin-icon-btn--warning"}`}
                            title={mess.is_suspended ? "Activate" : "Suspend"}
                            onClick={() => handleSuspend(mess)}
                            disabled={suspendMess.isPending || activateMess.isPending}
                          >
                            {mess.is_suspended ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            className="admin-icon-btn admin-icon-btn--danger"
                            title="Delete mess"
                            onClick={() => setDeleteId(mess.id)}
                            disabled={deleteMess.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <h3 className="admin-modal__title">Delete Mess?</h3>
              <p className="admin-modal__body">
                This will permanently delete the mess and all its data. This
                action cannot be undone.
              </p>
              <div className="admin-modal__actions">
                <button
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="admin-btn admin-btn--danger"
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleteMess.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
