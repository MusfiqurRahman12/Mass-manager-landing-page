import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { useAuth } from "./context";
import {
  ChatPage,
  DashboardPage,
  DepositsPage,
  ExpenseSummaryPage,
  HomePage,
  HomeRentExpensePage,
  LoginPage,
  MealExpensesPage,
  MealsPage,
  MembersPage,
  MonthDetailsPage,
  MonthHistoryPage,
  NotificationsPage,
  OnboardingPage,
  RegisterPage,
  ReportsPage,
  SettingsPage,
  TicketsPage,
  UtilityExpensesPage,
} from "./pages";
import {
  AdminLoginPage,
  AdminDashboardPage,
  AdminMessesPage,
  AdminMessDetailPage,
  AdminManagersPage,
  AdminUsersPage,
  AdminTicketsPage,
  AdminTicketDetailPage,
  AdminPackagesPage,
  AdminAnnouncementsPage,
  AdminAuditLogPage,
} from "./pages/admin";

// Onboarding route wrapper - only accessible if user doesn't have a mess
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if user already has a mess
  if (user?.mess_id) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* ── Public Routes ─────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Onboarding Route ──────────────────────────────── */}
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            }
          />

          {/* ── Protected Routes ──────────────────────────────── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/meals" element={<ProtectedRoute><MealsPage /></ProtectedRoute>} />
          <Route path="/expense-summary" element={<ProtectedRoute requireManager><ExpenseSummaryPage /></ProtectedRoute>} />
          <Route path="/meal-expenses" element={<ProtectedRoute><MealExpensesPage /></ProtectedRoute>} />
          <Route path="/home-rent" element={<ProtectedRoute requireManager><HomeRentExpensePage /></ProtectedRoute>} />
          <Route path="/utility-expenses" element={<ProtectedRoute requireManager><UtilityExpensesPage /></ProtectedRoute>} />
          <Route path="/deposits" element={<ProtectedRoute><DepositsPage /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute requireManager><MembersPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/month-history" element={<ProtectedRoute><MonthHistoryPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/months/:monthId" element={<ProtectedRoute><MonthDetailsPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />

          {/* ── Admin Routes (/admin/*) ────────────────────────── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
          <Route path="/admin/messes" element={<AdminProtectedRoute><AdminMessesPage /></AdminProtectedRoute>} />
          <Route path="/admin/messes/:messId" element={<AdminProtectedRoute><AdminMessDetailPage /></AdminProtectedRoute>} />
          <Route path="/admin/managers" element={<AdminProtectedRoute><AdminManagersPage /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
          <Route path="/admin/tickets" element={<AdminProtectedRoute><AdminTicketsPage /></AdminProtectedRoute>} />
          <Route path="/admin/tickets/:ticketId" element={<AdminProtectedRoute><AdminTicketDetailPage /></AdminProtectedRoute>} />
          <Route path="/admin/packages" element={<AdminProtectedRoute><AdminPackagesPage /></AdminProtectedRoute>} />
          <Route path="/admin/announcements" element={<AdminProtectedRoute><AdminAnnouncementsPage /></AdminProtectedRoute>} />
          <Route path="/admin/audit-log" element={<AdminProtectedRoute><AdminAuditLogPage /></AdminProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ── Catch-all ────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
