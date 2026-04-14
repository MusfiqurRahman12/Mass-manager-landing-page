import { MainLayout } from "../components/layout";

export function ExpensesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Expenses
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Track and manage your expenses here.
        </p>
      </div>
    </MainLayout>
  );
}
