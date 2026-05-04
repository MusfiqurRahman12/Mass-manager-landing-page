import { useState } from "react";
import { Loader2, RefreshCw, Search, UserSquare2 } from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import { formatDistanceToNow } from "../../utils/format.utils";
import { useAdminManagers } from "../../hooks/queries/useAdminQueries";

export function AdminManagersPage() {
  const [search, setSearch] = useState("");
  const { data: managers = [], isLoading: loading, refetch: load } = useAdminManagers({ search: search || undefined });

  return (
    <AdminLayout pageTitle="Managers">
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__heading">Manager Directory</h2>
          <div className="admin-page__actions">
            <div className="admin-search">
              <Search className="admin-search__icon w-4 h-4" />
              <input
                className="admin-search__input"
                placeholder="Search name or email…"
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
                  <th>Manager</th>
                  <th>Mess</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {managers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="admin-table__empty">
                      <UserSquare2 className="w-8 h-8" />
                      <span>No managers found</span>
                    </td>
                  </tr>
                ) : (
                  managers.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="admin-table__name">{m.full_name}</div>
                        <div className="admin-table__sub">{m.email}</div>
                      </td>
                      <td>
                        {m.mess_name ? (
                          <>
                            <div className="admin-table__name">{m.mess_name}</div>
                            <div className="admin-table__sub">{m.mess_id}</div>
                          </>
                        ) : (
                          <span className="admin-badge admin-badge--ghost">No mess</span>
                        )}
                      </td>
                      <td className="admin-table__sub">
                        {formatDistanceToNow(new Date(m.created_at))}
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
