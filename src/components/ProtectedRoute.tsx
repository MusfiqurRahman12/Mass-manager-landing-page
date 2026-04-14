import React from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common";
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

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireManager && user?.role !== "manager") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
