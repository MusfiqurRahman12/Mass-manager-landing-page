import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "./common";
import { useAuth } from "../context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireManager?: boolean;
}

export function ProtectedRoute({
  children,
  requireManager = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if user is not in any mess
  // Don't redirect if already on onboarding page
  if (!user?.mess_id && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireManager && user?.role !== "manager") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
