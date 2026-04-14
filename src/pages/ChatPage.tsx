import { MainLayout } from "../components/layout";

export function ChatPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Chat
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Chat with mess members here.
        </p>
      </div>
    </MainLayout>
  );
}
