import { useState, type FormEvent } from "react";
import { Bell, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../../components/admin-layout";
import { adminAnnouncementService } from "../../services/adminService";

export function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const res = await adminAnnouncementService.broadcast(title.trim(), body.trim());
      toast.success(res.message);
      setTitle("");
      setBody("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Broadcast failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Announcements">
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__heading">Broadcast Announcement</h2>
          <p className="admin-page__sub">
            Send a system-wide notification to all mess managers.
          </p>
        </div>

        <div className="admin-card admin-card--max-md">
          <div className="admin-card__header">
            <Bell className="w-5 h-5" />
            <h3 className="admin-card__title">Compose Announcement</h3>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__group">
              <label className="admin-form__label" htmlFor="ann-title">
                Title
              </label>
              <input
                id="ann-title"
                className="admin-input"
                placeholder="e.g. Scheduled Maintenance Notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="admin-form__group">
              <label className="admin-form__label" htmlFor="ann-body">
                Message Body
              </label>
              <textarea
                id="ann-body"
                className="admin-textarea"
                rows={6}
                placeholder="Write your announcement here…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            <div className="admin-announcement-preview">
              <p className="admin-form__label">Preview</p>
              <div className="admin-announcement-preview__box">
                <div className="admin-announcement-preview__title">
                  <Bell className="w-4 h-4" />
                  [Admin] {title || "Your title here"}
                </div>
                <p>{body || "Your message will appear here…"}</p>
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary admin-btn--full"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {submitting ? "Sending…" : "Send to All Managers"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
