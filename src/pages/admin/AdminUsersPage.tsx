import { useState } from "react";
import { Loader2, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import { formatDistanceToNow } from "../../utils/format.utils";
import { useAdminUsers, useDeleteAdminUser } from "../../hooks/queries/useAdminQueries";

const ROLE_OPTIONS = ["", "manager", "member", "super_admin"];

function roleBadgeColor(role: string): string {
  if (role === "super_admin") return "admin-badge--violet";
  if (role === "manager") return "admin-badge--indigo";
  return "admin-badge--ghost";
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users = [], isLoading: loading, refetch: load } = useAdminUsers({
    role: roleFilter || undefined,
    search: search || undefined
  });

  const deleteUser = useDeleteAdminUser();

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      setDeleteId(null);
    } catch (e: unknown) {
      // Handled by hook
    }
  };

  return (
    <AdminLayout pageTitle="Users">
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__heading">All Users</h2>
          <div className="admin-page__actions">
            <select
              className="admin-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r || "All Roles"}
                </option>
              ))}
            </select>
            <div className="admin-search">
              <Search className="admin-search__icon w-4 h-4" />
              <input
                className="admin-search__input"
                placeholder="Search…"
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
                  <th>User</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-table__empty">
                      <Users className="w-8 h-8" />
                      <span>No users found</span>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-table__name">{u.full_name}</div>
                        <div className="admin-table__sub">{u.email}</div>
                      </td>
                      <td>
                        <span className={`admin-badge ${roleBadgeColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="admin-table__sub">
                        {formatDistanceToNow(new Date(u.created_at))}
                      </td>
                      <td>
                        {u.role !== "super_admin" && (
                          <button
                            className="admin-icon-btn admin-icon-btn--danger"
                            title="Delete user"
                            onClick={() => setDeleteId(u.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {deleteId && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <h3 className="admin-modal__title">Delete User?</h3>
              <p className="admin-modal__body">
                This will permanently delete the user and their data.
              </p>
              <div className="admin-modal__actions">
                <button className="admin-btn admin-btn--ghost" onClick={() => setDeleteId(null)} disabled={deleteUser.isPending}>
                  Cancel
                </button>
                <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(deleteId)} disabled={deleteUser.isPending}>
                  <Trash2 className="w-4 h-4" />
                  {deleteUser.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
