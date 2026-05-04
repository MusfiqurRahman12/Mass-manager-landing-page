import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { useAuth } from "./context";
import { LoadingSpinner } from "./components/common/Loader";
import { queryClient } from "./lib/queryClient";

// Lazy-loaded public & user pages
const ChatPage = lazy(() => import("./pages/ChatPage").then(m => ({ default: m.ChatPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const DepositsPage = lazy(() => import("./pages/DepositsPage").then(m => ({ default: m.DepositsPage })));
const ExpenseSummaryPage = lazy(() => import("./pages/ExpenseSummaryPage").then(m => ({ default: m.ExpenseSummaryPage })));
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const HomeRentExpensePage = lazy(() => import("./pages/HomeRentExpensePage").then(m => ({ default: m.HomeRentExpensePage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const MealExpensesPage = lazy(() => import("./pages/MealExpensesPage").then(m => ({ default: m.MealExpensesPage })));
const MealsPage = lazy(() => import("./pages/MealsPage").then(m => ({ default: m.MealsPage })));
const MembersPage = lazy(() => import("./pages/MembersPage").then(m => ({ default: m.MembersPage })));
const MonthDetailsPage = lazy(() => import("./pages/MonthDetailsPage").then(m => ({ default: m.MonthDetailsPage })));
const MonthHistoryPage = lazy(() => import("./pages/MonthHistoryPage").then(m => ({ default: m.MonthHistoryPage })));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage").then(m => ({ default: m.OnboardingPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const TicketsPage = lazy(() => import("./pages/TicketsPage").then(m => ({ default: m.TicketsPage })));
const UtilityExpensesPage = lazy(() => import("./pages/UtilityExpensesPage").then(m => ({ default: m.UtilityExpensesPage })));

// Lazy-loaded admin pages
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage").then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminMessesPage = lazy(() => import("./pages/admin/AdminMessesPage").then(m => ({ default: m.AdminMessesPage })));
const AdminMessDetailPage = lazy(() => import("./pages/admin/AdminMessDetailPage").then(m => ({ default: m.AdminMessDetailPage })));
const AdminManagersPage = lazy(() => import("./pages/admin/AdminManagersPage").then(m => ({ default: m.AdminManagersPage })));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminTicketsPage = lazy(() => import("./pages/admin/AdminTicketsPage").then(m => ({ default: m.AdminTicketsPage })));
const AdminTicketDetailPage = lazy(() => import("./pages/admin/AdminTicketDetailPage").then(m => ({ default: m.AdminTicketDetailPage })));
const AdminPackagesPage = lazy(() => import("./pages/admin/AdminPackagesPage").then(m => ({ default: m.AdminPackagesPage })));
const AdminAnnouncementsPage = lazy(() => import("./pages/admin/AdminAnnouncementsPage").then(m => ({ default: m.AdminAnnouncementsPage })));
const AdminAuditLogPage = lazy(() => import("./pages/admin/AdminAuditLogPage").then(m => ({ default: m.AdminAuditLogPage })));

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
    <QueryClientProvider client={queryClient}>
      <Router>
      <AdminAuthProvider>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
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
        </Suspense>
      </AdminAuthProvider>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
