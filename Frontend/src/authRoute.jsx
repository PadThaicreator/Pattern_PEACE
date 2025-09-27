
import { Navigate, Outlet } from "react-router-dom";

export default function AuthRoute() {
  const token = localStorage.getItem("jwt");

  if (!token) {
 
    return <Navigate to="/login" replace />;
  }

  
  return <Outlet />;
}