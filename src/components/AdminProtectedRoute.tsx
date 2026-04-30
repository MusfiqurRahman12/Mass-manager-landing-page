import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();

  if (isAdminLoading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
