import { useEffect, useState } from "react";
import {
  Building2,
  Loader2,
  MessageSquare,
  Package,
  UserSquare2,
  Users,
  Activity,
} from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import {
  adminStatsService,
  type OverviewStats,
  type ActivityItem,
} from "../../services/adminService";
import { formatDistanceToNow } from "../../utils/format.utils";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
}) {
  return (
    <div className={`admin-stat-card admin-stat-card--${color}`}>
      <div className="admin-stat-card__icon">
        <Icon className="w-6 h-6" />
      </div>
      <div className="admin-stat-card__body">
        <p className="admin-stat-card__label">{label}</p>
        <p className="admin-stat-card__value">{value}</p>
        {sub && <p className="admin-stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}

function actionBadge(action: string): string {
  if (action.includes("DELETE")) return "admin-badge--danger";
  if (action.includes("SUSPEND")) return "admin-badge--warning";
  if (action.includes("ACTIVAT")) return "admin-badge--success";
  return "admin-badge--info";
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminStatsService.getOverview(),
      adminStatsService.getActivity(15),
    ])
      .then(([s, a]) => {
        setStats(s);
        setActivity(a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <div className="admin-page-loading">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__heading">Platform Overview</h2>
          <p className="admin-page__sub">Real-time platform metrics</p>
        </div>

        {/* KPI Grid */}
        <div className="admin-stats-grid">
          <StatCard label="Total Messes" value={stats?.total_messes ?? 0} icon={Building2} color="indigo" />
          <StatCard label="Total Users" value={stats?.total_users ?? 0} icon={Users} color="violet" />
          <StatCard label="Managers" value={stats?.total_managers ?? 0} icon={UserSquare2} color="cyan" />
          <StatCard label="Members" value={stats?.total_members ?? 0} icon={Users} color="teal" />
          <StatCard
            label="Open Tickets"
            value={stats?.open_tickets ?? 0}
            icon={MessageSquare}
            color="amber"
            sub={`${stats?.in_progress_tickets ?? 0} in progress`}
          />
          <StatCard label="Total Tickets" value={stats?.total_tickets ?? 0} icon={Package} color="rose" />
        </div>

        {/* Activity Feed */}
        <div className="admin-card">
          <div className="admin-card__header">
            <Activity className="w-5 h-5" />
            <h3 className="admin-card__title">Recent Activity</h3>
          </div>
          <div className="admin-activity-list">
            {activity.length === 0 ? (
              <p className="admin-empty">No activity yet.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="admin-activity-item">
                  <span className={`admin-badge ${actionBadge(item.action)}`}>
                    {item.action}
                  </span>
                  <span className="admin-activity-item__entity">
                    {item.entity_type} {item.entity_id?.slice(0, 8)}…
                  </span>
                  <span className="admin-activity-item__time">
                    {formatDistanceToNow(new Date(item.created_at))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
