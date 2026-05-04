import { useState, type FormEvent } from "react";
import { Bell, Send, Megaphone } from "lucide-react";
import { AdminLayout } from "../../components/admin-layout";
import { useBroadcastAnnouncement } from "../../hooks/queries/useAdminQueries";
import { Card, CardHeader, CardBody, Input, Button } from "../../components/common";

export function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const broadcast = useBroadcastAnnouncement();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      await broadcast.mutateAsync({ title: title.trim(), body: body.trim() });
      setTitle("");
      setBody("");
    } catch (err: unknown) {
      // Handled by hook
    }
  };

  return (
    <AdminLayout pageTitle="Announcements">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Broadcast Announcement</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Send a system-wide notification to all mess managers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Compose Announcement</h3>
              </div>
            </CardHeader>
            <CardBody>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Title"
                  id="ann-title"
                  placeholder="e.g. Scheduled Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300" htmlFor="ann-body">
                    Message Body
                  </label>
                  <textarea
                    id="ann-body"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                    rows={6}
                    placeholder="Write your announcement here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={broadcast.isPending}
                  disabled={!title.trim() || !body.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to All Managers
                </Button>
              </form>
            </CardBody>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Live Preview</h3>
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 overflow-hidden">
              <div className="h-1 w-full bg-primary/20"></div>
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20">
                        Admin
                      </span>
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-lg">
                        {title || "Your title will appear here"}
                      </h4>
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {body || "Your message body will appear here. Start typing to see the preview live..."}
                    </div>
                    <div className="pt-4 flex items-center justify-between text-xs text-neutral-500">
                      <span>Just now</span>
                      <span className="font-medium text-primary">System Notification</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <div className="p-4 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30 text-sm">
              <div className="flex items-start gap-2">
                <Megaphone className="w-4 h-4 mt-0.5 shrink-0" />
                <p>When you broadcast an announcement, it will be sent immediately to all mess managers as an in-app notification. They will see it the next time they log in or refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
