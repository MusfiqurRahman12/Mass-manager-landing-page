import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Loader2, Mail, Users } from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import { adminMessService, type AdminMess } from "../../services/adminService";
import { toast } from "sonner";

export function AdminMessDetailPage() {
  const { messId } = useParams<{ messId: string }>();
  const [mess, setMess] = useState<AdminMess | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!messId) return;
    adminMessService
      .get(messId)
      .then(setMess)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [messId]);

  if (loading) {
    return (
      <AdminLayout pageTitle="Mess Detail">
        <div className="admin-page-loading">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!mess) {
    return (
      <AdminLayout pageTitle="Mess Detail">
        <div className="admin-page">
          <p className="admin-empty">Mess not found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Mess Detail">
      <div className="admin-page">
        <button
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => navigate("/admin/messes")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Messes
        </button>

        <div className="admin-detail-header">
          <div className="admin-detail-header__icon">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="admin-page__heading">{mess.name}</h2>
            {mess.address && (
              <p className="admin-page__sub">{mess.address}</p>
            )}
          </div>
          <span className={`admin-badge ${mess.is_suspended ? "admin-badge--danger" : "admin-badge--success"}`}>
            {mess.is_suspended ? "Suspended" : "Active"}
          </span>
        </div>

        <div className="admin-detail-grid">
          <div className="admin-card">
            <div className="admin-card__header">
              <Users className="w-5 h-5" />
              <h3 className="admin-card__title">Manager</h3>
            </div>
            <div className="admin-card__body">
              <p className="admin-detail__label">Name</p>
              <p className="admin-detail__value">{mess.manager_name}</p>
              <p className="admin-detail__label mt-3">Email</p>
              <div className="admin-detail__email">
                <Mail className="w-4 h-4" />
                <span>{mess.manager_email}</span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <Building2 className="w-5 h-5" />
              <h3 className="admin-card__title">Details</h3>
            </div>
            <div className="admin-card__body">
              <div className="admin-detail__row">
                <span className="admin-detail__label">Members</span>
                <span className="admin-detail__value">{mess.member_count}</span>
              </div>
              <div className="admin-detail__row">
                <span className="admin-detail__label">Currency</span>
                <span className="admin-badge admin-badge--ghost">{mess.currency}</span>
              </div>
              <div className="admin-detail__row">
                <span className="admin-detail__label">Mess ID</span>
                <span className="admin-detail__mono">{mess.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
