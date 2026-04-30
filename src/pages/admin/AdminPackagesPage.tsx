import { useEffect, useState, type FormEvent } from "react";
import {
  Check,
  CreditCard,
  Edit2,
  Loader2,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../../components/admin-layout";
import {
  adminPackageService,
  type AdminPackage,
  type PackageInput,
} from "../../services/adminService";

const defaultForm: PackageInput = {
  name: "",
  description: "",
  price_monthly: 0,
  price_annual: 0,
  max_members: 10,
  features: {},
  is_active: true,
};

function PackageCard({
  pkg,
  onEdit,
  onDelete,
}: {
  pkg: AdminPackage;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const features = pkg.features
    ? Object.entries(pkg.features).filter(([, v]) => v)
    : [];

  return (
    <div className={`admin-pkg-card ${!pkg.is_active ? "admin-pkg-card--inactive" : ""}`}>
      <div className="admin-pkg-card__header">
        <div className="admin-pkg-card__icon">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h3 className="admin-pkg-card__name">{pkg.name}</h3>
          {!pkg.is_active && (
            <span className="admin-badge admin-badge--ghost">Inactive</span>
          )}
        </div>
        <div className="admin-pkg-card__actions">
          <button className="admin-icon-btn admin-icon-btn--info" onClick={onEdit}>
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button className="admin-icon-btn admin-icon-btn--danger" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {pkg.description && (
        <p className="admin-pkg-card__desc">{pkg.description}</p>
      )}
      <div className="admin-pkg-card__pricing">
        <div>
          <p className="admin-pkg-card__price-label">Monthly</p>
          <p className="admin-pkg-card__price">
            {pkg.price_monthly === 0 ? "Free" : `৳${pkg.price_monthly}`}
          </p>
        </div>
        <div>
          <p className="admin-pkg-card__price-label">Annual</p>
          <p className="admin-pkg-card__price">
            {pkg.price_annual === 0 ? "Free" : `৳${pkg.price_annual}`}
          </p>
        </div>
        <div>
          <p className="admin-pkg-card__price-label">Max Members</p>
          <p className="admin-pkg-card__price">{pkg.max_members}</p>
        </div>
      </div>
      {features.length > 0 && (
        <ul className="admin-pkg-card__features">
          {features.map(([key]) => (
            <li key={key}>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{key.replace(/_/g, " ")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminPackagesPage() {
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageInput>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    adminPackageService.list().then(setPackages).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (pkg: AdminPackage) => {
    setForm({
      name: pkg.name,
      description: pkg.description ?? "",
      price_monthly: pkg.price_monthly,
      price_annual: pkg.price_annual,
      max_members: pkg.max_members,
      features: pkg.features ?? {},
      is_active: pkg.is_active,
    });
    setEditId(pkg.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await adminPackageService.update(editId, form);
        toast.success("Package updated");
      } else {
        await adminPackageService.create(form);
        toast.success("Package created");
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete package "${name}"?`)) return;
    try {
      await adminPackageService.delete(id);
      toast.success("Package deleted");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <AdminLayout pageTitle="Packages">
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h2 className="admin-page__heading">Subscription Packages</h2>
            <div className="admin-billing-notice">
              <CreditCard className="w-4 h-4" />
              <span>Billing integration coming in Phase 2</span>
            </div>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Package
          </button>
        </div>

        {loading ? (
          <div className="admin-page-loading">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="admin-pkg-grid">
            {packages.length === 0 ? (
              <div className="admin-empty">
                <Package className="w-12 h-12" />
                <p>No packages yet. Create your first plan.</p>
              </div>
            ) : (
              packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onEdit={() => openEdit(pkg)}
                  onDelete={() => handleDelete(pkg.id, pkg.name)}
                />
              ))
            )}
          </div>
        )}

        {/* Package Form Modal */}
        {showForm && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal--wide">
              <div className="admin-modal__header">
                <h3 className="admin-modal__title">
                  {editId ? "Edit Package" : "Create Package"}
                </h3>
                <button className="admin-icon-btn" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form__row">
                  <div className="admin-form__group">
                    <label className="admin-form__label">Name</label>
                    <input
                      className="admin-input"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="admin-form__group">
                    <label className="admin-form__label">Max Members</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.max_members}
                      onChange={(e) => setForm((f) => ({ ...f, max_members: +e.target.value }))}
                      min={1}
                      required
                    />
                  </div>
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Description</label>
                  <input
                    className="admin-input"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__group">
                    <label className="admin-form__label">Monthly Price (৳)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.price_monthly}
                      onChange={(e) => setForm((f) => ({ ...f, price_monthly: +e.target.value }))}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div className="admin-form__group">
                    <label className="admin-form__label">Annual Price (৳)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.price_annual}
                      onChange={(e) => setForm((f) => ({ ...f, price_annual: +e.target.value }))}
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    />
                    {" "}Active (visible to customers)
                  </label>
                </div>
                <div className="admin-modal__actions">
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {editId ? "Save Changes" : "Create Package"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
