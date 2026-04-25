import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
  UtilityExpensesPage,
} from "./pages";

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
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Onboarding Route - only for users without a mess */}
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <OnboardingPage />
            </OnboardingRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meals"
          element={
            <ProtectedRoute>
              <MealsPage />
            </ProtectedRoute>
          }
        />

        {/* New Expense Module Routes */}
        <Route
          path="/expense-summary"
          element={
            <ProtectedRoute>
              <ExpenseSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-expenses"
          element={
            <ProtectedRoute>
              <MealExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home-rent"
          element={
            <ProtectedRoute requireManager>
              <HomeRentExpensePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/utility-expenses"
          element={
            <ProtectedRoute requireManager>
              <UtilityExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposits"
          element={
            <ProtectedRoute>
              <DepositsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute requireManager>
              <MembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/month-history"
          element={
            <ProtectedRoute>
              <MonthHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/months/:monthId"
          element={
            <ProtectedRoute>
              <MonthDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
