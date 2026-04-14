import { MainLayout } from "../components/layout";

export function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Reports
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          View mess reports here.
        </p>
      </div>
    </MainLayout>
  );
}
