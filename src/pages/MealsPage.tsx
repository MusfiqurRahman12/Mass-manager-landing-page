import { MainLayout } from "../components/layout";

export function MealsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Meals
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your daily meals here.
        </p>
      </div>
    </MainLayout>
  );
}
