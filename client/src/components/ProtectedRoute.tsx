import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../features/hooks";
import { RootState } from "../features/store";

const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  // console.log(isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
