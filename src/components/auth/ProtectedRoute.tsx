
import { Navigate } from "react-router-dom";
import AuthService from "@/services/AuthService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const authService = AuthService.getInstance();
  
  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
