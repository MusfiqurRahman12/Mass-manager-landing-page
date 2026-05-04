import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Shield,
  X,
} from "lucide-react";
import { MainLayout } from "../components/layout/MainLayout";

import { useTickets, useTicketDetail, useAddTicket } from "../hooks/queries/useTicketQueries";

function StatusIcon({ status }: { status: string }) {
  if (status === "resolved" || status === "closed")
    return <CheckCircle2 className="w-5 h-5" />;
  return <Clock className="w-5 h-5" />;
}

export function TicketsPage() {
  const { data: tickets = [], isLoading: loading } = useTickets();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: detail, isLoading: detailLoading } = useTicketDetail(expandedId);
  const addTicket = useAddTicket();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "general",
    priority: "medium",
  });

  const loadDetail = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addTicket.mutateAsync(form);
      setShowForm(false);
      setForm({ title: "", body: "", category: "general", priority: "medium" });
    } catch (err: unknown) {
      // Error is handled by hook
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Support Tickets
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Submit issues or questions to our admin team
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Ticket"}
          </button>
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 animate-in slide-in-from-top-4 fade-in duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              New Support Ticket
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                  placeholder="Brief summary of your issue"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="bug">Bug Report</option>
                    <option value="billing">Billing</option>
                    <option value="manager_complaint">Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none resize-none"
                  rows={5}
                  placeholder="Describe your issue in detail…"
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium disabled:opacity-70"
                  disabled={addTicket.isPending}
                >
                  {addTicket.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No tickets yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create a new ticket above if you need support.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all hover:shadow-md">
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer select-none"
                  onClick={() => loadDetail(ticket.id)}
                >
                  <div className={`p-2.5 rounded-full ${ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : ticket.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                    <StatusIcon status={ticket.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="capitalize">{ticket.priority}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span>{ticket.reply_count} repl{ticket.reply_count === 1 ? "y" : "ies"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                        ticket.status === 'resolved' || ticket.status === 'closed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : ticket.status === 'in_progress'
                          ? 'bg-primary/10 text-primary dark:text-primary-foreground'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                    <div className="text-gray-400 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full">
                      {expandedId === ticket.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded replies */}
                {expandedId === ticket.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 p-5 animate-in slide-in-from-top-2 fade-in duration-200">
                    {detailLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    ) : detail ? (
                      <div className="space-y-6">
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {detail.body}
                        </div>
                        
                        {detail.replies.length > 0 && (
                          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Replies</h4>
                            {detail.replies.map((r) => (
                              <div
                                key={r.id}
                                className={`p-4 rounded-2xl ${
                                  r.is_admin_reply
                                    ? "bg-primary/5 border-l-4 border-primary"
                                    : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  {r.is_admin_reply ? (
                                    <Shield className="w-4 h-4 text-primary" />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                      {r.author_name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <strong className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {r.author_name}
                                  </strong>
                                  {r.is_admin_reply && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                      Support Team
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed ml-[1.75rem]">
                                  {r.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
