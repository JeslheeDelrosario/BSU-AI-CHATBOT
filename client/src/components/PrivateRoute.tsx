// client/src/components/PrivateRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import GlobalLoader from "./GlobalLoader"; // ← NEW: import your branded loader


export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  // Show branded loader during auth check
  if (loading) {
    return <GlobalLoader />;
  }

  // If not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Auth complete + authenticated → show protected content
  return <>{children}</>;
}
