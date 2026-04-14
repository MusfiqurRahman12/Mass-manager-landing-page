import { Badge, Card, LoadingSpinner } from "../components/common";
import { MainLayout } from "../components/layout";
import { useAuth } from "../context";
import { useRequireAuth } from "../hooks";

export function DashboardPage() {
  const { isReady } = useRequireAuth();
  const { user } = useAuth();

  if (!isReady) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            {user?.role === "manager"
              ? "🎯 You are the mess manager"
              : "👥 You are a mess member"}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              label: "Total Meals",
              value: "24",
              change: "+2 today",
              color: "primary",
            },
            {
              label: "Total Expenses",
              value: "₹2,450",
              change: "-₹100",
              color: "warning",
            },
            {
              label: "Your Deposit",
              value: "₹5,000",
              change: "Current month",
              color: "success",
            },
            {
              label: "Balance Due",
              value: "₹1,250",
              change: "To be settled",
              color: "error",
            },
          ].map((item) => (
            <Card key={item.label} className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
                {item.label}
              </p>
              <h3 className="text-2xl font-bold mb-2">{item.value}</h3>
              <Badge variant={item.color as any}>{item.change}</Badge>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <Card className="lg:col-span-2">
            <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">Member added 2 meals</p>
                    <p className="text-sm text-neutral-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              {["Add Meal", "Add Expense", "Add Deposit", "View Report"].map(
                (action) => (
                  <button
                    key={action}
                    className="w-full px-4 py-2 text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-medium"
                  >
                    {action}
                  </button>
                ),
              )}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
