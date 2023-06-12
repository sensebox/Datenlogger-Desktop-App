import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-provider";

interface ViewProps {
  children: React.ReactNode | React.ReactNode[];
}

export default function ProtectedRoute({ children }: ViewProps): any {
  const { signInResponse } = useAuth();
  const location = useLocation();

  if (signInResponse?.code !== "Authorized" || signInResponse === null) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
